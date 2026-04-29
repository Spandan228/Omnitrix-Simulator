import React from 'react';
import { OmnitrixService } from '@/services/omnitrixService';
import { MAX_ENERGY } from '@/utils/powerBalance';

const EnergyBar = ({ energy, maxEnergy = MAX_ENERGY, isMasterTheme }) => {
    const percentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));
    const isCritical = OmnitrixService.isEnergyCritical(energy);

    const activeColor = isMasterTheme ? 'bg-cyan-500' : 'bg-green-500';
    const activeShadow = isMasterTheme ? 'shadow-[0_0_15px_#06b6d4]' : 'shadow-[0_0_15px_#22c55e]';

    const barColor = !isCritical ? activeColor : 'bg-red-500';
    const shadowColor = !isCritical ? activeShadow : 'shadow-[0_0_15px_#ef4444]';

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center">
            <div className="text-gray-400 text-xs mb-2 font-black tracking-widest uppercase">Energy Reserve</div>
            <div className="w-full h-3 bg-gray-950 rounded-full border border-gray-800 overflow-hidden relative shadow-inner">
                <div
                    className={`h-full ${barColor} ${shadowColor} transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100%_4px] mix-blend-overlay pointer-events-none" />
            </div>
        </div>
    );
};

export default EnergyBar;
