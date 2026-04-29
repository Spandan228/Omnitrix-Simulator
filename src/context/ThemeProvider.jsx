import React, { createContext, useContext, useState, useEffect } from 'react';
import { OMNITRIX_STATES } from '@/constants/omnitrixStates';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, omnitrixState }) => {
    const [theme, setTheme] = useState('DEFAULT');

    // Automatically toggle theme based on state
    useEffect(() => {
        if (
            omnitrixState === OMNITRIX_STATES.ALIEN_X_DISCOVERY ||
            omnitrixState === OMNITRIX_STATES.ALIEN_X_AWAKENING ||
            omnitrixState === OMNITRIX_STATES.CELESTIAL_ARBITRATION ||
            omnitrixState === OMNITRIX_STATES.CELESTIAL_MODE ||
            omnitrixState === OMNITRIX_STATES.REALITY_STABILIZING
        ) {
            setTheme('CELESTIAL_THEME');
        } else {
            setTheme('DEFAULT');
        }
    }, [omnitrixState]);

    return (
        <ThemeContext.Provider value={{ theme, isCelestial: theme === 'CELESTIAL_THEME' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
