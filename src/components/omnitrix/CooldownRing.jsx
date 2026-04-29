import React from 'react';
import { motion } from 'framer-motion';

const CooldownRing = ({ progress }) => {
    const radius = 170;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90 origin-center"
            >
                <circle
                    stroke="#450a0a"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <motion.circle
                    stroke="#ef4444" /* Red */
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ type: "tween", duration: 0.2, ease: "linear" }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
        </div>
    );
};

export default React.memo(CooldownRing);
