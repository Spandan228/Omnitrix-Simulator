import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { OMNITRIX_STATES } from '@/constants/omnitrixStates';
import { OMNITRIX_MODES } from '@/utils/stateMachine';
import { ParticleSystem } from '@/components/ui';
import { COOLDOWN_DURATION } from '@/utils/powerBalance';

import CooldownRing from './CooldownRing';

const OmnitrixCore = ({
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

    // Interaction State
    const [isRotating, setIsRotating] = useState(false);
    const [hoverText, setHoverText] = useState(null);
    const [currentAngle, setCurrentAngle] = useState(selectedAlienIndex * (360 / unlockedAliens.length));

    // Update visual angle only if external selection occurred (like scroll)
    const prevIndexRef = useRef(selectedAlienIndex);
    useEffect(() => {
        if (!isRotating && prevIndexRef.current !== selectedAlienIndex) {
            const anglePerAlien = 360 / unlockedAliens.length;
            setCurrentAngle(selectedAlienIndex * anglePerAlien);
            prevIndexRef.current = selectedAlienIndex;
        }
    }, [selectedAlienIndex, unlockedAliens.length, isRotating]);

    // Core visual styling based on state
    let coreColor = 'from-green-500 to-green-700';
    let glowColor = 'shadow-[0_0_80px_#22c55e]';
    let outerRingColor = 'border-black';
    let innerGlow = 'drop-shadow-[0_0_20px_#22c55e]';

    if (state === OMNITRIX_STATES.ACTIVE) {
        coreColor = 'from-green-100 to-white';
        glowColor = 'shadow-[0_0_120px_#22c55e]';
        innerGlow = 'drop-shadow-[0_0_50px_#22c55e]';
    } else if (isMasterUnlocked) {
        coreColor = 'from-yellow-400 to-yellow-600';
        glowColor = 'shadow-[0_0_100px_#eab308]';
        outerRingColor = 'border-black';
        innerGlow = 'drop-shadow-[0_0_40px_#eab308]';
    } else if (state === OMNITRIX_STATES.COOLDOWN) {
        coreColor = 'from-red-600 to-red-900';
        glowColor = 'shadow-[0_0_60px_#ef4444]';
        outerRingColor = 'border-black';
        innerGlow = 'drop-shadow-[0_0_15px_#ef4444]';
    }

    const pointerDownTime = useRef(0);
    const startPointerAngle = useRef(0);
    const startDialAngle = useRef(0);
    const hasDraggedRef = useRef(false);
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

    // Handle dial rotation math
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

        // Handle wraparound in delta
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        if (Math.abs(delta) > 5) {
            hasDraggedRef.current = true;
        }

        let newAngle = startDialAngle.current + delta;

        // Normalize newAngle to 0-360
        if (newAngle < 0) newAngle = (newAngle % 360) + 360;
        newAngle = newAngle % 360;

        setCurrentAngle(newAngle);

        const anglePerAlien = 360 / unlockedAliens.length;
        let index = Math.round(newAngle / anglePerAlien) % unlockedAliens.length;
        if (index < 0) index += unlockedAliens.length;

        if (index !== selectedAlienIndex) {
            let diff = index - selectedAlienIndex;
            if (diff < -unlockedAliens.length / 2) diff += unlockedAliens.length;
            if (diff > unlockedAliens.length / 2) diff -= unlockedAliens.length;

            const direction = diff > 0 ? 'R' : 'L';
            setExplicitSelection(index, direction);
        }
    };

    const handleCoreClick = () => {
        console.log("Core exactly clicked.");
        // If we are currently transformed, clicking the core should always revert
        if (state === OMNITRIX_STATES.ACTIVE) {
            revertTransformation();
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

        const timeHeld = Date.now() - pointerDownTime.current;
        if (!hasDraggedRef.current && timeHeld < 500) {
            clickCountRef.current += 1;

            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

            clickTimerRef.current = setTimeout(() => {
                const count = clickCountRef.current;
                clickCountRef.current = 0;

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

    useEffect(() => {
        const handleWheel = (e) => {
            if (isCooldown || isRotating) return;
            const direction = e.deltaY > 0 ? 1 : -1;
            let index = selectedAlienIndex + direction;
            if (index < 0) index = unlockedAliens.length - 1;
            if (index >= unlockedAliens.length) index = 0;
            const rotDir = direction > 0 ? 'R' : 'L';
            setExplicitSelection(index, rotDir);
        };
        const el = coreRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: true });
        return () => {
            if (el) el.removeEventListener('wheel', handleWheel);
        };
    }, [selectedAlienIndex, unlockedAliens.length, setExplicitSelection, isCooldown, isRotating]);

    let currentVariant = "idle";
    const isCelestialState = (state === OMNITRIX_STATES.ALIEN_X_DISCOVERY || state === OMNITRIX_STATES.ALIEN_X_AWAKENING || state === OMNITRIX_STATES.CELESTIAL_ARBITRATION || state === OMNITRIX_STATES.CELESTIAL_MODE);

    if (state === OMNITRIX_STATES.SELECTING) currentVariant = "selecting";
    else if (state === OMNITRIX_STATES.ACTIVE || isCelestialState) currentVariant = "active";
    else if (state === OMNITRIX_STATES.COOLDOWN) currentVariant = "cooldown";
    else if (isMasterUnlocked) currentVariant = "selecting"; // Master Control keeps it popped up

    return (
        <div className="relative flex flex-col items-center justify-center mt-12 mb-12 select-none" onMouseLeave={() => setHoverText(null)}>

            {/* Context Tooltip Container */}
            <AnimatePresence>
                {hoverText && !isRotating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className={`absolute -top-32 whitespace-nowrap px-4 py-2 bg-black/80 backdrop-blur-md border rounded pointer-events-none z-[9999] font-mono text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(34,197,94,0.5)] text-green-400 border-green-500`}
                        style={{ borderColor: isMasterUnlocked ? '#eab308' : '#22c55e', color: isMasterUnlocked ? '#eab308' : '#4ade80' }}
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
                    className="absolute -top-20 font-black tracking-widest text-2xl animate-pulse text-yellow-500 drop-shadow-[0_0_20px_#eab308] z-50 px-6 py-2 rounded border border-yellow-500/30 bg-black/40 backdrop-blur-md"
                >
                    MASTER CONTROL
                </motion.div>
            )}

            {/* Main Classic Housing */}
            <div className="relative flex items-center justify-center">
                {/* Particle Explosion on Transformation */}
                <ParticleSystem
                    active={state === OMNITRIX_STATES.ACTIVE}
                    color={isMasterUnlocked ? 'gold' : '#22c55e'}
                />
                {/* Grey Wristband bases/tubes mimicking Classic look */}
                <div className="absolute -left-16 w-32 h-64 bg-gray-800 rounded-l-[100px] -z-10 shadow-inner border-l-4 border-gray-600 block rotate-12" />
                <div className="absolute -right-16 w-32 h-64 bg-gray-800 rounded-r-[100px] -z-10 shadow-inner border-r-4 border-gray-600 block -rotate-12" />

                {/* Thick black base */}
                <div
                    className="absolute w-[360px] h-[360px] bg-gray-950 rounded-full border-8 border-gray-800 shadow-[0_20px_80px_rgba(0,0,0,1)] -z-10"
                />

                {/* 4 Classic Grey Prongs branching out */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={`prong-${i}`}
                        className="absolute w-[390px] h-12 flex justify-end items-center pointer-events-none -z-10 drop-shadow-2xl"
                        style={{ transform: `rotate(${i * 90 + 45}deg)` }}
                    >
                        <div className="w-16 h-12 bg-gray-700 rounded-r-lg border-2 border-gray-500 shadow-inner" />
                    </div>
                ))}

                {/* Dial Interface Layer */}
                <div
                    ref={coreRef}
                    onPointerDown={handlePointerDownOuter}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUpOuter}
                    onPointerCancel={handlePointerUpOuter}
                    onMouseEnter={() => setHoverText("DRAG TO ROTATE DIAL")}
                    className={`
            relative w-[300px] h-[300px] rounded-full bg-gray-900 border-[16px] ${outerRingColor} flex items-center justify-center
            transition-[box-shadow,transform] duration-500 shadow-inner touch-none
            ${glowColor} ring-8 ring-gray-950
          `}
                    style={{ cursor: (state === OMNITRIX_STATES.IDLE || isMasterUnlocked) ? (isRotating ? 'grabbing' : 'grab') : 'pointer' }}
                >

                    {/* Rotating Plate Base (Notches) */}
                    <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        animate={{ rotate: currentAngle }}
                        transition={isRotating ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 15 }}
                    >
                        {/* 4 Green Spherical Buttons on the rim */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={`green-button-${i}`}
                                className="absolute inset-0 flex items-center justify-end pointer-events-none z-20"
                                style={{ transform: `rotate(${i * 90}deg)` }}
                            >
                                <div className={`w-8 h-8 -mr-4 rounded-full border-[3px] border-black shadow-[inset_0_0_10px_rgba(0,0,0,0.8),0_0_10px_#22c55e] transition-colors duration-500
                                    ${state === OMNITRIX_STATES.COOLDOWN ? 'bg-red-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.8),0_0_10px_#ef4444]' : (isMasterUnlocked ? 'bg-yellow-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.8),0_0_10px_#eab308]' : 'bg-green-500')}
                                `} />
                            </div>
                        ))}

                        {/* Grip notches on bezel */}
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={`notch-${i}`} className="absolute inset-0 flex items-start justify-center" style={{ transform: `rotate(${i * 15}deg)` }}>
                                <div className={`w-1 h-3 rounded-b shadow-[inset_0_1px_3px_rgba(0,0,0,1)] ${i % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}`} />
                            </div>
                        ))}
                    </motion.div>

                    {/* Inner Pop-up Glowing Screen */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]" style={{ perspective: '1000px' }}>
                        <motion.button
                            variants={{
                                idle: { scale: 1, y: 0, boxShadow: 'inset 0 0 50px rgba(0,0,0,0.95)' },
                                selecting: {
                                    scale: 1.15,
                                    y: -15,
                                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.8)'
                                },
                                active: {
                                    scale: 0.95,
                                    y: 5,
                                    boxShadow: 'inset 0 0 80px rgba(0,0,0,1)'
                                },
                                cooldown: { scale: 1, y: 0, boxShadow: 'inset 0 0 50px rgba(0,0,0,0.95)' }
                            }}
                            initial="idle"
                            animate={currentVariant}
                            transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
                            onMouseEnter={() => setHoverText(state === OMNITRIX_STATES.ACTIVE ? "CLICK TO REVERT / DBL-CLICK TO OVERCHARGE" : "CLICK TO TRANSFORM")}
                            onMouseLeave={() => setHoverText("DRAG TO ROTATE DIAL")}
                            className={`
                  relative w-[200px] h-[200px] rounded-full border-[8px] border-black cursor-pointer 
                  bg-gradient-to-br ${coreColor} flex flex-col items-center justify-center 
                  overflow-hidden z-50 ${innerGlow}
                  outline-none pointer-events-auto
                `}
                        >
                            {/* ... (rest of the button content) */}
                            {/* Diamond Scanline overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay
                  bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)),linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1))] 
                  bg-[length:20px_20px] bg-[position:0_0,10px_10px]"
                            ></div>

                            <AnimatePresence mode="wait">
                                {(() => {
                                    const isCelestialMode = (state === OMNITRIX_STATES.ALIEN_X_DISCOVERY || state === OMNITRIX_STATES.ALIEN_X_AWAKENING || state === OMNITRIX_STATES.CELESTIAL_ARBITRATION || state === OMNITRIX_STATES.CELESTIAL_MODE);
                                    const isNormalMode = (state === OMNITRIX_STATES.SELECTING || state === OMNITRIX_STATES.ACTIVE || isMasterUnlocked) && !isCooldown && alien;

                                    if (!isCelestialMode && !isNormalMode) return null;

                                    const displayImage = isCelestialMode ? '/aliens/alien_x.png' : alien?.image;
                                    const displayName = isCelestialMode ? 'Alien X' : alien?.name;
                                    const displayColor = isCelestialMode ? '#ffffff' : alien?.color;
                                    const key = isCelestialMode ? 'alien_x' : alien?.id;

                                    return (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, scale: 0.5, filter: 'brightness(0) blur(5px)' }}
                                            animate={{ opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)' }}
                                            exit={{ opacity: 0, scale: 0.5, filter: 'brightness(0) blur(5px)' }}
                                            transition={{ duration: 0.2 }}
                                            className="z-10 flex flex-col items-center justify-center text-center p-2 w-full h-full relative"
                                        >
                                            {displayImage ? (
                                                <div className={`relative w-48 h-48 drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)] pointer-events-none flex items-center justify-center ${isCelestialMode ? 'animate-pulse' : 'hologram-scanlines'}`}>
                                                    <img
                                                        src={displayImage}
                                                        alt={displayName}
                                                        className="w-[85%] h-[85%] object-contain"
                                                        style={{
                                                            filter: isCelestialMode
                                                                ? `drop-shadow(0 0 15px white) brightness(1.2)`
                                                                : (state === OMNITRIX_STATES.ACTIVE || isMasterUnlocked)
                                                                    ? `drop-shadow(0 0 10px ${isMasterUnlocked ? 'gold' : '#22c55e'}) brightness(1.1)`
                                                                    : `brightness(0) drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))`
                                                        }}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="w-32 h-32 rounded-full mb-2 shadow-2xl border-4 bg-black/60 flex items-center justify-center uppercase"
                                                    style={{ borderColor: displayColor, color: displayColor, boxShadow: `0 0 20px ${displayColor}` }}
                                                >
                                                    <span className="font-mono font-black text-6xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                                                        {displayName?.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })()}
                            </AnimatePresence>
                        </motion.button>
                    </div>

                    {/* Top Top Layer: Spinning Hourglass Mask. Sits above the button to fix stacking context bug! */}
                    <motion.div
                        className="absolute pointer-events-none flex items-center justify-center z-[99999]"
                        style={{ width: '184px', height: '184px', top: '50%', left: '50%', marginTop: '-92px', marginLeft: '-92px' }}

                        // Combine 3D pop up animation with the exact 2D rotation of the dial
                        variants={{
                            idle: { scale: 1, y: 0 },
                            selecting: { scale: 1.15, y: -15 },
                            active: { scale: 0.95, y: 5 },
                            cooldown: { scale: 1, y: 0 }
                        }}
                        initial="idle"
                        animate={[currentVariant, { rotate: currentAngle }]}
                        transition={{
                            // Split transitions: slow tween for hydraulic pop-up, instant for dragged rotation
                            scale: { type: "tween", duration: 0.5, ease: "easeInOut" },
                            y: { type: "tween", duration: 0.5, ease: "easeInOut" },
                            rotate: isRotating ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 15 }
                        }}
                    >
                        <svg viewBox="0 0 100 100" className="absolute w-[100%] h-[100%] text-black fill-current drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)] pointer-events-none overflow-visible">
                            {/* Outer Inner-Bezel */}
                            <circle cx="50" cy="50" r="47" stroke="black" strokeWidth="6" fill="none" />

                            {/* 4 Dynamic Corner Wedges that morph from an Hourglass to a Diamond Cutout */}
                            {/* Replaced Framer Motion SVG d-attribute morphing with opacity fades to prevent console spam/errors */}
                            <g className="transition-opacity duration-500 ease-in-out" style={{ opacity: (currentVariant === 'idle' || currentVariant === 'cooldown') ? 1 : 0 }}>
                                <path d="M 50,50 L 14.64,14.64 A 50 50 0 0 0 0,50 Z" />
                                <path d="M 50,50 L 0,50 A 50 50 0 0 0 14.64,85.35 Z" />
                                <path d="M 50,50 L 85.35,14.64 A 50 50 0 0 1 100,50 Z" />
                                <path d="M 50,50 L 100,50 A 50 50 0 0 1 85.35,85.35 Z" />
                            </g>
                            <g className="transition-opacity duration-500 ease-in-out" style={{ opacity: (currentVariant === 'selecting' || currentVariant === 'active') ? 1 : 0 }}>
                                <path d="M 25,25 L 50,0 A 50 50 0 0 0 0,50 Z" />
                                <path d="M 25,75 L 0,50 A 50 50 0 0 0 50,100 Z" />
                                <path d="M 75,25 L 50,0 A 50 50 0 0 1 100,50 Z" />
                                <path d="M 75,75 L 100,50 A 50 50 0 0 1 50,100 Z" />
                            </g>

                            {/* Small Hub at exact intersection (fades away to reveal diamond center) */}
                            <motion.circle cx="50" cy="50" r="3" fill="black"
                                animate={currentVariant}
                                variants={{
                                    idle: { opacity: 1 },
                                    selecting: { opacity: 0 },
                                    active: { opacity: 0 },
                                    cooldown: { opacity: 1 }
                                }}
                            />
                        </svg>
                    </motion.div>

                </div>
            </div>

            {/* Cooldown SVG Ring - adjusted to frame the outer device perfectly */}
            {isCooldown && <CooldownRing progress={cooldownProgress} />}

            {/* Particle System for transformation burst */}
            <ParticleSystem
                active={state === OMNITRIX_STATES.ACTIVE}
                color={isMasterUnlocked ? '#eab308' : (alien?.color || '#22c55e')}
            />

        </div>
    );
};

export default OmnitrixCore;
