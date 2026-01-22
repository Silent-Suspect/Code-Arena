// Mock Data - Dungeon System with Character Selection
// Phase 5: Advanced Tactics with Dodge & Charge
// Pure TypeScript, NO React imports

import type { Unit, Gambit, BattleState, Persona, StatusEffects } from './types';

let unitIdCounter = 0;
let gambitIdCounter = 0;

function generateUnitId(): string {
    return `unit_${++unitIdCounter}`;
}

function generateGambitId(): string {
    return `gambit_${++gambitIdCounter}`;
}

function createDefaultStatusEffects(): StatusEffects {
    return {
        isBlocking: false,
        isDodging: false,
        isCharged: false
    };
}

/**
 * Creates an empty gambit slot
 */
export function createEmptyGambit(priority: number): Gambit {
    return {
        id: generateGambitId(),
        active: false,
        priority,
        condition: 'ALWAYS',
        target: 'ENEMY_CLOSEST',
        action: 'WAIT'
    };
}

// ==========================================
// PERSONAS - Character Selection
// ==========================================

export const PERSONA_FELIX: Persona = {
    id: 'felix',
    name: 'Felix',
    emoji: '⚡',
    description: 'Der Ninja - Schnell & Ausweichend',
    baseStats: {
        hp: 60,
        maxHp: 60,
        atk: 16,
        def: 2,
        speed: 20 // Very fast!
    },
    initialGambits: [
        {
            id: 'felix_g1',
            active: true,
            priority: 1,
            condition: 'HP_BELOW_50',
            target: 'SELF',
            action: 'HEAL'
        },
        {
            id: 'felix_g2',
            active: true,
            priority: 2,
            condition: 'ENEMY_HP_ABOVE_50',
            target: 'SELF',
            action: 'DODGE' // Play safe early game
        },
        {
            id: 'felix_g3',
            active: true,
            priority: 3,
            condition: 'ALWAYS',
            target: 'ENEMY_CLOSEST',
            action: 'ATTACK'
        }
    ]
};

export const PERSONA_MORITZ: Persona = {
    id: 'moritz',
    name: 'Moritz',
    emoji: '🛡️',
    description: 'Der Berserker - Aufladen & Zerschmettern',
    baseStats: {
        hp: 120,
        maxHp: 120,
        atk: 12,
        def: 5,
        speed: 8 // Slow but powerful
    },
    initialGambits: [
        {
            id: 'moritz_g1',
            active: true,
            priority: 1,
            condition: 'HP_BELOW_30',
            target: 'SELF',
            action: 'HEAL'
        },
        {
            id: 'moritz_g2',
            active: true,
            priority: 2,
            condition: 'ENEMY_HP_ABOVE_50',
            target: 'SELF',
            action: 'CHARGE' // Power up for big enemies
        },
        {
            id: 'moritz_g3',
            active: true,
            priority: 3,
            condition: 'ALWAYS',
            target: 'ENEMY_STRONGEST',
            action: 'ATTACK'
        }
    ]
};

export const ALL_PERSONAS: Persona[] = [PERSONA_FELIX, PERSONA_MORITZ];

// ==========================================
// ENEMY POOL - Room-based enemies
// ==========================================

function createStaubfluse(): Unit {
    return {
        id: generateUnitId(),
        name: 'Staubfluse',
        emoji: '🌫️',
        stats: {
            hp: 20,
            maxHp: 20,
            atk: 6,
            def: 0,
            speed: 6
        },
        gambits: [
            {
                id: generateGambitId(),
                active: true,
                priority: 1,
                condition: 'ALWAYS',
                target: 'ENEMY_CLOSEST',
                action: 'ATTACK'
            }
        ],
        isDead: false,
        statusEffects: createDefaultStatusEffects(),
        lastTriggeredGambitId: null
    };
}

function createGurke(): Unit {
    return {
        id: generateUnitId(),
        name: 'Die Gurke',
        emoji: '🥒',
        stats: {
            hp: 40,
            maxHp: 40,
            atk: 10,
            def: 3,
            speed: 7
        },
        gambits: [
            {
                id: generateGambitId(),
                active: true,
                priority: 1,
                condition: 'ALWAYS',
                target: 'ENEMY_LOWEST_HP',
                action: 'ATTACK'
            }
        ],
        isDead: false,
        statusEffects: createDefaultStatusEffects(),
        lastTriggeredGambitId: null
    };
}

function createPostbote(): Unit {
    return {
        id: generateUnitId(),
        name: 'Der Postbote',
        emoji: '📬',
        stats: {
            hp: 35,
            maxHp: 35,
            atk: 12,
            def: 2,
            speed: 16 // Fast!
        },
        gambits: [
            {
                id: generateGambitId(),
                active: true,
                priority: 1,
                condition: 'ALWAYS',
                target: 'ENEMY_CLOSEST',
                action: 'ATTACK'
            }
        ],
        isDead: false,
        statusEffects: createDefaultStatusEffects(),
        lastTriggeredGambitId: null
    };
}

function createSpruehflasche(): Unit {
    return {
        id: generateUnitId(),
        name: 'Sprühflasche',
        emoji: '💦',
        stats: {
            hp: 50,
            maxHp: 50,
            atk: 14,
            def: 4,
            speed: 10
        },
        gambits: [
            {
                id: generateGambitId(),
                active: true,
                priority: 1,
                condition: 'HP_BELOW_30',
                target: 'SELF',
                action: 'BLOCK'
            },
            {
                id: generateGambitId(),
                active: true,
                priority: 2,
                condition: 'ALWAYS',
                target: 'ENEMY_CLOSEST',
                action: 'ATTACK'
            }
        ],
        isDead: false,
        statusEffects: createDefaultStatusEffects(),
        lastTriggeredGambitId: null
    };
}

function createStaubsauger(): Unit {
    return {
        id: generateUnitId(),
        name: 'STAUBSAUGER',
        emoji: '🤖',
        stats: {
            hp: 100,
            maxHp: 100,
            atk: 18,
            def: 6,
            speed: 6
        },
        gambits: [
            {
                id: generateGambitId(),
                active: true,
                priority: 1,
                condition: 'HP_BELOW_30',
                target: 'SELF',
                action: 'HEAL'
            },
            {
                id: generateGambitId(),
                active: true,
                priority: 2,
                condition: 'ENEMY_HP_ABOVE_50',
                target: 'SELF',
                action: 'CHARGE' // Boss charges too!
            },
            {
                id: generateGambitId(),
                active: true,
                priority: 3,
                condition: 'ALWAYS',
                target: 'ENEMY_LOWEST_HP',
                action: 'ATTACK'
            }
        ],
        isDead: false,
        statusEffects: createDefaultStatusEffects(),
        lastTriggeredGambitId: null
    };
}

/**
 * Get enemies for a specific room
 */
export function getEnemiesForRoom(room: number): Unit[] {
    switch (room) {
        case 1:
            return [createStaubfluse(), createStaubfluse()];
        case 2:
            return [createGurke()];
        case 3:
            return [createPostbote(), createStaubfluse()];
        case 4:
            return [createSpruehflasche()];
        case 5:
            return [createStaubsauger()]; // BOSS!
        default:
            return [createStaubfluse()];
    }
}

/**
 * Get room description for UI
 */
export function getRoomDescription(room: number): string {
    switch (room) {
        case 1: return 'Der Flur';
        case 2: return 'Die Küche';
        case 3: return 'Der Eingang';
        case 4: return 'Das Bad';
        case 5: return 'Das Wohnzimmer (BOSS!)';
        default: return 'Unbekannt';
    }
}

// ==========================================
// GAME STATE CREATION
// ==========================================

/**
 * Create a player unit from a persona
 */
export function createUnitFromPersona(persona: Persona): Unit {
    return {
        id: generateUnitId(),
        name: persona.name,
        emoji: persona.emoji,
        stats: { ...persona.baseStats },
        gambits: persona.initialGambits.map(g => ({
            ...g,
            id: generateGambitId()
        })),
        isDead: false,
        statusEffects: createDefaultStatusEffects(),
        lastTriggeredGambitId: null
    };
}

/**
 * Creates initial battle state for a dungeon run
 */
export function createInitialBattleState(persona: Persona): BattleState {
    const room = 1;
    return {
        tick: 0,
        allies: [createUnitFromPersona(persona)],
        enemies: getEnemiesForRoom(room),
        log: [
            `🐱 ${persona.name} betritt den Dungeon!`,
            `📍 Raum ${room}: ${getRoomDescription(room)}`
        ],
        status: 'PREPARATION',
        dungeon: {
            room,
            maxRooms: 5
        }
    };
}

/**
 * Resets the ID counters
 */
export function resetIdCounters(): void {
    unitIdCounter = 0;
    gambitIdCounter = 0;
}
