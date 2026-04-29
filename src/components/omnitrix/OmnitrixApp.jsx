import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

import { useTheme } from '@/context/ThemeProvider';
import { getMasterAliens } from '@/data/masterAliens';
import { EnergyBar } from '@/components/ui';
import { AlienCarousel, CelestialBackground, CelestialEnergyOrb, AlienXArbitrationModal } from '@/components/alien';
import { OMNITRIX_STATES } from '@/constants/omnitrixStates';

import OmnitrixCore from './OmnitrixCore';
import MasterOmnitrixCore from './MasterOmnitrixCore';
import DynamicBackground from './DynamicBackground';
import TransformationHUD from './TransformationHUD';

const OmnitrixApp = ({ omnitrix }) => {
    const { isCelestial } = useTheme();
    const [flash, setFlash] = useState(false);
    const [celestialRipple, setCelestialRipple] = useState(false);

    const isMasterTheme = omnitrix.appTheme === 'MASTER';
    const currentAliens = isMasterTheme ? getMasterAliens() : omnitrix.unlockedAliens;

    // 3D Parallax Mouse Tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(springY, [-1, 1], [15, -15]);
    const rotateY = useTransform(springX, [-1, 1], [-15, 15]);

    const handleMouseMove = (e) => {
        // Normalize mouse coordinates from -1 to 1 based on screen center
        const xPct = (e.clientX / window.innerWidth) * 2 - 1;
        const yPct = (e.clientY / window.innerHeight) * 2 - 1;
        mouseX.set(xPct);
        mouseY.set(yPct);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // Trigger screen flash on activation
    useEffect(() => {
        let t;
        if (omnitrix.state === OMNITRIX_STATES.ACTIVE) {
            setFlash(true);
            t = setTimeout(() => setFlash(false), 400);
        }
        return () => {
            if (t) clearTimeout(t);
        };
    }, [omnitrix.state]);

    // Auto-advance awakening sequences
    useEffect(() => {
        let t;
        if (omnitrix.state === OMNITRIX_STATES.ALIEN_X_DISCOVERY) {
            t = setTimeout(() => {
                omnitrix.advanceCelestialState(OMNITRIX_STATES.ALIEN_X_AWAKENING);
            }, 3000);
        } else if (omnitrix.state === OMNITRIX_STATES.ALIEN_X_AWAKENING) {
            t = setTimeout(() => {
                omnitrix.advanceCelestialState(OMNITRIX_STATES.CELESTIAL_ARBITRATION);
            }, 4000);
        }
        return () => {
            if (t) clearTimeout(t);
        };
    }, [omnitrix.state, omnitrix]);

    const handleRippleEffect = () => {
        setCelestialRipple(true);
        setTimeout(() => setCelestialRipple(false), 1000);
    };

    const themeColor = isCelestial ? '#ffffff' : (omnitrix.isMasterUnlocked ? (isMasterTheme ? '#06b6d4' : '#eab308') : (omnitrix.state === OMNITRIX_STATES.COOLDOWN ? '#ef4444' : (isMasterTheme ? '#06b6d4' : '#22c55e')));


    return (
        <div
            className={`min-h-screen ${isCelestial ? 'bg-transparent text-white' : (isMasterTheme ? 'bg-slate-950 text-cyan-400' : 'bg-black text-green-400')} font-sans relative overflow-x-hidden flex flex-col items-center py-6 px-4 touch-none perspective-[1200px] transition-colors duration-1000`}
            onPointerMove={handleMouseMove}
            onPointerLeave={handleMouseLeave}
        >

            {/* Backgrounds */}
            <AnimatePresence>
                {isCelestial ? (
                    <motion.div key="celestial-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}>
                        <CelestialBackground />
                    </motion.div>
                ) : (
                    <motion.div key="standard-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 z-[-1]">
                        <DynamicBackground state={omnitrix.state} mode={omnitrix.mode} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Micro-grid overlay mapping */}
            {!isCelestial && <div className={`absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-1000 ${isMasterTheme ? 'bg-[linear-gradient(rgba(6,182,212,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.15)_1px,transparent_1px)] bg-[length:30px_30px]' : 'bg-[linear-gradient(rgba(34,197,94,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.15)_1px,transparent_1px)] bg-[length:30px_30px]'}`} />}

            {/* Celestial Ripple Effect */}
            {celestialRipple && (
                <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="fixed inset-0 z-[9998] rounded-full border border-[#9D4EDD] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, transparent 20%, rgba(157, 78, 221, 0.2) 80%)' }}
                />
            )}

            {/* Hero flash burst covering screen */}
            <div
                className={`fixed inset-0 z-[9998] pointer-events-none transition-opacity duration-300 mix-blend-overlay ${flash ? 'opacity-90' : 'opacity-0'}`}
                style={{ backgroundColor: themeColor }}
            />

            {/* Awakening Cinematic Overlay */}
            <AnimatePresence>
                {/* === ENTRY: Reality Expanding Warp === */}
                {omnitrix.state === OMNITRIX_STATES.ALIEN_X_DISCOVERY && (
                    <motion.div
                        key="entry-warp"
                        className="fixed inset-0 z-[9990] pointer-events-none flex items-center justify-center overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                    >
                        {/* The Color-Inverting Reality Hack (Expanding Sphere) */}
                        <motion.div
                            className="absolute bg-white mix-blend-difference rounded-full"
                            style={{ width: '50vw', height: '50vw' }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 5 }}
                            transition={{ duration: 2.5, ease: "easeIn" }}
                        />

                        {/* Trailing Dark Energy Shockwave to suppress brightness */}
                        <motion.div
                            className="absolute bg-black mix-blend-multiply rounded-full"
                            style={{ width: '50vw', height: '50vw' }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 5, opacity: 0.8 }}
                            transition={{ duration: 2.2, ease: "easeIn", delay: 0.3 }}
                        />

                        {/* Deep Space Vignette (Fades in slowly to replace the background gracefully) */}
                        <motion.div
                            className="absolute inset-0 bg-[#000000]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ duration: 3, ease: "easeInOut" }}
                        />
                    </motion.div>
                )}

                {/* === EXIT: Reality Collapsing Snap === */}
                {omnitrix.state === OMNITRIX_STATES.REALITY_STABILIZING && (
                    <motion.div
                        key="exit-warp"
                        className="fixed inset-0 z-[9990] pointer-events-none flex items-center justify-center overflow-hidden"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                    >
                        {/* The Deep Space Vignette fades away */}
                        <motion.div
                            className="absolute inset-0 bg-[#000000]"
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                        />

                        {/* Collapsing Dark Energy Shockwave */}
                        <motion.div
                            className="absolute bg-black mix-blend-multiply rounded-full"
                            style={{ width: '50vw', height: '50vw' }}
                            initial={{ scale: 5, opacity: 0.8 }}
                            animate={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 2.2, ease: "easeOut" }}
                        />

                        {/* Collapsing Color-Inverting Reality Hack */}
                        <motion.div
                            className="absolute bg-white mix-blend-difference rounded-full"
                            style={{ width: '50vw', height: '50vw' }}
                            initial={{ scale: 5 }}
                            animate={{ scale: 0 }}
                            transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinematic HUD Overlay on Transform */}
            <AnimatePresence>
                {!isCelestial && (
                    <motion.div
                        key="transformation-hud"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <TransformationHUD
                            state={omnitrix.state}
                            activeAlien={omnitrix.activeAlien}
                            isMasterUnlocked={omnitrix.isMasterUnlocked}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top HUD */}
            <header className={`w-full max-w-4xl flex justify-between items-end z-10 tracking-[0.2em] text-sm mb-8 pb-4 relative transition-all duration-1000 ${isCelestial ? 'font-serif border-b-2 border-[#9D4EDD]/40 text-[#e9d5ff]' : (isMasterTheme ? 'font-mono text-cyan-400 border-b-2 border-cyan-900/40' : 'font-mono text-green-600 border-b-2 border-green-900/40')}`}>
                <div className="flex flex-col">
                    <span className="opacity-60 text-[10px] uppercase mb-1">State Protocol</span>
                    <span className={`font-black text-lg drop-shadow-[0_0_8px_currentColor] transition-colors duration-1000`} style={{ color: themeColor }}>
                        {isCelestial ? '[CELESTIAL_OVERRIDE]' : `[${omnitrix.mode}]`} :: {omnitrix.state}
                    </span>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center opacity-40 pointer-events-none select-none z-0">
                    <svg width="120" height="20" viewBox="0 0 120 20" className="fill-current text-current">
                        <rect x="0" y="8" width="120" height="2" />
                        <rect x="50" y="4" width="20" height="10" />
                    </svg>
                    <span className="text-[9px] mt-1 font-bold">{isCelestial ? 'OMNIVERSAL CONSENSUS V.X' : (isMasterTheme ? 'AZMUTH V.2 MASTER OS' : 'AZMUTH V.1 CLASSIC OS')}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="opacity-60 text-[10px] uppercase mb-1">{isCelestial ? 'Cosmic Resonance' : 'DNA Resonance'}</span>
                    <span className={`font-black text-lg text-white`} style={{ textShadow: `0 0 12px ${themeColor}` }}>{omnitrix.xp} XP</span>
                </div>
            </header>

            <main className="z-10 flex flex-col items-center justify-center flex-1 w-full max-w-3xl">

                <motion.div
                    className="w-full flex justify-center items-center py-4 relative z-20"
                    style={{
                        rotateX: isCelestial ? 0 : rotateX,
                        rotateY: isCelestial ? 0 : rotateY,
                        transformStyle: "preserve-3d" // Disable parallax during celestial for floating effect
                    }}
                    animate={isCelestial ? { y: [-10, 10, -10] } : { y: 0 }}
                    transition={isCelestial ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : {}}
                >
                    {isMasterTheme ? (
                        <MasterOmnitrixCore {...omnitrix} unlockedAliens={currentAliens} />
                    ) : (
                        <OmnitrixCore {...omnitrix} unlockedAliens={currentAliens} />
                    )}
                </motion.div>

                {/* Energy UI Container */}
                {(!isMasterTheme || omnitrix.state !== OMNITRIX_STATES.IDLE) && (
                    <div className={`w-full max-w-lg mt-14 p-5 rounded-2xl relative transition-all duration-1000 ${isCelestial ? '' : 'bg-gray-950/80 border border-gray-800 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden'}`}>
                        <AnimatePresence mode="wait">
                            {isCelestial ? (
                                <motion.div key="celestial-energy" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 1 }}>
                                    <CelestialEnergyOrb />
                                    {omnitrix.state === OMNITRIX_STATES.CELESTIAL_MODE && (
                                        <div className="flex justify-center gap-4 mt-12 font-serif text-xs px-2">
                                            <button onClick={() => { handleRippleEffect(); omnitrix.celestialActions.instantMaxEnergy(); }} className="px-4 py-2 border border-[#9D4EDD] text-[#e9d5ff] rounded hover:bg-[#9D4EDD]/20 transition shadow-[0_0_10px_rgba(157,78,221,0.5)]">MAX ENERGY</button>
                                            <button onClick={() => { handleRippleEffect(); omnitrix.celestialActions.skipCooldown(); }} className="px-4 py-2 border border-[#9D4EDD] text-[#e9d5ff] rounded hover:bg-[#9D4EDD]/20 transition shadow-[0_0_10px_rgba(157,78,221,0.5)]">FREEZE TIME</button>
                                            <button onClick={() => { handleRippleEffect(); omnitrix.celestialActions.reverseTransformation(); }} className="px-4 py-2 border border-[#9D4EDD] text-[#e9d5ff] rounded hover:bg-[#9D4EDD]/20 transition shadow-[0_0_10px_rgba(157,78,221,0.5)]">- REWIND -</button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="standard-energy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isMasterTheme ? 'via-cyan-600' : 'via-green-600'} to-transparent opacity-50`} />
                                    <EnergyBar energy={omnitrix.energy} isMasterTheme={isMasterTheme} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* DNA Carousel Database Title */}
                <AnimatePresence>
                    {!isCelestial && (!isMasterTheme || omnitrix.state !== OMNITRIX_STATES.IDLE) && (
                        <motion.div
                            key="dna-carousel-title"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mt-10 w-full text-center"
                        >
                            <div className="flex items-center justify-center gap-4 mb-6 opacity-60">
                                <div className={`h-px flex-1 max-w-[150px] ${isMasterTheme ? 'bg-cyan-500' : 'bg-green-500'}`} />
                                <p className={`font-mono tracking-[0.2em] text-xs font-black uppercase ${isMasterTheme ? 'text-cyan-500' : 'text-green-500'}`}>
                                    DNA Samples // {currentAliens.length}
                                </p>
                                <div className={`h-px flex-1 max-w-[150px] ${isMasterTheme ? 'bg-cyan-500' : 'bg-green-500'}`} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Content Area */}
            {isCelestial ? (
                <div className="w-full flex justify-center pb-8 pt-4">
                    {omnitrix.state === OMNITRIX_STATES.CELESTIAL_MODE && (
                        <button
                            onClick={() => omnitrix.celestialActions.restoreBalance()}
                            className="px-8 py-3 bg-white text-[#3b0764] font-serif tracking-[0.3em] text-sm uppercase font-bold hover:shadow-[0_0_30px_#ffffff] transition-all duration-300 rounded-sm"
                        >
                            Restore Balance
                        </button>
                    )}
                </div>
            ) : (
                <AnimatePresence>
                    {!isCelestial && (
                        <motion.div
                            key="alien-carousel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.6 }}
                            className="w-full"
                        >
                            <AlienCarousel
                                unlockedAliens={currentAliens}
                                selectedAlienIndex={omnitrix.selectedAlienIndex}
                                setExplicitSelection={omnitrix.setExplicitSelection}
                                isMasterUnlocked={omnitrix.isMasterUnlocked}
                                isMasterTheme={isMasterTheme}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Celestial Arbitration Modal Overlay */}
            {omnitrix.state === OMNITRIX_STATES.CELESTIAL_ARBITRATION && (
                <AlienXArbitrationModal onConsensus={() => omnitrix.advanceCelestialState(OMNITRIX_STATES.CELESTIAL_MODE)} />
            )}
        </div>
    );
};

export default OmnitrixApp;
