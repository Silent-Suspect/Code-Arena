// Unit Card Component - Displays a single unit with emoji and HP
// Phase 5: Shows status effects
import type { Unit } from '../../engine/types';
import { HpBar } from './HpBar';
import { cn } from '../ui/cn';
import { Shield, Wind, Battery } from 'lucide-react';

interface UnitCardProps {
    unit: Unit;
    isEnemy?: boolean;
}

export function UnitCard({ unit, isEnemy = false }: UnitCardProps) {
    const { isBlocking, isDodging, isCharged } = unit.statusEffects;
    const hasStatusEffect = isBlocking || isDodging || isCharged;

    return (
        <div
            className={cn(
                "flex flex-col items-center p-3 rounded-xl min-w-[100px]",
                "bg-gradient-to-b from-gray-800/80 to-gray-900/80",
                "border border-gray-700/50",
                "backdrop-blur-sm",
                "transition-all duration-300",
                unit.isDead && "opacity-40 grayscale",
                isBlocking && "ring-2 ring-blue-400 border-blue-400/50",
                isDodging && "ring-2 ring-cyan-400 border-cyan-400/50",
                isCharged && "ring-2 ring-amber-400 border-amber-400/50 animate-pulse"
            )}
        >
            {/* Emoji Avatar */}
            <div className="relative">
                <div
                    className={cn(
                        "text-4xl mb-2 transition-transform duration-200",
                        !unit.isDead && "hover:scale-110",
                        isEnemy && "transform -scale-x-100",
                        isDodging && "animate-bounce"
                    )}
                >
                    {unit.emoji}
                </div>

                {/* Status Effect Indicators */}
                {hasStatusEffect && (
                    <div className="absolute -top-1 -right-1 flex gap-0.5">
                        {isBlocking && (
                            <div className="bg-blue-500 rounded-full p-1">
                                <Shield size={10} className="text-white" />
                            </div>
                        )}
                        {isDodging && (
                            <div className="bg-cyan-500 rounded-full p-1">
                                <Wind size={10} className="text-white" />
                            </div>
                        )}
                        {isCharged && (
                            <div className="bg-amber-500 rounded-full p-1">
                                <Battery size={10} className="text-white" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Name */}
            <span className={cn(
                "text-sm font-medium mb-1 text-center",
                isEnemy ? "text-red-300" : "text-emerald-300"
            )}>
                {unit.name}
            </span>

            {/* HP Bar */}
            <div className="w-full px-1">
                <HpBar current={unit.stats.hp} max={unit.stats.maxHp} />
            </div>

            {/* HP Text */}
            <span className="text-xs text-gray-400 mt-1">
                {unit.stats.hp}/{unit.stats.maxHp}
            </span>
        </div>
    );
}
