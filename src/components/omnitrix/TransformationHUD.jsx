import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { OMNITRIX_STATES } from '@/constants/omnitrixStates';

const TransformationHUD = ({ state, activeAlien, isMasterUnlocked }) => {
    const isActive = state === OMNITRIX_STATES.ACTIVE;
    const themeColor = isMasterUnlocked ? '#eab308' : '#22c55e'; // gold or green
    const themeShadow = isMasterUnlocked ? 'drop-shadow-[0_0_10px_#eab308]' : 'drop-shadow-[0_0_10px_#22c55e]';

    return (
        <AnimatePresence>
            {isActive && activeAlien && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-8"
                >
                    {/* Top HUD Frame */}
                    <motion.div
                        initial={{ y: -50 }} animate={{ y: 0 }} transition={{ delay: 0.1 }}
                        className="w-full flex justify-between items-start"
                    >
                        {/* Top Left: Target Name & Bio-Signature */}
                        <div className={`flex flex-col border-l-4 pl-4 uppercase font-mono tracking-widest ${themeShadow}`} style={{ borderColor: themeColor, color: themeColor }}>
                            <span className="text-3xl font-black mb-1">{activeAlien.name}</span>
                            <span className="text-[10px] opacity-70">DNA SEQUENCE AUTHORIZED</span>
                            <span className="text-[10px] opacity-70">SUBJECT STATUS: STABLE</span>
                        </div>

                        {/* Top Right: Technical Diagnostics */}
                        <div className={`flex flex-col text-right border-r-4 pr-4 uppercase font-mono tracking-widest ${themeShadow}`} style={{ borderColor: themeColor, color: themeColor }}>
                            <span className="text-xl font-bold mb-1">SYSTEM LINK</span>
                            <span className="text-[10px] opacity-70">SYNC RATE: 99.8%</span>
                            <span className="text-[10px] opacity-70">MODE: {isMasterUnlocked ? 'MASTER' : 'STANDARD'}</span>
                        </div>
                    </motion.div>

                    {/* Middle: Screen Shake / Reticle Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <svg width="400" height="400" viewBox="0 0 400 400" className="animate-[spin_20s_linear_infinite]" style={{ fill: 'none', stroke: themeColor, strokeWidth: 1 }}>
                            <circle cx="200" cy="200" r="190" strokeDasharray="10 20" />
                            <circle cx="200" cy="200" r="150" strokeDasharray="50 50" />
                            <path d="M 200 0 L 200 400 M 0 200 L 400 200" strokeWidth="0.5" />
                        </svg>
                    </div>

                    {/* Bottom HUD Frame */}
                    <motion.div
                        initial={{ y: 50 }} animate={{ y: 0 }} transition={{ delay: 0.1 }}
                        className="w-full flex justify-between items-end"
                    >
                        {/* Bottom Left: Power Levels */}
                        <div className={`flex flex-col border-l-4 pl-4 uppercase font-mono tracking-widest ${themeShadow}`} style={{ borderColor: themeColor, color: themeColor }}>
                            <span className="text-[10px] opacity-70 mb-1">ENERGY OUTPUT</span>
                            <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, height: 4 }}
                                        animate={{ opacity: 1, height: 16 }}
                                        transition={{ delay: 0.2 + (i * 0.05) }}
                                        className="w-2"
                                        style={{ backgroundColor: themeColor }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Bottom Right: Time Remaining / Master Control Status */}
                        <div className={`flex flex-col text-right border-r-4 pr-4 uppercase font-mono tracking-widest ${themeShadow}`} style={{ borderColor: themeColor, color: themeColor }}>
                            {isMasterUnlocked ? (
                                <span className="text-xl font-bold animate-pulse">TIME LIMIT: NULL</span>
                            ) : (
                                <span className="text-xl font-bold">10:00:00</span>
                            )}
                            <span className="text-[10px] opacity-70">ESTIMATED CYCLE</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TransformationHUD;
