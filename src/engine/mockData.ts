// Mock Data - Helper functions to create test units
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
 * Creates the default player unit with 3 gambit slots
 */
export function createPlayerUnit(): Unit {
    return {
        id: generateUnitId(),
        name: 'Hero',
        emoji: '⚔️',
        stats: {
            hp: 100,
            maxHp: 100,
            atk: 15,
            def: 5,
            speed: 10
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
            },
            createEmptyGambit(3)
        ],
        isDead: false
    };
}

/**
 * Creates a test enemy (Rat)
 */
export function createTestEnemy(): Unit {
    return {
        id: generateUnitId(),
        name: 'Rat',
        emoji: '🐀',
        stats: {
            hp: 30,
            maxHp: 30,
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
                target: 'ENEMY_CLOSEST',
                action: 'ATTACK'
            }
        ],
        isDead: false
    };
}

/**
 * Creates an initial battle state for testing
 */
export function createInitialBattleState(): BattleState {
    return {
        tick: 0,
        allies: [createPlayerUnit()],
        enemies: [createTestEnemy(), createTestEnemy()],
        log: ['Battle begins!'],
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
