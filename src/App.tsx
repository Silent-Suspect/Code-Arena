// Cat-Command - Main App Component with Dungeon System
import { useState, useCallback } from 'react';
import type { BattleState, Gambit, Persona } from './engine/types';
import { createInitialBattleState } from './engine/mockData';
import { nextRoom } from './engine/simulator';
import { useGameLoop } from './hooks/useGameLoop';
import { ArenaView } from './components/game/ArenaView';
import { GambitCard } from './components/game/GambitCard';
import { GambitEditorDialog } from './components/game/GambitEditorDialog';
import { CharacterSelect } from './components/game/CharacterSelect';
import { cn } from './components/ui/cn';
import { Play, RotateCcw, Scroll, Cat, ArrowRight, Trophy, Skull } from 'lucide-react';

function App() {
    const [battleState, setBattleState] = useState<BattleState | null>(null);
    const [editingGambitId, setEditingGambitId] = useState<string | null>(null);

    const handleTick = useCallback((newState: BattleState) => {
        setBattleState(newState);
    }, []);

    // Only run game loop if we have a battle state
    useGameLoop({
        battleState: battleState ?? {
            tick: 0,
            allies: [],
            enemies: [],
            log: [],
            status: 'PREPARATION',
            dungeon: { room: 0, maxRooms: 0 }
        },
        onTick: handleTick
    });

    const handleSelectCharacter = (persona: Persona) => {
        setBattleState(createInitialBattleState(persona));
    };

    const handleFight = () => {
        if (!battleState) return;
        setBattleState(prev => prev ? {
            ...prev,
            log: [...prev.log, '⚔️ KAMPF!'],
            status: 'FIGHTING'
        } : null);
    };

    const handleNextRoom = () => {
        if (!battleState) return;
        setBattleState(nextRoom(battleState));
    };

    const handleReset = () => {
        setBattleState(null); // Go back to character select
    };

    const handleGambitUpdate = (gambitId: string, updates: Partial<Gambit>) => {
        if (!battleState) return;
        setBattleState(prev => prev ? {
            ...prev,
            allies: prev.allies.map(unit => ({
                ...unit,
                gambits: unit.gambits.map(g =>
                    g.id === gambitId ? { ...g, ...updates } : g
                )
            }))
        } : null);
    };

    // Show character select if no battle state
    if (!battleState) {
        return <CharacterSelect onSelect={handleSelectCharacter} />;
    }

    const playerUnit = battleState.allies[0];
    const canFight = battleState.status === 'PREPARATION';
    const isRoomCleared = battleState.status === 'ROOM_CLEARED';
    const isVictory = battleState.status === 'VICTORY';
    const isDefeat = battleState.status === 'DEFEAT';
    const isFighting = battleState.status === 'FIGHTING';

    const editingGambit = playerUnit?.gambits.find(g => g.id === editingGambitId);

    return (
        <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
            {/* Room Progress HUD */}
            <div className={cn(
                "flex items-center justify-between px-4 py-2",
                "bg-black/60 border-b border-gray-800/50"
            )}>
                <div className="flex items-center gap-2">
                    <Cat size={16} className="text-amber-400" />
                    <span className="text-sm font-medium text-gray-300">
                        {playerUnit?.name}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {Array.from({ length: battleState.dungeon.maxRooms }, (_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-6 h-2 rounded-full transition-colors",
                                i + 1 < battleState.dungeon.room && "bg-emerald-500",
                                i + 1 === battleState.dungeon.room && "bg-amber-500",
                                i + 1 > battleState.dungeon.room && "bg-gray-700"
                            )}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-400">
                    Raum {battleState.dungeon.room}/{battleState.dungeon.maxRooms}
                </span>
            </div>

            {/* Arena Section - Top 40% */}
            <div className="h-[38%] flex-shrink-0">
                <ArenaView battleState={battleState} />
            </div>

            {/* Control Bar */}
            <div className={cn(
                "flex items-center justify-center gap-4 py-3 px-4",
                "bg-black/60 border-y border-gray-800/50"
            )}>
                {canFight && (
                    <button
                        onClick={handleFight}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg",
                            "bg-gradient-to-r from-red-600 to-orange-600",
                            "hover:from-red-500 hover:to-orange-500",
                            "text-white font-bold uppercase tracking-wider",
                            "shadow-lg shadow-red-900/30",
                            "transition-all duration-200 hover:scale-105"
                        )}
                    >
                        <Play size={18} />
                        Kämpfen!
                    </button>
                )}

                {isRoomCleared && (
                    <button
                        onClick={handleNextRoom}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg",
                            "bg-gradient-to-r from-emerald-600 to-teal-600",
                            "hover:from-emerald-500 hover:to-teal-500",
                            "text-white font-bold uppercase tracking-wider",
                            "shadow-lg shadow-emerald-900/30",
                            "transition-all duration-200 hover:scale-105",
                            "animate-pulse"
                        )}
                    >
                        <ArrowRight size={18} />
                        Nächster Raum
                    </button>
                )}

                {isVictory && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Trophy size={24} className="animate-bounce" />
                            <span className="text-lg font-bold">DUNGEON GESCHAFFT!</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg",
                                "bg-violet-600 hover:bg-violet-500",
                                "text-white font-medium"
                            )}
                        >
                            <RotateCcw size={16} />
                            Neues Spiel
                        </button>
                    </div>
                )}

                {isDefeat && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-red-400">
                            <Skull size={24} />
                            <span className="text-lg font-bold">NIEDERLAGE</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg",
                                "bg-violet-600 hover:bg-violet-500",
                                "text-white font-medium"
                            )}
                        >
                            <RotateCcw size={16} />
                            Nochmal versuchen
                        </button>
                    </div>
                )}

                {isFighting && (
                    <div className="flex items-center gap-2 text-amber-400">
                        <Cat size={20} className="animate-bounce" />
                        <span className="text-sm font-medium">Runde {battleState.tick}...</span>
                    </div>
                )}
            </div>

            {/* Gambit Section - Bottom */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Section Header */}
                <div className={cn(
                    "flex items-center gap-2 px-4 py-3",
                    "bg-gray-900/50"
                )}>
                    <Scroll size={18} className="text-violet-400" />
                    <h2 className="text-lg font-bold text-gray-200">
                        Gambits
                    </h2>
                    <span className="text-xs text-gray-500 ml-2">
                        {playerUnit?.name}'s KI
                    </span>
                    {canFight && (
                        <span className="ml-auto text-xs text-violet-400">
                            Tippe zum Bearbeiten ✏️
                        </span>
                    )}
                </div>

                {/* Gambit List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {playerUnit?.gambits.map((gambit, index) => (
                        <GambitCard
                            key={gambit.id}
                            gambit={gambit}
                            index={index}
                            isEditable={canFight}
                            isTriggered={isFighting && playerUnit.lastTriggeredGambitId === gambit.id}
                            onEdit={() => setEditingGambitId(gambit.id)}
                        />
                    ))}
                </div>

                {/* Combat Log */}
                <div className={cn(
                    "h-28 flex-shrink-0 overflow-y-auto",
                    "bg-black/40 border-t border-gray-800/50",
                    "px-4 py-2"
                )}>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Kampflog
                    </div>
                    <div className="space-y-1">
                        {battleState.log.slice(-8).map((entry, i) => (
                            <div key={i} className="text-xs text-gray-400 font-mono">
                                {entry}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gambit Editor Dialog */}
            {editingGambit && (
                <GambitEditorDialog
                    gambit={editingGambit}
                    isOpen={!!editingGambitId}
                    onClose={() => setEditingGambitId(null)}
                    onUpdate={(updates) => handleGambitUpdate(editingGambitId!, updates)}
                />
            )}
        </div>
    );
}

export default App;
