// Engine Types - Pure TypeScript, NO React imports
// This is the single source of truth for game data structures

export type TargetType = 'SELF' | 'ALLY_LOWEST_HP' | 'ENEMY_CLOSEST' | 'ENEMY_LOWEST_HP';
export type ConditionType = 'ALWAYS' | 'HP_BELOW_30' | 'ENEMY_IS_BLOCKING' | 'MANA_FULL';
export type ActionType = 'ATTACK' | 'HEAL' | 'BLOCK' | 'WAIT';

export interface Gambit {
    id: string;
    active: boolean;
    priority: number; // Lower number = higher priority
    condition: ConditionType;
    target: TargetType;
    action: ActionType;
}

export interface Unit {
    id: string;
    name: string;
    emoji: string; // Visual representation
    stats: {
        hp: number;
        maxHp: number;
        atk: number;
        def: number;
        speed: number;
    };
    gambits: Gambit[];
    isDead: boolean;
}

export interface BattleState {
    tick: number; // Time counter
    allies: Unit[];
    enemies: Unit[];
    log: string[]; // Combat log for the UI
    status: 'PREPARATION' | 'FIGHTING' | 'VICTORY' | 'DEFEAT';
}
