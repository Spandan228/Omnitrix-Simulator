export const aliens = [
    // Starting Core 3
    { id: 1, name: 'Heatblast', energyCost: 30, duration: 15000, unlockXP: 0, basePower: 80, color: '#f97316', image: '/aliens/1.png' },
    { id: 2, name: 'Wildmutt', energyCost: 20, duration: 20000, unlockXP: 0, basePower: 60, color: '#ea580c', image: '/aliens/2.png' },
    { id: 3, name: 'Diamondhead', energyCost: 40, duration: 18000, unlockXP: 0, basePower: 85, color: '#06b6d4', image: '/aliens/3.png' },

    // Remaining Core 10 (Sequential Unlocks)
    { id: 4, name: 'XLR8', energyCost: 25, duration: 10000, unlockXP: 30, basePower: 75, color: '#3b82f6', image: '/aliens/4.png' },
    { id: 5, name: 'Grey Matter', energyCost: 10, duration: 25000, unlockXP: 60, basePower: 20, color: '#9ca3af', image: '/aliens/5.png' },
    { id: 6, name: 'Four Arms', energyCost: 50, duration: 15000, unlockXP: 90, basePower: 95, color: '#ef4444', image: '/aliens/6.png' },
    { id: 7, name: 'Stinkfly', energyCost: 35, duration: 16000, unlockXP: 120, basePower: 65, color: '#84cc16', image: '/aliens/7.png' },
    { id: 8, name: 'Ripjaws', energyCost: 30, duration: 14000, unlockXP: 150, basePower: 70, color: '#14b8a6', image: '/aliens/8.png' },
    { id: 9, name: 'Upgrade', energyCost: 45, duration: 12000, unlockXP: 180, basePower: 80, color: '#22c55e', image: '/aliens/9.png' },
    { id: 10, name: 'Ghostfreak', energyCost: 55, duration: 10000, unlockXP: 210, basePower: 85, color: '#6b7280', image: '/aliens/10.png' },

    // Additional 10 (Late Game)
    { id: 11, name: 'Cannonbolt', energyCost: 40, duration: 15000, unlockXP: 240, basePower: 85, color: '#eab308', image: '/aliens/11.png' },
    { id: 12, name: 'Wildvine', energyCost: 30, duration: 18000, unlockXP: 270, basePower: 70, color: '#16a34a', image: '/aliens/12.png' },
    { id: 13, name: 'Blitzwolfer', energyCost: 45, duration: 14000, unlockXP: 300, basePower: 80, color: '#7e22ce', image: '/aliens/13.png' },
    { id: 14, name: 'Snare-oh', energyCost: 35, duration: 16000, unlockXP: 330, basePower: 75, color: '#c2410c', image: '/aliens/14.png' },
    { id: 15, name: 'Frankenstrike', energyCost: 60, duration: 12000, unlockXP: 360, basePower: 90, color: '#15803d', image: '/aliens/15.png' },
    { id: 16, name: 'Ditto', energyCost: 20, duration: 20000, unlockXP: 390, basePower: 40, color: '#cbd5e1', image: '/aliens/16.png' },
    { id: 17, name: 'Eye Guy', energyCost: 50, duration: 14000, unlockXP: 420, basePower: 85, color: '#f43f5e', image: '/aliens/17.png' },
    { id: 18, name: 'Way Big', energyCost: 100, duration: 6000, unlockXP: 450, basePower: 150, color: '#b91c1c', image: '/aliens/18.png' },
    { id: 19, name: 'Upchuck', energyCost: 40, duration: 15000, unlockXP: 480, basePower: 80, color: '#65a30d', image: '/aliens/19.png' },
    { id: 20, name: 'Arctiguana', energyCost: 50, duration: 14000, unlockXP: 510, basePower: 85, color: '#0ea5e9', image: '/aliens/20.png' }
];

export const getUnlockedAliens = (currentXP, isMasterUnlocked = false) => {
    if (isMasterUnlocked) return aliens;
    return aliens.filter(alien => currentXP >= alien.unlockXP);
};
