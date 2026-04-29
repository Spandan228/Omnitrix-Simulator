import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AlienXArbitrationModal = ({ onConsensus }) => {
    const [serenaApproved, setSerenaApproved] = useState(false);
    const [bellicusApproved, setBellicusApproved] = useState(false);

    useEffect(() => {
        if (serenaApproved && bellicusApproved) {
            // Slight delay before completing consensus for dramatic effect
            const t = setTimeout(() => {
                onConsensus();
            }, 1000);
            return () => clearTimeout(t);
        }
    }, [serenaApproved, bellicusApproved, onConsensus]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
            >
                <motion.h2
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-white font-serif tracking-[0.5em] text-2xl mb-16 shadow-[0_0_15px_#ffffff]"
                >
                    CELESTIAL ARBITRATION
                </motion.h2>

                <div className="flex gap-12 sm:gap-24 items-center">

                    {/* Serena Panel */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => setSerenaApproved(true)}
                    >
                        <motion.div
                            animate={{
                                boxShadow: serenaApproved ? "0 0 50px #60a5fa" : "0 0 10px #2563eb",
                                scale: serenaApproved ? 1.1 : 1
                            }}
                            className={`w-32 h-48 sm:w-48 sm:h-64 border-2 transition-colors duration-500 rounded-lg flex items-center justify-center relative overflow-hidden ${serenaApproved ? 'border-blue-300 bg-blue-900/30' : 'border-blue-700 bg-blue-950/20 hover:border-blue-400 hover:bg-blue-900/40'}`}
                        >
                            {/* Inner abstract representation of Serena */}
                            <div className={`absolute w-full h-full bg-[radial-gradient(circle_at_center,_#93c5fd_0%,_transparent_60%)] transition-opacity duration-1000 ${serenaApproved ? 'opacity-80' : 'opacity-20 group-hover:opacity-40'}`} />
                            <span className={`z-10 font-serif tracking-widest text-sm transition-colors ${serenaApproved ? 'text-blue-100' : 'text-blue-500'}`}>SERENA</span>

                            {serenaApproved && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 border-4 border-blue-400 rounded-lg"
                                />
                            )}
                        </motion.div>
                        <p className={`mt-4 font-mono text-xs tracking-widest ${serenaApproved ? 'text-blue-300' : 'text-gray-600'}`}>{serenaApproved ? "APPROVED" : "AWAITING"}</p>
                    </motion.div>

                    {/* Bellicus Panel */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 2, duration: 1 }}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => setBellicusApproved(true)}
                    >
                        <motion.div
                            animate={{
                                boxShadow: bellicusApproved ? "0 0 50px #f87171" : "0 0 10px #dc2626",
                                scale: bellicusApproved ? 1.1 : 1
                            }}
                            className={`w-32 h-48 sm:w-48 sm:h-64 border-2 transition-colors duration-500 rounded-lg flex items-center justify-center relative overflow-hidden ${bellicusApproved ? 'border-red-300 bg-red-900/30' : 'border-red-800 bg-red-950/20 hover:border-red-500 hover:bg-red-900/40'}`}
                        >
                            {/* Inner abstract representation of Bellicus */}
                            <div className={`absolute w-full h-full bg-[radial-gradient(circle_at_center,_#fca5a5_0%,_transparent_60%)] transition-opacity duration-1000 ${bellicusApproved ? 'opacity-80' : 'opacity-20 group-hover:opacity-40'}`} />
                            <span className={`z-10 font-serif tracking-widest text-sm transition-colors ${bellicusApproved ? 'text-red-100' : 'text-red-600'}`}>BELLICUS</span>

                            {bellicusApproved && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 border-4 border-red-500 rounded-lg"
                                />
                            )}
                        </motion.div>
                        <p className={`mt-4 font-mono text-xs tracking-widest ${bellicusApproved ? 'text-red-300' : 'text-gray-600'}`}>{bellicusApproved ? "APPROVED" : "AWAITING"}</p>
                    </motion.div>

                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3, duration: 1 }}
                    className="mt-16 text-[#e9d5ff] font-sans text-sm tracking-wide opacity-50 text-center max-w-md"
                >
                    Motion to assume direct control of Alien X. <br /> Consensus required.
                </motion.p>
            </motion.div>
        </AnimatePresence>
    );
}

export default AlienXArbitrationModal;
