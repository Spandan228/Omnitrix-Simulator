export const MAX_ENERGY = 100;
export const XP_PER_TRANSFORMATION = 10;
export const ENERGY_REGEN_RATE = 2; // Energy per second
export const COOLDOWN_DURATION = 15000; // 15 seconds cooldown

export const calculateEnergyDrain = (alien, isMasterUnlocked) => {
    if (isMasterUnlocked) return 0;
    return alien.energyCost;
};

export const hasEnoughEnergy = (alien, currentEnergy, isMasterUnlocked) => {
    if (isMasterUnlocked) return true;
    return currentEnergy >= alien.energyCost;
};

export const getNextXP = (currentXP) => {
    return currentXP + XP_PER_TRANSFORMATION;
};
