// Unit Card Component - Displays a single unit with emoji and HP
import type { Unit } from '../../engine/types';
import { HpBar } from './HpBar';
import { cn } from '../ui/cn';

interface UnitCardProps {
    unit: Unit;
    isEnemy?: boolean;
}

export function UnitCard({ unit, isEnemy = false }: UnitCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center p-3 rounded-xl",
                "bg-gradient-to-b from-gray-800/80 to-gray-900/80",
                "border border-gray-700/50",
                "backdrop-blur-sm",
                "transition-all duration-300",
                unit.isDead && "opacity-40 grayscale"
            )}
        >
            {/* Emoji Avatar */}
            <div
                className={cn(
                    "text-4xl mb-2 transition-transform duration-200",
                    !unit.isDead && "hover:scale-110",
                    isEnemy && "transform -scale-x-100"
                )}
            >
                {unit.emoji}
            </div>

            {/* Name */}
            <span className="text-sm font-medium text-gray-200 mb-1">
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
