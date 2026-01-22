// Battle Simulator - Pure TypeScript, NO React imports
// Deterministic game logic

import type { BattleState, Unit, Gambit, ActionType, TargetType } from './types';

/**
 * Evaluates if a gambit's condition is met for a given unit
 */
function evaluateCondition(gambit: Gambit, unit: Unit, _state: BattleState): boolean {
    if (!gambit.active) return false;

    switch (gambit.condition) {
        case 'ALWAYS':
            return true;
        case 'HP_BELOW_30':
            return (unit.stats.hp / unit.stats.maxHp) < 0.3;
        case 'ENEMY_IS_BLOCKING':
            // TODO: Implement blocking state tracking
            return false;
        case 'MANA_FULL':
            // TODO: Implement mana system
            return false;
        default:
            return false;
    }
}

/**
 * Resolves a target based on the target type
 */
function resolveTarget(
    targetType: TargetType,
    unit: Unit,
    state: BattleState
): Unit | null {
    const isAlly = state.allies.some(a => a.id === unit.id);
    const allies = isAlly ? state.allies : state.enemies;
    const enemies = isAlly ? state.enemies : state.allies;

    const livingAllies = allies.filter(u => !u.isDead);
    const livingEnemies = enemies.filter(u => !u.isDead);

    switch (targetType) {
        case 'SELF':
            return unit;
        case 'ALLY_LOWEST_HP':
            return livingAllies.reduce((lowest, current) =>
                current.stats.hp < lowest.stats.hp ? current : lowest
                , livingAllies[0]) ?? null;
        case 'ENEMY_CLOSEST':
            // For now, just return first living enemy
            return livingEnemies[0] ?? null;
        case 'ENEMY_LOWEST_HP':
            return livingEnemies.reduce((lowest, current) =>
                current.stats.hp < lowest.stats.hp ? current : lowest
                , livingEnemies[0]) ?? null;
        default:
            return null;
    }
}

/**
 * Executes an action from a unit to a target
 */
function executeAction(
    action: ActionType,
    attacker: Unit,
    target: Unit,
    log: string[]
): void {
    switch (action) {
        case 'ATTACK': {
            const damage = Math.max(1, attacker.stats.atk - target.stats.def);
            target.stats.hp = Math.max(0, target.stats.hp - damage);
            log.push(`${attacker.emoji} ${attacker.name} attacks ${target.emoji} ${target.name} for ${damage} damage!`);

            if (target.stats.hp <= 0) {
                target.isDead = true;
                log.push(`${target.emoji} ${target.name} has been defeated!`);
            }
            break;
        }
        case 'HEAL': {
            const healAmount = Math.floor(attacker.stats.atk * 0.5);
            target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healAmount);
            log.push(`${attacker.emoji} ${attacker.name} heals ${target.emoji} ${target.name} for ${healAmount} HP!`);
            break;
        }
        case 'BLOCK':
            log.push(`${attacker.emoji} ${attacker.name} takes a defensive stance!`);
            // TODO: Implement blocking state
            break;
        case 'WAIT':
            log.push(`${attacker.emoji} ${attacker.name} is waiting...`);
            break;
    }
}

/**
 * Process a single unit's turn
 */
function processUnitTurn(unit: Unit, state: BattleState, log: string[]): void {
    if (unit.isDead) return;

    // Sort gambits by priority (lower = higher priority)
    const sortedGambits = [...unit.gambits].sort((a, b) => a.priority - b.priority);

    for (const gambit of sortedGambits) {
        if (evaluateCondition(gambit, unit, state)) {
            const target = resolveTarget(gambit.target, unit, state);
            if (target) {
                executeAction(gambit.action, unit, target, log);
                return; // Only execute one action per turn
            }
        }
    }

    // Default action if no gambit matched
    log.push(`${unit.emoji} ${unit.name} does nothing...`);
}

/**
 * Check if battle should end
 */
function checkBattleEnd(state: BattleState): 'VICTORY' | 'DEFEAT' | 'FIGHTING' {
    const alliesAlive = state.allies.some(u => !u.isDead);
    const enemiesAlive = state.enemies.some(u => !u.isDead);

    if (!enemiesAlive) return 'VICTORY';
    if (!alliesAlive) return 'DEFEAT';
    return 'FIGHTING';
}

/**
 * Simulates one tick of combat
 * This function is PURE - it returns a new state without mutating the input
 */
export function simulateTick(state: BattleState): BattleState {
    if (state.status !== 'FIGHTING') {
        return state;
    }

    // Deep clone the state to ensure immutability
    const newState: BattleState = {
        tick: state.tick + 1,
        allies: state.allies.map(u => ({
            ...u,
            stats: { ...u.stats },
            gambits: u.gambits.map(g => ({ ...g }))
        })),
        enemies: state.enemies.map(u => ({
            ...u,
            stats: { ...u.stats },
            gambits: u.gambits.map(g => ({ ...g }))
        })),
        log: [...state.log],
        status: 'FIGHTING'
    };

    newState.log.push(`--- Tick ${newState.tick} ---`);

    // Combine all units and sort by speed (higher = faster)
    const allUnits = [...newState.allies, ...newState.enemies]
        .filter(u => !u.isDead)
        .sort((a, b) => b.stats.speed - a.stats.speed);

    // Process each unit's turn
    for (const unit of allUnits) {
        processUnitTurn(unit, newState, newState.log);

        // Check for battle end after each action
        const battleResult = checkBattleEnd(newState);
        if (battleResult !== 'FIGHTING') {
            newState.status = battleResult;
            newState.log.push(`=== ${battleResult}! ===`);
            break;
        }
    }

    return newState;
}
