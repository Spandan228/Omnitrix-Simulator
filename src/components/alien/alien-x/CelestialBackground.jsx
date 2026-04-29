import React from 'react';
import { motion } from 'framer-motion';

const CelestialBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050014]">
            {/* Deep space radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#9D4EDD_0%,_transparent_60%)] opacity-30 mix-blend-screen" />

            {/* Very slow rotating cosmic distortion */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-50%] bg-[radial-gradient(ellipse_at_top,_transparent_20%,_#3b0764_80%)] opacity-40 mix-blend-overlay"
            />

            {/* Subtle CSS starfield using linear gradients and background-size for pure CSS particles */}
            <div className="absolute inset-0 animate-[pulse_5s_ease-in-out_Infinity] opacity-50 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.8), rgba(0,0,0,0))',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px'
                }}
            />
            <div className="absolute inset-0 animate-[pulse_7s_ease-in-out_Infinity] opacity-30 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(1.5px 1.5px at 10px 10px, #e9d5ff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 150px, #e9d5ff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 80px 120px, #e9d5ff, rgba(0,0,0,0))',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '300px 300px',
                    transform: 'rotate(45deg)'
                }}
            />
        </div>
    );
};

export default CelestialBackground;
