import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, text, isMasterUnlocked = false, className = "" }) => {
    const [isHovered, setIsHovered] = useState(false);

    const themeColor = isMasterUnlocked ? 'border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]';

    return (
        <div
            className={`relative flex justify-center items-center ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute -top-16 whitespace-nowrap px-4 py-2 bg-black/80 backdrop-blur-md border ${themeColor} rounded pointer-events-none z-50 font-mono text-xs font-bold tracking-widest uppercase select-none`}
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
