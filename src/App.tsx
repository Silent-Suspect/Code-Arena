// Cat-Command - Main App Component
import { useState, useCallback } from 'react';
import type { BattleState, Gambit } from './engine/types';
import { createInitialBattleState } from './engine/mockData';
import { useGameLoop } from './hooks/useGameLoop';
import { ArenaView } from './components/game/ArenaView';
import { GambitCard } from './components/game/GambitCard';
import { GambitEditorDialog } from './components/game/GambitEditorDialog';
import { cn } from './components/ui/cn';
import { Play, RotateCcw, Scroll, Cat } from 'lucide-react';

function App() {
    const [battleState, setBattleState] = useState<BattleState>(createInitialBattleState);
    const [editingGambitId, setEditingGambitId] = useState<string | null>(null);

    const handleTick = useCallback((newState: BattleState) => {
        setBattleState(newState);
    }, []);

    useGameLoop({ battleState, onTick: handleTick });

    const handleFight = () => {
        setBattleState(prev => ({
            ...prev,
            log: [...prev.log, '⚔️ FIGHT!'],
            status: 'FIGHTING'
        }));
    };

    const handleReset = () => {
        setBattleState(createInitialBattleState());
    };

    const handleGambitUpdate = (gambitId: string, updates: Partial<Gambit>) => {
        setBattleState(prev => ({
            ...prev,
            allies: prev.allies.map(unit => ({
                ...unit,
                gambits: unit.gambits.map(g =>
                    g.id === gambitId ? { ...g, ...updates } : g
                )
            }))
        }));
    };

    const playerUnit = battleState.allies[0];
    const canFight = battleState.status === 'PREPARATION';
    const isBattleOver = battleState.status === 'VICTORY' || battleState.status === 'DEFEAT';
    const isFighting = battleState.status === 'FIGHTING';

    const editingGambit = playerUnit?.gambits.find(g => g.id === editingGambitId);

    return (
        <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
            {/* Arena Section - Top 40% */}
            <div className="h-[40%] flex-shrink-0">
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
                        Fight!
                    </button>
                )}

                {isBattleOver && (
                    <button
                        onClick={handleReset}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg",
                            battleState.status === 'VICTORY'
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                                : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500",
                            "text-white font-bold uppercase tracking-wider",
                            "shadow-lg",
                            "transition-all duration-200 hover:scale-105"
                        )}
                    >
                        <RotateCcw size={18} />
                        {battleState.status === 'VICTORY' ? 'Play Again!' : 'Try Again'}
                    </button>
                )}

                {isFighting && (
                    <div className="flex items-center gap-2 text-amber-400">
                        <Cat size={20} className="animate-bounce" />
                        <span className="text-sm font-medium">Round {battleState.tick}...</span>
                    </div>
                )}
            </div>

            {/* Gambit Section - Bottom 60% */}
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
                        {playerUnit?.name}'s AI Programming
                    </span>
                    {canFight && (
                        <span className="ml-auto text-xs text-violet-400">
                            Tap to edit ✏️
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
                    "h-32 flex-shrink-0 overflow-y-auto",
                    "bg-black/40 border-t border-gray-800/50",
                    "px-4 py-2"
                )}>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Combat Log
                    </div>
                    <div className="space-y-1">
                        {battleState.log.slice(-10).map((entry, i) => (
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
