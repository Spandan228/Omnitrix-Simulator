import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { OMNITRIX_STATES } from '@/constants/omnitrixStates';
import { OMNITRIX_MODES } from '@/utils/stateMachine';
import { ParticleSystem } from '@/components/ui';
import { COOLDOWN_DURATION } from '@/utils/powerBalance';

// Alternative Cooldown Ring for Master UI
const MasterCooldownRing = React.memo(({ progress }) => {
    const radius = 180;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress * circumference);

    return (
        <svg width="400" height="400" className="absolute -rotate-90 pointer-events-none drop-shadow-[0_0_15px_#ef4444] z-50">
            <motion.circle
                cx="200"
                cy="200"
                r={radius}
                stroke="#ef4444"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ type: "tween", duration: 0.2, ease: "linear" }}
                className="opacity-80"
                style={{ filter: "blur(2px)" }}
            />
            <motion.circle
                cx="200"
                cy="200"
                r={radius}
                stroke="#dc2626"
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ type: "tween", duration: 0.2, ease: "linear" }}
            />
        </svg>
    );
});

const MasterOmnitrixCore = ({
    state,
    activeAlien,
    unlockedAliens,
    selectedAlienIndex,
    cooldownRemaining,
    setExplicitSelection,
    transform,
    revertTransformation,
    triggerOvercharge,
    isMasterUnlocked,
    isOwner,
    advanceCelestialState
}) => {
    const alien = activeAlien || unlockedAliens[selectedAlienIndex];
    const coreRef = useRef(null);

    const [hoverText, setHoverText] = useState(null);
    const [isRotating, setIsRotating] = useState(false);
    const [currentAngle, setCurrentAngle] = useState(0);

    const pointerDownTime = useRef(0);
    const startPointerAngle = useRef(0);
    const startDialAngle = useRef(0);

    const hasDraggedRef = useRef(false);

    // Custom click tracking to bypass React onClick unreliability with pointerCapture
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef(null);

    const getAngleFromEvent = (e) => {
        if (!coreRef.current) return 0;
        const rect = coreRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        return angle + 90; // offset so top is 0
    };

    const handlePointerDownOuter = (e) => {
        // ALWAYS record down time for click physics
        pointerDownTime.current = Date.now();
        hasDraggedRef.current = false;

        // Block dial rotation if actively transformed or locked
        const canRotate = isMasterUnlocked || state === OMNITRIX_STATES.IDLE || state === OMNITRIX_STATES.SELECTING;
        if (!canRotate) return;

        setIsRotating(true);
        startPointerAngle.current = getAngleFromEvent(e);
        startDialAngle.current = currentAngle;
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isRotating || !coreRef.current) return;

        const currentPointerAngle = getAngleFromEvent(e);
        let delta = currentPointerAngle - startPointerAngle.current;

        if (Math.abs(delta) > 2) {
            hasDraggedRef.current = true;
        }

        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        let newAngle = startDialAngle.current + delta;
        if (newAngle < 0) newAngle = (newAngle % 360) + 360;
        newAngle = newAngle % 360;

        setCurrentAngle(newAngle);

        const anglePerAlien = 360 / unlockedAliens.length;
        let index = Math.round(newAngle / anglePerAlien) % unlockedAliens.length;
        if (index < 0) index += unlockedAliens.length;

        if (index !== selectedAlienIndex) {
            setExplicitSelection(index);
        }
    };

    // Handle scroll to pan roster
    useEffect(() => {
        const handleWheel = (e) => {
            if (state !== OMNITRIX_STATES.SELECTING && !isMasterUnlocked) return;
            e.preventDefault();

            const direction = e.deltaY > 0 ? 1 : -1;
            let newIndex = (selectedAlienIndex + direction) % unlockedAliens.length;
            if (newIndex < 0) newIndex += unlockedAliens.length;

            setExplicitSelection(newIndex);
        };

        const coreElement = coreRef.current;
        if (coreElement) {
            coreElement.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (coreElement) coreElement.removeEventListener('wheel', handleWheel);
        };
    }, [state, selectedAlienIndex, unlockedAliens.length, setExplicitSelection]);

    const handleCoreClick = () => {
        if (state === OMNITRIX_STATES.ACTIVE) {
            revertTransformation();
        } else if (state === OMNITRIX_STATES.IDLE && isMasterUnlocked) {
            advanceCelestialState(OMNITRIX_STATES.SELECTING);
        } else if (state === OMNITRIX_STATES.IDLE || state === OMNITRIX_STATES.SELECTING || isMasterUnlocked) {
            transform();
        }
    };

    const handlePointerUpOuter = (e) => {
        if (isRotating) {
            setIsRotating(false);
            if (e.target.hasPointerCapture(e.pointerId)) {
                e.target.releasePointerCapture(e.pointerId);
            }
        }

        // If we didn't drag, treat it as a deliberate click
        if (!hasDraggedRef.current) {
            clickCountRef.current += 1;

            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = setTimeout(() => {
                const count = clickCountRef.current;
                clickCountRef.current = 0; // Reset

                if (count === 1) {
                    handleCoreClick();
                } else if (count === 2) {
                    if (state === OMNITRIX_STATES.ACTIVE) {
                        triggerOvercharge();
                    }
                } else if (count >= 3) {
                    advanceCelestialState(OMNITRIX_STATES.ALIEN_X_DISCOVERY);
                }
            }, 300);
        }
    };

    const isCooldown = state === OMNITRIX_STATES.COOLDOWN && !isMasterUnlocked;
    const cooldownProgress = isCooldown ? (cooldownRemaining / COOLDOWN_DURATION) : 0;

    const baseColor = isCooldown ? 'from-red-900 to-red-950' : 'from-cyan-900 to-slate-900';
    const glowColor = isCooldown ? 'shadow-[0_0_50px_#ef4444]' : (state === OMNITRIX_STATES.ACTIVE || isMasterUnlocked) ? 'shadow-[0_0_80px_#06b6d4]' : 'shadow-[0_0_30px_#0891b2]';
    const accentColor = isCooldown ? '#ef4444' : '#06b6d4';

    const coreAnimationState = state === OMNITRIX_STATES.ACTIVE
        ? 'active'
        : (state === OMNITRIX_STATES.SELECTING || (isMasterUnlocked && state !== OMNITRIX_STATES.IDLE))
            ? 'selecting'
            : 'idle';

    const outerRingVariants = {
        idle: { scale: 1, transition: { duration: 0.8, ease: "easeInOut" } },
        selecting: { scale: 1.05, transition: { type: "spring", stiffness: 120, damping: 12 } },
        active: { scale: 1.15, transition: { type: "spring", stiffness: 200, damping: 15 } }
    };

    const innerCavityVariants = {
        idle: { scale: 1, rotate: 0, transition: { duration: 0.8, ease: "easeInOut" } },
        selecting: { scale: 0.92, rotate: 90, transition: { type: "spring", stiffness: 100, damping: 15 } },
        active: { scale: 1.05, rotate: 180, transition: { type: "spring", stiffness: 150, damping: 12 } }
    };

    return (
        <div className="relative flex flex-col items-center justify-center mt-12 mb-12 select-none" onMouseLeave={() => setHoverText(null)}>

            <AnimatePresence>
                {hoverText && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className={`absolute -top-32 whitespace-nowrap px-4 py-2 bg-slate-950/90 backdrop-blur-md border rounded pointer-events-none z-[9999] font-sans text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.5)] text-cyan-400 border-cyan-500`}
                    >
                        {hoverText}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Master Mode Banner */}
            {isMasterUnlocked && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-20 font-black tracking-widest text-2xl animate-pulse text-cyan-300 drop-shadow-[0_0_20px_#06b6d4] z-50 px-6 py-2 rounded-lg border-2 border-cyan-400 bg-slate-900/80 backdrop-blur-md"
                >
                    MASTER OVERRIDE
                </motion.div>
            )}

            <div className="relative flex items-center justify-center">
                <ParticleSystem
                    active={state === OMNITRIX_STATES.ACTIVE}
                    color={accentColor}
                />

                {/* Sleek Gauntlet Base Overlay (Hexagonal/Rectangular theme) */}
                <div className="absolute w-[450px] h-[300px] bg-slate-800 rounded-[50px] -z-20 shadow-[inset_0_-10px_30px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden border-y-8 border-slate-700">
                    <div className="w-[120%] h-1 bg-cyan-500/10 absolute rotate-12" />
                    <div className="w-[120%] h-1 bg-cyan-500/10 absolute -rotate-12" />
                </div>

                {/* Outer Silver Ring */}
                <motion.div
                    className={`relative w-[340px] h-[340px] rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 border-4 border-slate-600 flex items-center justify-center p-3 shadow-2xl ${glowColor} transition-shadow duration-700 cursor-pointer`}
                    variants={outerRingVariants}
                    initial="idle"
                    animate={coreAnimationState}
                    whileTap={{ scale: 0.95 }}
                    ref={coreRef}
                    onPointerDown={handlePointerDownOuter}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUpOuter}
                    onPointerCancel={handlePointerUpOuter}
                    onMouseEnter={() => setHoverText(state === OMNITRIX_STATES.ACTIVE ? "CLICK TO REVERT" : "CLICK TO TRANSFORM")}
                    onMouseLeave={() => setHoverText("DRAG/SCROLL TO SELECT")}
                    style={{ touchAction: 'none' }}
                >
                    {/* The Rotating Dial Container (Responds to Dragging) */}
                    <div
                        className="relative w-full h-full rounded-full"
                        style={{
                            transform: `rotate(${currentAngle}deg)`,
                            transition: isRotating ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {/* Inner Black Cavity with glowing rim */}
                        <motion.div
                            className={`relative w-full h-full rounded-full bg-gradient-to-br ${baseColor} border-8 border-slate-950 flex items-center justify-center shadow-[inset_0_0_60px_rgba(0,0,0,1)] transition-colors duration-1000 overflow-hidden`}
                            variants={innerCavityVariants}
                            animate={coreAnimationState}
                        >
                            {/* Outer Rim Physical Strips / Buttons */}
                            <div className="absolute inset-[-8px] rounded-full pointer-events-none z-30 overflow-hidden">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-700 border-b-2 border-slate-500 rounded-b shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-700 border-t-2 border-slate-500 rounded-t shadow-[0_-4px_10px_rgba(0,0,0,0.5)]" />
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-700 border-r-2 border-slate-500 rounded-r shadow-[4px_0_10px_rgba(0,0,0,0.5)]" />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-700 border-l-2 border-slate-500 rounded-l shadow-[-4px_0_10px_rgba(0,0,0,0.5)]" />
                            </div>

                            {/* Holographic grid lines */}
                            <div className="absolute inset-0 rounded-full bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none opacity-50 z-20 overflow-hidden" />

                            {/* Idle Mode Black Strips (Classic Hourglass) */}
                            <AnimatePresence>
                                {state === OMNITRIX_STATES.IDLE && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 overflow-hidden"
                                    >
                                        <div className="absolute inset-[-10px] bg-slate-950" style={{ clipPath: 'polygon(0 0, 35% 50%, 0 100%)' }} />
                                        <div className="absolute inset-[-10px] bg-slate-950" style={{ clipPath: 'polygon(100% 0, 65% 50%, 100% 100%)' }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Static Foreground (Alien Images) - Independent of rotation */}
                    <div className="absolute inset-3 rounded-full pointer-events-none flex items-center justify-center z-50 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {(((state === OMNITRIX_STATES.SELECTING || state === OMNITRIX_STATES.ACTIVE || (isMasterUnlocked && state !== OMNITRIX_STATES.IDLE)) && !isCooldown && alien) ||
                                (state === OMNITRIX_STATES.ALIEN_X_DISCOVERY || state === OMNITRIX_STATES.ALIEN_X_AWAKENING || state === OMNITRIX_STATES.CELESTIAL_ARBITRATION || state === OMNITRIX_STATES.CELESTIAL_MODE)) && (
                                    <motion.div
                                        key={(state === OMNITRIX_STATES.ALIEN_X_DISCOVERY || state === OMNITRIX_STATES.ALIEN_X_AWAKENING || state === OMNITRIX_STATES.CELESTIAL_ARBITRATION || state === OMNITRIX_STATES.CELESTIAL_MODE) ? 'alien_x' : alien.id}
                                        initial={{ opacity: 0, scale: 0.2, y: 50, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, scale: 0.2, y: -50, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                                        className="z-10 flex flex-col items-center justify-center text-center p-2 w-full h-full relative"
                                    >
                                        {(() => {
                                            const isCelestialMode = (state === OMNITRIX_STATES.ALIEN_X_DISCOVERY || state === OMNITRIX_STATES.ALIEN_X_AWAKENING || state === OMNITRIX_STATES.CELESTIAL_ARBITRATION || state === OMNITRIX_STATES.CELESTIAL_MODE);
                                            const displayImage = isCelestialMode ? '/aliens/alien_x.png' : alien?.image;
                                            const displayName = isCelestialMode ? 'Alien X' : alien?.name;
                                            const displayColor = isCelestialMode ? '#ffffff' : alien?.color || '#06b6d4';

                                            return displayImage ? (
                                                <div className={`relative w-56 h-56 pointer-events-none flex items-center justify-center ${isCelestialMode ? 'animate-pulse' : 'mix-blend-screen opacity-90'}`}>
                                                    <img
                                                        src={displayImage}
                                                        alt={displayName}
                                                        className="w-[90%] h-[90%] object-contain filter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                                                        style={{
                                                            filter: `drop-shadow(0 0 15px ${isCelestialMode ? 'white' : '#06b6d4'}) saturate(1.5) contrast(1.2)`
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-40 h-40 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.5)] border-2 border-cyan-400/50 bg-black/40 backdrop-blur-md flex items-center justify-center" style={{ borderColor: displayColor, color: displayColor, boxShadow: `0 0 30px ${displayColor}` }}>
                                                        <span className="font-sans font-black text-8xl drop-shadow-[0_0_10px_currentColor]">
                                                            {displayName?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span className="mt-4 font-black tracking-widest text-xl text-white drop-shadow-[0_0_8px_rgba(6,182,212,1)] uppercase">{displayName}</span>
                                                </div>
                                            );
                                        })()}
                                    </motion.div>
                                )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {isCooldown && <MasterCooldownRing progress={cooldownProgress} />}
        </div>
    );
};

export default MasterOmnitrixCore;
