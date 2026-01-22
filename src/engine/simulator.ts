// Battle Simulator - Pure TypeScript, NO React imports
// Deterministic game logic for Cat-Command

import type { BattleState, Unit, Gambit, ActionType, TargetType } from './types';

/**
 * Evaluates if a gambit's condition is met for a given unit
 */
function evaluateCondition(gambit: Gambit, unit: Unit, state: BattleState): boolean {
    if (!gambit.active) return false;

    // Get enemies for this unit
    const isAlly = state.allies.some(a => a.id === unit.id);
    const enemies = isAlly ? state.enemies : state.allies;
    const livingEnemies = enemies.filter(u => !u.isDead);

    switch (gambit.condition) {
        case 'ALWAYS':
            return true;
        case 'HP_BELOW_30':
            return (unit.stats.hp / unit.stats.maxHp) < 0.3;
        case 'ENEMY_IS_BLOCKING':
            return livingEnemies.some(e => e.isBlocking);
        case 'MANA_FULL':
            // No mana system yet, treat as always true for now
            return true;
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
            if (livingAllies.length === 0) return null;
            return livingAllies.reduce((lowest, current) =>
                current.stats.hp < lowest.stats.hp ? current : lowest
            );
        case 'ENEMY_CLOSEST':
            return livingEnemies[0] ?? null;
        case 'ENEMY_LOWEST_HP':
            if (livingEnemies.length === 0) return null;
            return livingEnemies.reduce((lowest, current) =>
                current.stats.hp < lowest.stats.hp ? current : lowest
            );
        default:
            return null;
    }
}

/**
 * Cat-themed action verbs for flavor
 */
const attackVerbs = ['scratches', 'pounces on', 'bites', 'swipes at', 'hisses and claws'];
const healVerbs = ['grooms', 'purrs to heal', 'takes a power nap on'];

function getRandomVerb(verbs: string[]): string {
    return verbs[Math.floor(Math.random() * verbs.length)];
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
            // If target is blocking, reduce damage by 50%
            const baseDamage = attacker.stats.atk - target.stats.def;
            const damageMultiplier = target.isBlocking ? 0.5 : 1;
            const damage = Math.max(1, Math.floor(baseDamage * damageMultiplier));

            target.stats.hp = Math.max(0, target.stats.hp - damage);

            const verb = getRandomVerb(attackVerbs);
            const blockedText = target.isBlocking ? ' (BLOCKED!)' : '';
            log.push(`${attacker.emoji} ${attacker.name} ${verb} ${target.emoji} ${target.name} for ${damage} DMG${blockedText}`);

            if (target.stats.hp <= 0) {
                target.isDead = true;
                log.push(`💥 ${target.emoji} ${target.name} has been defeated!`);
            }
            break;
        }
        case 'HEAL': {
            const healAmount = 8; // Fixed heal amount
            const actualHeal = Math.min(healAmount, target.stats.maxHp - target.stats.hp);
            target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healAmount);

            if (actualHeal > 0) {
                const verb = getRandomVerb(healVerbs);
                log.push(`${attacker.emoji} ${attacker.name} ${verb} ${target.emoji} ${target.name} for +${actualHeal} HP`);
            } else {
                log.push(`${attacker.emoji} ${attacker.name} is already at full health!`);
            }
            break;
        }
        case 'BLOCK':
            attacker.isBlocking = true;
            log.push(`🛡️ ${attacker.emoji} ${attacker.name} curls up defensively!`);
            break;
        case 'WAIT':
            log.push(`💤 ${attacker.emoji} ${attacker.name} watches and waits...`);
            break;
    }
}

/**
 * Process a single unit's turn
 * Returns the ID of the triggered gambit (for UI feedback)
 */
function processUnitTurn(unit: Unit, state: BattleState, log: string[]): string | null {
    if (unit.isDead) return null;

    // Reset blocking at start of turn (blocking only lasts one round)
    unit.isBlocking = false;
    unit.lastTriggeredGambitId = null;

    // Sort gambits by priority (lower = higher priority)
    const sortedGambits = [...unit.gambits].sort((a, b) => a.priority - b.priority);

    for (const gambit of sortedGambits) {
        if (evaluateCondition(gambit, unit, state)) {
            const target = resolveTarget(gambit.target, unit, state);
            if (target) {
                executeAction(gambit.action, unit, target, log);
                unit.lastTriggeredGambitId = gambit.id;
                return gambit.id;
            }
        }
    }

    // Default action if no gambit matched
    log.push(`❓ ${unit.emoji} ${unit.name} is confused...`);
    return null;
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

    newState.log.push(`──── Round ${newState.tick} ────`);

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
            if (battleResult === 'VICTORY') {
                newState.log.push(`🎉 VICTORY! The house is safe!`);
            } else {
                newState.log.push(`😿 DEFEAT! The appliances win...`);
            }
            break;
        }
    }

    return newState;
}
