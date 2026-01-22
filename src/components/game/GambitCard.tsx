// Gambit Card Component - Displays a single gambit configuration
// Phase 5: With DODGE and CHARGE actions
import type { Gambit } from '../../engine/types';
import { cn } from '../ui/cn';
import { Target, Zap, Shield, Clock, Edit2, Wind, Battery } from 'lucide-react';

interface GambitCardProps {
    gambit: Gambit;
    index: number;
    isEditable?: boolean;
    isTriggered?: boolean;
    onEdit?: () => void;
}

const conditionLabels: Record<Gambit['condition'], string> = {
    'ALWAYS': 'Immer',
    'HP_BELOW_30': 'HP < 30%',
    'HP_BELOW_50': 'HP < 50%',
    'ENEMY_HP_ABOVE_50': 'Gegner HP > 50%',
    'ENEMY_IS_BLOCKING': 'Gegner blockt',
    'MANA_FULL': 'Mana voll'
};

const targetLabels: Record<Gambit['target'], string> = {
    'SELF': 'Selbst',
    'ALLY_LOWEST_HP': 'Verbündeter (niedrige HP)',
    'ENEMY_CLOSEST': 'Nächster Gegner',
    'ENEMY_LOWEST_HP': 'Gegner (niedrige HP)',
    'ENEMY_STRONGEST': 'Stärkster Gegner'
};

const actionLabels: Record<Gambit['action'], string> = {
    'ATTACK': 'Angriff',
    'HEAL': 'Heilen',
    'BLOCK': 'Blocken',
    'DODGE': 'Ausweichen',
    'CHARGE': 'Aufladen',
    'WAIT': 'Warten'
};

const actionIcons: Record<Gambit['action'], typeof Zap> = {
    'ATTACK': Zap,
    'HEAL': Shield,
    'BLOCK': Target,
    'DODGE': Wind,
    'CHARGE': Battery,
    'WAIT': Clock
};

export function GambitCard({ gambit, index, isEditable = false, isTriggered = false, onEdit }: GambitCardProps) {
    const ActionIcon = actionIcons[gambit.action];

    return (
        <div
            onClick={isEditable && onEdit ? onEdit : undefined}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "bg-gradient-to-r from-gray-800/60 to-gray-900/60",
                "border border-gray-700/40",
                "transition-all duration-300",
                !gambit.active && "opacity-50",
                isEditable && "cursor-pointer hover:border-violet-500/50 hover:bg-gray-800/80",
                isTriggered && "ring-2 ring-amber-400 animate-pulse border-amber-400/50"
            )}
        >
            {/* Priority Number */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isTriggered ? "bg-amber-500/40 text-amber-200" : "bg-violet-600/30 text-violet-300",
                "font-bold text-sm"
            )}>
                {index + 1}
            </div>

            {/* Gambit Info */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-amber-400 font-medium">
                        WENN {conditionLabels[gambit.condition]}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="text-cyan-400">
                        {targetLabels[gambit.target]}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className={cn(
                        "flex items-center gap-1 font-medium",
                        gambit.action === 'ATTACK' && "text-red-400",
                        gambit.action === 'HEAL' && "text-emerald-400",
                        gambit.action === 'BLOCK' && "text-blue-400",
                        gambit.action === 'DODGE' && "text-cyan-400",
                        gambit.action === 'CHARGE' && "text-amber-400",
                        gambit.action === 'WAIT' && "text-gray-400"
                    )}>
                        <ActionIcon size={14} />
                        {actionLabels[gambit.action]}
                    </span>
                </div>
            </div>

            {/* Edit indicator or Active Toggle */}
            {isEditable ? (
                <Edit2 size={16} className="text-gray-500 flex-shrink-0" />
            ) : (
                <div className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0",
                    gambit.active ? "bg-emerald-500" : "bg-gray-600"
                )} />
            )}
        </div>
    );
}
