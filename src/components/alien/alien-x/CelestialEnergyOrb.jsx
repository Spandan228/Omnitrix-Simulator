import React from 'react';
import { motion } from 'framer-motion';

const CelestialEnergyOrb = () => {
    return (
        <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
            {/* Infinite energy aura */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-[#9D4EDD] blur-2xl"
            />
            {/* Core Orb */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full bg-white shadow-[0_0_30px_#ffffff] relative overflow-hidden"
            >
                {/* Surface texture to orb */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_transparent_40%,_#3b0764_100%)] opacity-70" />
            </motion.div>
            <div className="absolute -bottom-8 text-center text-[#e9d5ff] font-serif tracking-[0.3em] text-xs uppercase opacity-80 shadow-[#9D4EDD]">
                Unlimited Energy
            </div>
        </div>
    );
};

export default CelestialEnergyOrb;
