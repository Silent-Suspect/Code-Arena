// Mock Data - Cat-Command Theme
// Pure TypeScript, NO React imports

import type { Unit, Gambit, BattleState } from './types';

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

/**
 * Creates Commander Mitzie - the player's cat
 * High Speed, Low Def - a nimble attacker
 */
export function createPlayerUnit(): Unit {
    return {
        id: generateUnitId(),
        name: 'Commander Mitzie',
        emoji: '😼',
        stats: {
            hp: 80,
            maxHp: 80,
            atk: 12,
            def: 3,
            speed: 15 // Fast cat!
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
                target: 'ENEMY_CLOSEST',
                action: 'ATTACK'
            },
            createEmptyGambit(3)
        ],
        isDead: false,
        isBlocking: false,
        lastTriggeredGambitId: null
    };
}

/**
 * Creates The Vacuum - a fearsome household enemy
 * High HP, Low Speed - a tanky threat
 */
export function createTestEnemy(): Unit {
    return {
        id: generateUnitId(),
        name: 'The Vacuum',
        emoji: '🤖',
        stats: {
            hp: 60,
            maxHp: 60,
            atk: 10,
            def: 5,
            speed: 5 // Slow but dangerous
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

/**
 * Creates The Toaster - a quick but fragile enemy
 */
export function createToasterEnemy(): Unit {
    return {
        id: generateUnitId(),
        name: 'The Toaster',
        emoji: '🍞',
        stats: {
            hp: 35,
            maxHp: 35,
            atk: 8,
            def: 2,
            speed: 12
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

/**
 * Creates an initial battle state for Cat-Command
 */
export function createInitialBattleState(): BattleState {
    return {
        tick: 0,
        allies: [createPlayerUnit()],
        enemies: [createTestEnemy(), createToasterEnemy()],
        log: ['🐱 Commander Mitzie enters the arena!', '🤖 The appliances power on...'],
        status: 'PREPARATION'
    };
}

/**
 * Resets the ID counters (useful for testing)
 */
export function resetIdCounters(): void {
    unitIdCounter = 0;
    gambitIdCounter = 0;
}
