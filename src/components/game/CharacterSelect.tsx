// Character Selection Screen
import type { Persona } from '../../engine/types';
import { ALL_PERSONAS } from '../../engine/mockData';
import { cn } from '../ui/cn';
import { Cat, Zap, Shield } from 'lucide-react';

interface CharacterSelectProps {
    onSelect: (persona: Persona) => void;
}

export function CharacterSelect({ onSelect }: CharacterSelectProps) {
    return (
        <div className={cn(
            "min-h-screen flex flex-col items-center justify-center p-6",
            "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
        )}>
            {/* Title */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Cat size={40} className="text-amber-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Cat-Command
                    </h1>
                </div>
                <p className="text-gray-400 text-lg">Wähle deinen Krieger</p>
            </div>

            {/* Character Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                {ALL_PERSONAS.map((persona) => (
                    <button
                        key={persona.id}
                        onClick={() => onSelect(persona)}
                        className={cn(
                            "group flex flex-col items-center p-6 rounded-2xl",
                            "bg-gradient-to-b from-gray-800/80 to-gray-900/80",
                            "border-2 border-gray-700/50",
                            "hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20",
                            "transition-all duration-300 hover:scale-105",
                            "cursor-pointer"
                        )}
                    >
                        {/* Emoji & Name */}
                        <div className="text-6xl mb-4 group-hover:animate-bounce">
                            {persona.emoji}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {persona.name}
                        </h2>
                        <p className="text-amber-400 text-sm mb-4 italic">
                            "{persona.description}"
                        </p>

                        {/* Stats */}
                        <div className="w-full space-y-2 text-sm">
                            <StatBar
                                label="HP"
                                value={persona.baseStats.maxHp}
                                max={100}
                                color="bg-emerald-500"
                            />
                            <StatBar
                                label="ATK"
                                value={persona.baseStats.atk}
                                max={20}
                                color="bg-red-500"
                            />
                            <StatBar
                                label="DEF"
                                value={persona.baseStats.def}
                                max={10}
                                color="bg-blue-500"
                            />
                            <StatBar
                                label="SPD"
                                value={persona.baseStats.speed}
                                max={20}
                                color="bg-amber-500"
                            />
                        </div>

                        {/* Play hint */}
                        <div className={cn(
                            "mt-4 px-4 py-2 rounded-full",
                            "bg-amber-600/20 text-amber-400",
                            "text-sm font-medium",
                            "group-hover:bg-amber-600 group-hover:text-white",
                            "transition-all"
                        )}>
                            {persona.id === 'felix' ? (
                                <span className="flex items-center gap-2"><Zap size={14} /> Schnell spielen</span>
                            ) : (
                                <span className="flex items-center gap-2"><Shield size={14} /> Tank spielen</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <p className="text-gray-600 text-xs mt-8">
                5 Räume • 5 Gegner • 1 Boss
            </p>
        </div>
    );
}

// Stat bar component
function StatBar({ label, value, max, color }: {
    label: string;
    value: number;
    max: number;
    color: string;
}) {
    const percentage = Math.min(100, (value / max) * 100);

    return (
        <div className="flex items-center gap-2">
            <span className="w-10 text-gray-400 text-xs">{label}</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all", color)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-8 text-right text-gray-300 text-xs">{value}</span>
        </div>
    );
}
