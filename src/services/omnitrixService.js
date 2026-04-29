import { MAX_ENERGY } from '@/utils/powerBalance';

/**
 * Service layer for complex Omnitrix business logic and energy handling.
 */
export const OmnitrixService = {
  /**
   * Calculates the exact energy regeneration amount for a given tick.
   * Ensures the energy never exceeds the maximum capacity.
   * 
   * @param {number} currentEnergy - The current energy level
   * @param {number} regenRate - The rate at which energy regenerates
   * @returns {number} The new energy level
   */
  calculateRegenAmount: (currentEnergy, regenRate) => {
    return Math.min(MAX_ENERGY, Math.max(0, currentEnergy + regenRate));
  },

  /**
   * Checks if the Omnitrix energy is critically low.
   * 
   * @param {number} currentEnergy - The current energy level
   * @returns {boolean} True if energy is below 20% capacity
   */
  isEnergyCritical: (currentEnergy) => {
    return currentEnergy <= (MAX_ENERGY * 0.2);
  }
};
