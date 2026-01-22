// Gambit Editor Dialog Component
// Phase 5: With DODGE and CHARGE actions
import { useRef, useEffect } from 'react';
import type { Gambit, ConditionType, TargetType, ActionType } from '../../engine/types';
import { CONDITIONS, TARGETS, ACTIONS } from '../../engine/types';
import { cn } from '../ui/cn';
import { X, Zap, Shield, Target, Clock, Wind, Battery } from 'lucide-react';

interface GambitEditorDialogProps {
    gambit: Gambit;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updates: Partial<Gambit>) => void;
}

const conditionLabels: Record<ConditionType, string> = {
    'ALWAYS': 'Immer',
    'HP_BELOW_30': 'HP < 30%',
    'HP_BELOW_50': 'HP < 50%',
    'ENEMY_HP_ABOVE_50': 'Gegner HP > 50%',
    'ENEMY_IS_BLOCKING': 'Gegner blockt',
    'MANA_FULL': 'Mana voll'
};

const targetLabels: Record<TargetType, string> = {
    'SELF': 'Selbst',
    'ALLY_LOWEST_HP': 'Verbündeter (niedrige HP)',
    'ENEMY_CLOSEST': 'Nächster Gegner',
    'ENEMY_LOWEST_HP': 'Gegner (niedrige HP)',
    'ENEMY_STRONGEST': 'Stärkster Gegner'
};

const actionLabels: Record<ActionType, string> = {
    'ATTACK': 'Angriff',
    'HEAL': 'Heilen',
    'BLOCK': 'Blocken',
    'DODGE': 'Ausweichen',
    'CHARGE': 'Aufladen',
    'WAIT': 'Warten'
};

const actionColors: Record<ActionType, string> = {
    'ATTACK': 'bg-red-600 hover:bg-red-500',
    'HEAL': 'bg-emerald-600 hover:bg-emerald-500',
    'BLOCK': 'bg-blue-600 hover:bg-blue-500',
    'DODGE': 'bg-cyan-600 hover:bg-cyan-500',
    'CHARGE': 'bg-amber-600 hover:bg-amber-500',
    'WAIT': 'bg-gray-600 hover:bg-gray-500'
};

const actionIcons: Record<ActionType, typeof Zap> = {
    'ATTACK': Zap,
    'HEAL': Shield,
    'BLOCK': Target,
    'DODGE': Wind,
    'CHARGE': Battery,
    'WAIT': Clock
};

export function GambitEditorDialog({ gambit, isOpen, onClose, onUpdate }: GambitEditorDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const cycleCondition = () => {
        const currentIndex = CONDITIONS.indexOf(gambit.condition);
        const nextIndex = (currentIndex + 1) % CONDITIONS.length;
        onUpdate({ condition: CONDITIONS[nextIndex] });
    };

    const cycleTarget = () => {
        const currentIndex = TARGETS.indexOf(gambit.target);
        const nextIndex = (currentIndex + 1) % TARGETS.length;
        onUpdate({ target: TARGETS[nextIndex] });
    };

    const setAction = (action: ActionType) => {
        onUpdate({ action, active: true });
    };

    const toggleActive = () => {
        onUpdate({ active: !gambit.active });
    };

    return (
        <dialog
            ref={dialogRef}
            className={cn(
                "backdrop:bg-black/70",
                "bg-gray-900 border border-gray-700 rounded-xl",
                "p-0 w-[90vw] max-w-md",
                "shadow-2xl shadow-violet-900/30"
            )}
            onClose={onClose}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Gambit bearbeiten</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Active Toggle */}
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Aktiviert</span>
                    <button
                        onClick={toggleActive}
                        className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            gambit.active ? "bg-emerald-600" : "bg-gray-700"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                            gambit.active ? "translate-x-7" : "translate-x-1"
                        )} />
                    </button>
                </div>

                {/* Condition */}
                <div className="mb-3">
                    <label className="text-xs text-amber-400 font-medium mb-1 block">WENN...</label>
                    <button
                        onClick={cycleCondition}
                        className={cn(
                            "w-full px-4 py-3 rounded-lg text-left",
                            "bg-amber-600/20 border border-amber-600/40",
                            "hover:bg-amber-600/30 transition-colors",
                            "text-amber-100 font-medium"
                        )}
                    >
                        {conditionLabels[gambit.condition]}
                        <span className="float-right text-amber-400/60 text-xs">antippen</span>
                    </button>
                </div>

                {/* Target */}
                <div className="mb-3">
                    <label className="text-xs text-cyan-400 font-medium mb-1 block">ZIEL...</label>
                    <button
                        onClick={cycleTarget}
                        className={cn(
                            "w-full px-4 py-3 rounded-lg text-left",
                            "bg-cyan-600/20 border border-cyan-600/40",
                            "hover:bg-cyan-600/30 transition-colors",
                            "text-cyan-100 font-medium"
                        )}
                    >
                        {targetLabels[gambit.target]}
                        <span className="float-right text-cyan-400/60 text-xs">antippen</span>
                    </button>
                </div>

                {/* Action */}
                <div className="mb-4">
                    <label className="text-xs text-violet-400 font-medium mb-2 block">AKTION</label>
                    <div className="grid grid-cols-2 gap-2">
                        {ACTIONS.map(action => {
                            const Icon = actionIcons[action];
                            return (
                                <button
                                    key={action}
                                    onClick={() => setAction(action)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg",
                                        "font-medium transition-all text-sm",
                                        gambit.action === action
                                            ? cn(actionColors[action], "text-white ring-2 ring-white/30")
                                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                                    )}
                                >
                                    <Icon size={14} />
                                    {actionLabels[action]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Done Button */}
                <button
                    onClick={onClose}
                    className={cn(
                        "w-full py-3 rounded-lg",
                        "bg-gradient-to-r from-violet-600 to-indigo-600",
                        "hover:from-violet-500 hover:to-indigo-500",
                        "text-white font-bold",
                        "transition-all"
                    )}
                >
                    Fertig
                </button>
            </div>
        </dialog>
    );
}
