// Engine Types - Pure TypeScript, NO React imports
// Phase 5: Advanced Tactics with Dodge & Charge

export type TargetType =
    | 'SELF'
    | 'ALLY_LOWEST_HP'
    | 'ENEMY_CLOSEST'
    | 'ENEMY_LOWEST_HP'
    | 'ENEMY_STRONGEST';

export type ConditionType =
    | 'ALWAYS'
    | 'HP_BELOW_30'
    | 'HP_BELOW_50'
    | 'ENEMY_HP_ABOVE_50'
    | 'ENEMY_IS_BLOCKING'
    | 'MANA_FULL';

export type ActionType =
    | 'ATTACK'
    | 'HEAL'
    | 'BLOCK'
    | 'WAIT'
    | 'DODGE'   // Avoid next hit
    | 'CHARGE'; // 3x damage next turn

// Arrays for cycling in UI
export const CONDITIONS: ConditionType[] = [
    'ALWAYS',
    'HP_BELOW_30',
    'HP_BELOW_50',
    'ENEMY_HP_ABOVE_50',
    'ENEMY_IS_BLOCKING',
    'MANA_FULL'
];

export const TARGETS: TargetType[] = [
    'ENEMY_CLOSEST',
    'ENEMY_LOWEST_HP',
    'ENEMY_STRONGEST',
    'SELF',
    'ALLY_LOWEST_HP'
];

export const ACTIONS: ActionType[] = [
    'ATTACK',
    'HEAL',
    'BLOCK',
    'DODGE',
    'CHARGE',
    'WAIT'
];

export interface Gambit {
    id: string;
    active: boolean;
    priority: number;
    condition: ConditionType;
    target: TargetType;
    action: ActionType;
}

export interface StatusEffects {
    isBlocking: boolean;
    isDodging: boolean;
    isCharged: boolean;
}

export interface Unit {
    id: string;
    name: string;
    emoji: string;
    stats: {
        hp: number;
        maxHp: number;
        atk: number;
        def: number;
        speed: number;
    };
    gambits: Gambit[];
    isDead: boolean;
    statusEffects: StatusEffects;
    lastTriggeredGambitId: string | null;
}

export interface Persona {
    id: string;
    name: string;
    emoji: string;
    description: string;
    baseStats: Unit['stats'];
    initialGambits: Gambit[];
}

export interface DungeonState {
    room: number;
    maxRooms: number;
}

export interface BattleState {
    tick: number;
    allies: Unit[];
    enemies: Unit[];
    log: string[];
    status: 'PREPARATION' | 'FIGHTING' | 'VICTORY' | 'DEFEAT' | 'ROOM_CLEARED';
    dungeon: DungeonState;
}
