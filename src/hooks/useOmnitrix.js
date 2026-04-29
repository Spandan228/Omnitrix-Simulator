import { useEffect, useCallback, useRef, useReducer } from 'react';
import { OMNITRIX_STATES } from '@/constants/omnitrixStates';
import { OMNITRIX_MODES } from '@/utils/stateMachine';
import { getUnlockedAliens } from '@/data/aliens';
import { getMasterAliens } from '@/data/masterAliens';
import {
    MAX_ENERGY,
    ENERGY_REGEN_RATE,
    COOLDOWN_DURATION,
    calculateEnergyDrain,
    hasEnoughEnergy,
    getNextXP
} from '@/utils/powerBalance';
import { OmnitrixService } from '@/services/omnitrixService';

const SECRET_SEQUENCE = ['L', 'R', 'R', 'L', 'R'];
const ALIEN_X_SEQUENCE = ['L', 'R', 'R', 'L', 'L', 'R', 'R'];
const MASTER_TIMEOUT = 5 * 60 * 1000;

// Action Types for Reducer
const ACTIONS = {
    SET_ENERGY: 'SET_ENERGY',
    SET_XP: 'SET_XP',
    SET_MODE: 'SET_MODE',
    SET_STATE: 'SET_STATE',
    SET_ACTIVE_ALIEN: 'SET_ACTIVE_ALIEN',
    SET_COOLDOWN_REMAINING: 'SET_COOLDOWN_REMAINING',
    APPEND_DIAL_PATTERN: 'APPEND_DIAL_PATTERN',
    CLEAR_DIAL_PATTERN: 'CLEAR_DIAL_PATTERN',
    SET_SELECTED_ALIEN_INDEX: 'SET_SELECTED_ALIEN_INDEX',
    ADD_UNIQUE_ALIEN: 'ADD_UNIQUE_ALIEN',
    INCREMENT_OVERCHARGE: 'INCREMENT_OVERCHARGE',
    RESET_OVERCHARGE: 'RESET_OVERCHARGE',
    FORCE_REVERT: 'FORCE_REVERT',
    TRIGGER_OVERCHARGE: 'TRIGGER_OVERCHARGE',
    SET_OWNER: 'SET_OWNER',
    SET_APP_THEME: 'SET_APP_THEME',
};

// Initial State
const initialState = {
    energy: MAX_ENERGY,
    xp: 0,
    mode: OMNITRIX_MODES.NORMAL,
    state: OMNITRIX_STATES.IDLE,
    activeAlien: null,
    cooldownRemaining: 0,
    dialPattern: [],
    selectedAlienIndex: 0,
    overchargeCount: 0,
    protocolLayer: 1, // 1: BASE, 2: EVOLUTION, 3: CELESTIAL
    isOwner: false,
    appTheme: 'CLASSIC', // 'CLASSIC' | 'MASTER'
};

function omnitrixReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_ENERGY:
            return { ...state, energy: OmnitrixService.calculateRegenAmount(action.payload, 0) };
        case ACTIONS.SET_XP:
            return { ...state, xp: action.payload };
        case ACTIONS.SET_MODE:
            return { ...state, mode: action.payload };
        case ACTIONS.SET_STATE: {
            const celestialStates = [OMNITRIX_STATES.ALIEN_X_DISCOVERY, OMNITRIX_STATES.ALIEN_X_AWAKENING, OMNITRIX_STATES.CELESTIAL_ARBITRATION, OMNITRIX_STATES.CELESTIAL_MODE];
            if (celestialStates.includes(state.state) && (action.payload === OMNITRIX_STATES.ACTIVE || action.payload === OMNITRIX_STATES.IDLE || action.payload === OMNITRIX_STATES.COOLDOWN)) {
                return state; // Prevent overriding celestial sequences with timeouts
            }
            if (action.payload === OMNITRIX_STATES.CELESTIAL_MODE) {
                return { ...state, state: action.payload, protocolLayer: 3 };
            }
            if (action.payload === OMNITRIX_STATES.REALITY_STABILIZING) {
                return { ...state, state: action.payload, protocolLayer: 1 };
            }
            return { ...state, state: action.payload };
        }
        case ACTIONS.SET_APP_THEME:
            return { ...state, appTheme: action.payload };
        case ACTIONS.SET_OWNER:
            return { ...state, isOwner: true };
        case ACTIONS.SET_ACTIVE_ALIEN: {
            return { ...state, activeAlien: action.payload };
        }
        case ACTIONS.SET_COOLDOWN_REMAINING:
            return { ...state, cooldownRemaining: action.payload };
        case ACTIONS.APPEND_DIAL_PATTERN: {
            const newPattern = [...state.dialPattern, action.payload];
            if (newPattern.length > 7) newPattern.shift();
            return { ...state, dialPattern: newPattern };
        }
        case ACTIONS.CLEAR_DIAL_PATTERN:
            return { ...state, dialPattern: [] };
        case ACTIONS.SET_SELECTED_ALIEN_INDEX:
            return { ...state, selectedAlienIndex: action.payload };
        case ACTIONS.INCREMENT_OVERCHARGE: {
            const newCount = state.overchargeCount + 1;
            return { ...state, overchargeCount: newCount, state: OMNITRIX_STATES.OVERCHARGE };
        }
        case ACTIONS.RESET_OVERCHARGE:
            return { ...state, overchargeCount: 0 };
        case ACTIONS.FORCE_REVERT: {
            const celestialStates = [OMNITRIX_STATES.ALIEN_X_DISCOVERY, OMNITRIX_STATES.ALIEN_X_AWAKENING, OMNITRIX_STATES.CELESTIAL_ARBITRATION, OMNITRIX_STATES.CELESTIAL_MODE];
            if (celestialStates.includes(state.state)) {
                return state;
            }
            const isMaster = state.mode === OMNITRIX_MODES.MASTER_UNLOCKED;
            if (isMaster) {
                console.log("[REDUCER] FORCE_REVERT executed under Master mode -> IDLE");
                return { ...state, activeAlien: null, state: OMNITRIX_STATES.IDLE };
            } else {
                console.log("[REDUCER] FORCE_REVERT executed under Normal mode -> COOLDOWN", COOLDOWN_DURATION);
                return { ...state, activeAlien: null, state: OMNITRIX_STATES.COOLDOWN, cooldownRemaining: COOLDOWN_DURATION };
            }
        }
        default:
            return state;
    }
}

export const useOmnitrix = () => {
    const [state, dispatch] = useReducer(omnitrixReducer, initialState);

    const regenIntervalRef = useRef(null);
    const activeTimerRef = useRef(null);
    const cooldownTimerRef = useRef(null);
    const masterLockTimerRef = useRef(null);
    const keyBufferRef = useRef('');

    const isMasterUnlocked = state.mode === OMNITRIX_MODES.MASTER_UNLOCKED;
    const isMasterTheme = state.appTheme === 'MASTER';
    const unlockedAliens = isMasterTheme ? getMasterAliens() : getUnlockedAliens(state.xp, isMasterUnlocked);

    const doRevert = useCallback(() => {
        if (state.state === OMNITRIX_STATES.CELESTIAL_MODE ||
            state.state === OMNITRIX_STATES.CELESTIAL_ARBITRATION ||
            state.state === OMNITRIX_STATES.ALIEN_X_DISCOVERY ||
            state.state === OMNITRIX_STATES.ALIEN_X_AWAKENING) {
            return; // Cannot revert normally during celestial sequence
        }

        if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
        if (!isMasterUnlocked) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            let currentCooldown = COOLDOWN_DURATION;

            // Revert state first
            dispatch({ type: ACTIONS.FORCE_REVERT });

            cooldownTimerRef.current = setInterval(() => {
                currentCooldown -= 100;
                if (currentCooldown <= 0) {
                    clearInterval(cooldownTimerRef.current);
                    dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: 0 });
                    dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.IDLE });
                } else {
                    dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: currentCooldown });
                }
            }, 100);
        } else {
            // Master mode revert
            dispatch({ type: ACTIONS.FORCE_REVERT });
        }
    }, [isMasterUnlocked, state.state]);

    const triggerOvercharge = useCallback(() => {
        if (state.state === OMNITRIX_STATES.ACTIVE) {
            // Stop the current revert timer so we don't revert mid-animation
            if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
            dispatch({ type: ACTIONS.INCREMENT_OVERCHARGE });

            // Flash state back to ACTIVE to create the pulsing visual effect
            setTimeout(() => {
                dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.ACTIVE });
                dispatch({ type: ACTIONS.RESET_OVERCHARGE });

                // Restart the active timer so they don't stay transformed forever after a failed overcharge
                if (!isMasterUnlocked) {
                    const randomTimeoutMs = Math.floor(Math.random() * (120000 - 15000 + 1)) + 15000;
                    activeTimerRef.current = setTimeout(() => {
                        doRevert();
                    }, randomTimeoutMs);
                }
            }, 500);
        }
    }, [state.state, isMasterUnlocked, doRevert]);

    useEffect(() => {
        if (state.mode === OMNITRIX_MODES.MASTER_UNLOCKED) {
            if (masterLockTimerRef.current) clearTimeout(masterLockTimerRef.current);
            masterLockTimerRef.current = setTimeout(() => {
                dispatch({ type: ACTIONS.SET_MODE, payload: OMNITRIX_MODES.MASTER_LOCKED });
            }, MASTER_TIMEOUT);
        }
        return () => clearTimeout(masterLockTimerRef.current);
    }, [state.mode]);


    useEffect(() => {
        const isIdleOrCooldown = state.state === OMNITRIX_STATES.IDLE || state.state === OMNITRIX_STATES.COOLDOWN;
        const isNotCelestial = state.protocolLayer !== 3;

        // Energy only regenerates if we are NOT in celestial mode
        if ((isIdleOrCooldown || isMasterUnlocked) && isNotCelestial) {
            if (!regenIntervalRef.current) {
                regenIntervalRef.current = setInterval(() => {
                    dispatch({ type: ACTIONS.SET_ENERGY, payload: state.energy + ENERGY_REGEN_RATE });
                }, 1000);
            }
        } else {
            if (regenIntervalRef.current) clearInterval(regenIntervalRef.current);
            regenIntervalRef.current = null;
        }
        return () => clearInterval(regenIntervalRef.current);
    }, [state.state, isMasterUnlocked, state.energy, state.protocolLayer]);

    useEffect(() => {
        if (state.dialPattern.length >= ALIEN_X_SEQUENCE.length) {
            const recentAX = state.dialPattern.slice(-ALIEN_X_SEQUENCE.length);
            const isMatchAX = recentAX.every((dir, idx) => dir === ALIEN_X_SEQUENCE[idx]);
            if (isMatchAX) {
                console.log("CELESTIALSAPIEN DIAL SEQUENCE ENTERED.");
                dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.ALIEN_X_DISCOVERY });
                dispatch({ type: ACTIONS.CLEAR_DIAL_PATTERN });
                return;
            }
        }

        if (state.dialPattern.length >= SECRET_SEQUENCE.length) {
            const recentMaster = state.dialPattern.slice(-SECRET_SEQUENCE.length);
            const isMatchMaster = recentMaster.every((dir, idx) => dir === SECRET_SEQUENCE[idx]);
            if (isMatchMaster && state.mode !== OMNITRIX_MODES.MASTER_UNLOCKED && state.mode !== OMNITRIX_MODES.MASTER_LOCKED) {
                dispatch({ type: ACTIONS.SET_MODE, payload: OMNITRIX_MODES.MASTER_UNLOCKED });
                dispatch({ type: ACTIONS.SET_ENERGY, payload: MAX_ENERGY });
                dispatch({ type: ACTIONS.CLEAR_DIAL_PATTERN });
            }
        }
    }, [state.dialPattern, state.mode]);

    // Keyboard Cheat Code listening for "OWNER"
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!/^[a-zA-Z0-9_]$/.test(e.key)) return;

            keyBufferRef.current += e.key.toUpperCase();
            if (keyBufferRef.current.length > 20) {
                keyBufferRef.current = keyBufferRef.current.slice(-20);
            }

            if (keyBufferRef.current.endsWith('OWNER')) {
                dispatch({ type: ACTIONS.SET_OWNER });
                if (state.mode !== OMNITRIX_MODES.MASTER_UNLOCKED && state.mode !== OMNITRIX_MODES.MASTER_LOCKED) {
                    console.log("Cheat code activated: MASTER CONTROL UNLOCKED");
                    dispatch({ type: ACTIONS.SET_MODE, payload: OMNITRIX_MODES.MASTER_UNLOCKED });
                    dispatch({ type: ACTIONS.SET_ENERGY, payload: MAX_ENERGY });

                    if (state.state === OMNITRIX_STATES.COOLDOWN) {
                        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
                        dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: 0 });
                        dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.IDLE });
                    }
                    keyBufferRef.current = '';
                }
            } else if (keyBufferRef.current.endsWith('10KXP')) {
                dispatch({ type: ACTIONS.SET_XP, payload: 10000 });
                keyBufferRef.current = '';
                console.log("10K XP Granted.");
            } else if (keyBufferRef.current.endsWith('MAXENERGY')) {
                dispatch({ type: ACTIONS.SET_ENERGY, payload: MAX_ENERGY });
                keyBufferRef.current = '';
                console.log("MAX ENERGY Granted.");
            } else if (keyBufferRef.current.endsWith('ALLALIENS')) {
                // Populate uniqueAliensUsed indirectly no longer needed, keeping for backwards testing compat
                dispatch({ type: ACTIONS.FORCE_REVERT });
                keyBufferRef.current = '';
                console.log("Required 15 aliens met.");
            } else if (keyBufferRef.current.endsWith('LOCAL')) {
                // Clear owner mode to fix lingering Alien X bypass
                if (state.isOwner) {
                    dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.IDLE });
                }
                if (state.mode === OMNITRIX_MODES.MASTER_UNLOCKED) {
                    dispatch({ type: ACTIONS.SET_MODE, payload: OMNITRIX_MODES.NORMAL });
                    if (state.state === OMNITRIX_STATES.ACTIVE) {
                        dispatch({ type: ACTIONS.FORCE_REVERT });

                        let currentCooldown = COOLDOWN_DURATION;
                        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
                        cooldownTimerRef.current = setInterval(() => {
                            currentCooldown -= 100;
                            if (currentCooldown <= 0) {
                                clearInterval(cooldownTimerRef.current);
                                dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: 0 });
                                dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.IDLE });
                            } else {
                                dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: currentCooldown });
                            }
                        }, 100);
                    }
                    keyBufferRef.current = '';
                }
            } else if (keyBufferRef.current.endsWith('MASTER')) {
                dispatch({ type: ACTIONS.SET_APP_THEME, payload: 'MASTER' });
                // Max out energy and unlock master mode automatically for this tier
                dispatch({ type: ACTIONS.SET_MODE, payload: OMNITRIX_MODES.MASTER_UNLOCKED });
                dispatch({ type: ACTIONS.SET_ENERGY, payload: MAX_ENERGY });
                dispatch({ type: ACTIONS.FORCE_REVERT });
                dispatch({ type: ACTIONS.SET_SELECTED_ALIEN_INDEX, payload: 0 });
                keyBufferRef.current = '';
                console.log("Master Omnitrix UI Engaged.");
            } else if (keyBufferRef.current.endsWith('HUMAN')) {
                dispatch({ type: ACTIONS.SET_APP_THEME, payload: 'CLASSIC' });
                dispatch({ type: ACTIONS.FORCE_REVERT });
                dispatch({ type: ACTIONS.SET_SELECTED_ALIEN_INDEX, payload: 0 });
                keyBufferRef.current = '';
                console.log("Classic Omnitrix UI Restored.");
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.mode, state.state, unlockedAliens]);

    const setExplicitSelection = useCallback((index, rotationDirection) => {
        if (rotationDirection) {
            dispatch({ type: ACTIONS.APPEND_DIAL_PATTERN, payload: rotationDirection });
        }
        dispatch({ type: ACTIONS.SET_SELECTED_ALIEN_INDEX, payload: index });

        // Instantly swap if transformed and master unlocked
        if (state.state === OMNITRIX_STATES.ACTIVE && isMasterUnlocked) {
            dispatch({ type: ACTIONS.SET_ACTIVE_ALIEN, payload: unlockedAliens[index] });
        }
    }, [isMasterUnlocked, unlockedAliens, state.state]);

    const advanceCelestialState = useCallback((nextState) => {
        dispatch({ type: ACTIONS.SET_STATE, payload: nextState });
    }, []);

    const celestialActions = {
        reverseTransformation: () => {
            if (state.state === OMNITRIX_STATES.CELESTIAL_MODE) {
                dispatch({ type: ACTIONS.FORCE_REVERT });
                dispatch({ type: ACTIONS.SET_XP, payload: Math.max(0, state.xp - 100) });
            }
        },
        instantMaxEnergy: () => dispatch({ type: ACTIONS.SET_ENERGY, payload: MAX_ENERGY }),
        skipCooldown: () => {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: 0 });
        },
        restoreBalance: () => {
            dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.REALITY_STABILIZING });

            setTimeout(() => {
                dispatch({ type: ACTIONS.SET_ENERGY, payload: MAX_ENERGY * 0.3 }); // 30%
                dispatch({ type: ACTIONS.RESET_OVERCHARGE });

                // Force a cooldown
                dispatch({ type: ACTIONS.FORCE_REVERT });
                let currentCooldown = COOLDOWN_DURATION;
                if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
                cooldownTimerRef.current = setInterval(() => {
                    currentCooldown -= 100;
                    if (currentCooldown <= 0) {
                        clearInterval(cooldownTimerRef.current);
                        dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: 0 });
                        dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.IDLE });
                    } else {
                        dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: currentCooldown });
                    }
                }, 100);
            }, 3000); // Wait 3s for stabilization cinematic
        }
    };


    const transform = useCallback(() => {
        if (state.state === OMNITRIX_STATES.COOLDOWN) return false;
        if (state.state === OMNITRIX_STATES.ACTIVE && !isMasterUnlocked) return false;
        if (state.protocolLayer !== 1) return false; // Block normal transformations during celestial events

        if (state.state === OMNITRIX_STATES.IDLE && !isMasterUnlocked) {
            dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.SELECTING });
            return true;
        }

        const alien = unlockedAliens[state.selectedAlienIndex];
        if (!alien) return false;

        if (!hasEnoughEnergy(alien, state.energy, isMasterUnlocked)) return false;

        if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

        dispatch({ type: ACTIONS.SET_ACTIVE_ALIEN, payload: alien });
        dispatch({ type: ACTIONS.SET_STATE, payload: OMNITRIX_STATES.ACTIVE });
        dispatch({ type: ACTIONS.SET_COOLDOWN_REMAINING, payload: 0 });

        if (!isMasterUnlocked && state.state !== OMNITRIX_STATES.ACTIVE) {
            dispatch({ type: ACTIONS.SET_ENERGY, payload: state.energy - calculateEnergyDrain(alien, false) });
            dispatch({ type: ACTIONS.SET_XP, payload: getNextXP(state.xp) });
        } else if (isMasterUnlocked && state.state !== OMNITRIX_STATES.ACTIVE) {
            dispatch({ type: ACTIONS.SET_XP, payload: getNextXP(state.xp) });
        }

        if (!isMasterUnlocked) {
            const randomTimeoutMs = Math.floor(Math.random() * (120000 - 15000 + 1)) + 15000;
            activeTimerRef.current = setTimeout(() => {
                doRevert();
            }, randomTimeoutMs);
        }

        return true;
    }, [state.state, state.selectedAlienIndex, unlockedAliens, state.energy, isMasterUnlocked, state.xp, doRevert, state.protocolLayer]);

    return {
        ...state,
        unlockedAliens,
        isMasterUnlocked,
        setExplicitSelection,
        transform,
        revertTransformation: doRevert,
        triggerOvercharge,
        advanceCelestialState,
        celestialActions,
        dispatch // exposed for testing / cheats internally
    };
};
