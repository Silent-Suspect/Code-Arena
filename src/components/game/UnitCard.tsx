// Unit Card Component - Displays a single unit with emoji and HP
import type { Unit } from '../../engine/types';
import { HpBar } from './HpBar';
import { cn } from '../ui/cn';
import { Shield } from 'lucide-react';

interface UnitCardProps {
    unit: Unit;
    isEnemy?: boolean;
}

export function UnitCard({ unit, isEnemy = false }: UnitCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center p-3 rounded-xl min-w-[100px]",
                "bg-gradient-to-b from-gray-800/80 to-gray-900/80",
                "border border-gray-700/50",
                "backdrop-blur-sm",
                "transition-all duration-300",
                unit.isDead && "opacity-40 grayscale",
                unit.isBlocking && "ring-2 ring-blue-400 border-blue-400/50"
            )}
        >
            {/* Emoji Avatar */}
            <div className="relative">
                <div
                    className={cn(
                        "text-4xl mb-2 transition-transform duration-200",
                        !unit.isDead && "hover:scale-110",
                        isEnemy && "transform -scale-x-100"
                    )}
                >
                    {unit.emoji}
                </div>

                {/* Blocking Indicator */}
                {unit.isBlocking && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Shield size={12} className="text-white" />
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
