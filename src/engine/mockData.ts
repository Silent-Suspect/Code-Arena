// Mock Data - Dungeon System with Character Selection
// Pure TypeScript, NO React imports

import type { Unit, Gambit, BattleState, Persona } from './types';

let unitIdCounter = 0;
let gambitIdCounter = 0;

function generateUnitId(): string {
    return `unit_${++unitIdCounter}`;
}

function generateGambitId(): string {
    return `gambit_${++gambitIdCounter}`;
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
    description: 'Schnell & Tödlich',
    baseStats: {
        hp: 50,
        maxHp: 50,
        atk: 14,
        def: 2,
        speed: 18 // Very fast!
    },
    initialGambits: [
        {
            id: 'felix_g1',
            active: true,
            priority: 1,
            condition: 'HP_BELOW_30',
            target: 'SELF',
            action: 'HEAL'
        },
        {
            id: 'felix_g2',
            active: true,
            priority: 2,
            condition: 'ALWAYS',
            target: 'ENEMY_LOWEST_HP',
            action: 'ATTACK'
        },
        {
            id: 'felix_g3',
            active: false,
            priority: 3,
            condition: 'ALWAYS',
            target: 'ENEMY_CLOSEST',
            action: 'WAIT'
        }
    ]
};

export const PERSONA_MORITZ: Persona = {
    id: 'moritz',
    name: 'Moritz',
    emoji: '🛡️',
    description: 'Der Fels in der Brandung',
    baseStats: {
        hp: 100,
        maxHp: 100,
        atk: 10,
        def: 6,
        speed: 8 // Slow but sturdy
    },
    initialGambits: [
        {
            id: 'moritz_g1',
            active: true,
            priority: 1,
            condition: 'HP_BELOW_30',
            target: 'SELF',
            action: 'BLOCK'
        },
        {
            id: 'moritz_g2',
            active: true,
            priority: 2,
            condition: 'ALWAYS',
            target: 'ENEMY_CLOSEST',
            action: 'ATTACK'
        },
        {
            id: 'moritz_g3',
            active: false,
            priority: 3,
            condition: 'ALWAYS',
            target: 'SELF',
            action: 'WAIT'
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
            atk: 5,
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
        isBlocking: false,
        lastTriggeredGambitId: null
    };
}

function createGurke(): Unit {
    return {
        id: generateUnitId(),
        name: 'Die Gurke',
        emoji: '🥒',
        stats: {
            hp: 35,
            maxHp: 35,
            atk: 8,
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
        isBlocking: false,
        lastTriggeredGambitId: null
    };
}

function createPostbote(): Unit {
    return {
        id: generateUnitId(),
        name: 'Der Postbote',
        emoji: '📬',
        stats: {
            hp: 30,
            maxHp: 30,
            atk: 10,
            def: 2,
            speed: 14 // Fast!
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
        isBlocking: false,
        lastTriggeredGambitId: null
    };
}

function createSpruehflasche(): Unit {
    return {
        id: generateUnitId(),
        name: 'Sprühflasche',
        emoji: '💦',
        stats: {
            hp: 45,
            maxHp: 45,
            atk: 12,
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
        isBlocking: false,
        lastTriggeredGambitId: null
    };
}

function createStaubsauger(): Unit {
    return {
        id: generateUnitId(),
        name: 'STAUBSAUGER',
        emoji: '🤖',
        stats: {
            hp: 80,
            maxHp: 80,
            atk: 15,
            def: 5,
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
                condition: 'ALWAYS',
                target: 'ENEMY_LOWEST_HP',
                action: 'ATTACK'
            }
        ],
        isDead: false,
        isBlocking: false,
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
            id: generateGambitId() // Generate fresh IDs
        })),
        isDead: false,
        isBlocking: false,
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
 * Resets the ID counters (useful for testing)
 */
export function resetIdCounters(): void {
    unitIdCounter = 0;
    gambitIdCounter = 0;
}
