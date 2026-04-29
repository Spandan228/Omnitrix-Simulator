import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const AlienCarousel = ({ unlockedAliens, selectedAlienIndex, setExplicitSelection, isMasterUnlocked, isMasterTheme }) => {
    const scrollRef = useRef(null);

    // Auto-scroll the gallery to keep the currently selected alien centered
    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const selectedElement = container.children[selectedAlienIndex];
            if (selectedElement) {
                const scrollLeft = selectedElement.offsetLeft - container.clientWidth / 2 + selectedElement.clientWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [selectedAlienIndex]);

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center justify-end pb-4 z-40 pointer-events-auto"
        >
            <div className={`text-xs font-mono tracking-[0.3em] mb-2 uppercase ${isMasterTheme ? 'text-cyan-500/50' : 'text-green-500/50'}`}>
                Active DNA Database
            </div>

            <div
                ref={scrollRef}
                className="w-full max-w-4xl flex gap-4 overflow-x-auto no-scrollbar px-[50vw] snap-x snap-mandatory items-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {unlockedAliens.map((alien, i) => {
                    const isSelected = i === selectedAlienIndex;
                    const colorTheme = isMasterUnlocked ? (isMasterTheme ? 'border-cyan-400 text-cyan-400' : 'border-yellow-500 text-yellow-500') : (isMasterTheme ? 'border-cyan-500 text-cyan-500' : 'border-green-500 text-green-500');
                    const dimTheme = isMasterUnlocked ? (isMasterTheme ? 'border-cyan-900/40 text-cyan-700/50' : 'border-yellow-900/40 text-yellow-700/50') : (isMasterTheme ? 'border-cyan-900/40 text-cyan-700/50' : 'border-green-900/40 text-green-700/50');

                    return (
                        <motion.button
                            key={alien.id || i}
                            onClick={() => setExplicitSelection(i, null)}
                            className={`relative flex-shrink-0 snap-center rounded-lg border-2 bg-black/50 backdrop-blur-md transition-all duration-300 w-16 h-16 flex items-center justify-center overflow-hidden hover:scale-110 hover:border-white group
                                ${isSelected ? `${colorTheme} scale-110 shadow-[0_0_15px_currentColor]` : dimTheme}`
                            }
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {/* If they don't have images, just show initial */}
                            {alien.image ? (
                                <img
                                    src={alien.image}
                                    alt={alien.name}
                                    className={`w-full h-full object-contain p-1 mix-blend-screen transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}
                                    style={{
                                        filter: isMasterTheme
                                            ? `sepia(1) hue-rotate(140deg) saturate(300%) contrast(150%) brightness(1.2) ${isSelected ? 'drop-shadow(0 0 5px currentColor)' : ''}`
                                            : (isSelected ? 'drop-shadow(0 0 5px currentColor)' : 'none')
                                    }}
                                />
                            ) : (
                                <span className="font-bold text-xl">{alien.name.charAt(0)}</span>
                            )}

                            {/* Selection Indicator Dot */}
                            {isSelected && (
                                <div className="absolute -bottom-1 w-full h-1 bg-current" />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </motion.div>
    );
};

export default AlienCarousel;
