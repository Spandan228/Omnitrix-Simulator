import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

import { OMNITRIX_STATES } from '@/constants/omnitrixStates';
import { OMNITRIX_MODES } from '@/utils/stateMachine';

const DynamicBackground = ({ state, mode }) => {

    // Determine the environment color theme based on device state
    const theme = useMemo(() => {
        if (mode === OMNITRIX_MODES.MASTER_UNLOCKED) return 'gold';
        if (state === OMNITRIX_STATES.COOLDOWN) return 'red';
        if (state === OMNITRIX_STATES.ACTIVE) return 'green-bright';
        return 'green-dark';
    }, [state, mode]);

    // Map theme to exact tailwind/hex values for the SVG grid
    const getStrokeColor = () => {
        switch (theme) {
            case 'gold': return 'rgba(234, 179, 8, 0.15)'; // yellow-500
            case 'red': return 'rgba(239, 68, 68, 0.15)'; // red-500
            case 'green-bright': return 'rgba(74, 222, 128, 0.25)'; // green-400
            case 'green-dark': default: return 'rgba(34, 197, 94, 0.1)'; // green-500
        }
    };

    // How fast the grid moves
    const getAnimationDuration = () => {
        if (state === OMNITRIX_STATES.ACTIVE) return 10;
        if (state === OMNITRIX_STATES.COOLDOWN) return 30;
        return 40;
    };

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-black">
            {/* Soft global glow behind the grid */}
            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    background: theme === 'gold'
                        ? 'radial-gradient(circle at 50% 50%, rgba(202, 138, 4, 0.4) 0%, rgba(0,0,0,1) 70%)'
                        : theme === 'red'
                            ? 'radial-gradient(circle at 50% 50%, rgba(185, 28, 28, 0.4) 0%, rgba(0,0,0,1) 70%)'
                            : theme === 'green-bright'
                                ? 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.5) 0%, rgba(0,0,0,1) 100%)'
                                : 'radial-gradient(circle at 50% 50%, rgba(21, 128, 61, 0.2) 0%, rgba(0,0,0,1) 70%)'
                }}
                transition={{ duration: 1.5 }}
            />

            {/* Scrolling SVG Tech Hexagons */}
            <motion.div
                className="absolute w-[200vw] h-[200vh] -top-[50vh] -left-[50vw]"
                animate={{
                    y: [0, 100]
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: getAnimationDuration()
                }}
            >
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hexagons" width="100" height="173.2" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                            <path d="M50 0 L100 28.86 L100 86.6 L50 115.47 L0 86.6 L0 28.86 Z M50 173.2 L100 144.34 L100 86.6 L50 115.47 L0 86.6 L0 144.34 Z"
                                fill="none"
                                stroke={getStrokeColor()}
                                strokeWidth="2"
                                style={{ transition: 'stroke 1.5s ease-in-out' }}
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hexagons)" />
                </svg>
            </motion.div>

            {/* Vignette overlay to darken the edges and make the watch pop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
    );
};

export default DynamicBackground;
