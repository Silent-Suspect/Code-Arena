// Arena View Component - Displays allies vs enemies
import type { BattleState } from '../../engine/types';
import { getRoomDescription } from '../../engine/mockData';
import { UnitCard } from './UnitCard';
import { cn } from '../ui/cn';
import { Swords, MapPin } from 'lucide-react';

interface ArenaViewProps {
    battleState: BattleState;
}

const statusLabels: Record<BattleState['status'], string> = {
    'PREPARATION': 'Vorbereitung',
    'FIGHTING': 'Kampf',
    'ROOM_CLEARED': 'Raum geschafft!',
    'VICTORY': 'Sieg!',
    'DEFEAT': 'Niederlage'
};

export function ArenaView({ battleState }: ArenaViewProps) {
    const roomName = getRoomDescription(battleState.dungeon.room);

    return (
        <div className={cn(
            "h-full flex flex-col",
            "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
            "relative overflow-hidden"
        )}>
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)]" />

            {/* Room & Status Banner */}
            <div className={cn(
                "relative z-10 text-center py-2",
                "bg-black/30 backdrop-blur-sm border-b border-gray-800/50"
            )}>
                {/* Room indicator */}
                <div className="flex items-center justify-center gap-2 mb-1">
                    <MapPin size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-400">{roomName}</span>
                </div>

                {/* Status */}
                <span className={cn(
                    "text-sm font-bold uppercase tracking-wider",
                    battleState.status === 'PREPARATION' && "text-amber-400",
                    battleState.status === 'FIGHTING' && "text-red-400 animate-pulse",
                    battleState.status === 'ROOM_CLEARED' && "text-emerald-400",
                    battleState.status === 'VICTORY' && "text-emerald-400",
                    battleState.status === 'DEFEAT' && "text-red-600"
                )}>
                    {statusLabels[battleState.status]}
                </span>
                {battleState.status === 'FIGHTING' && (
                    <span className="ml-2 text-gray-500 text-xs">
                        Runde {battleState.tick}
                    </span>
                )}
            </div>

            {/* Battle Field */}
            <div className="relative z-10 flex-1 flex items-center justify-center gap-8 px-4">
                {/* Allies Side */}
                <div className="flex flex-col gap-3">
                    {battleState.allies.map(unit => (
                        <UnitCard key={unit.id} unit={unit} />
                    ))}
                </div>

                {/* VS Indicator */}
                <div className="flex flex-col items-center gap-2">
                    <Swords className={cn(
                        "w-8 h-8",
                        battleState.status === 'FIGHTING' ? "text-red-500 animate-pulse" : "text-gray-500"
                    )} />
                    <span className="text-xs text-gray-600 uppercase tracking-widest">vs</span>
                </div>

                {/* Enemies Side */}
                <div className="flex flex-col gap-3">
                    {battleState.enemies.map(unit => (
                        <UnitCard key={unit.id} unit={unit} isEnemy />
                    ))}
                </div>
            </div>
        </div>
    );
}
