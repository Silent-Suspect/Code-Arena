// Battle Simulator - Pure TypeScript, NO React imports
// Deterministic game logic for Cat-Command Dungeon

import type { BattleState, Unit, Gambit, ActionType, TargetType } from './types';
import { getEnemiesForRoom, getRoomDescription } from './mockData';

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
            return true; // No mana system yet
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
const attackVerbs = ['kratzt', 'springt auf', 'beißt', 'schlägt', 'faucht und krallt'];
const healVerbs = ['leckt sich', 'macht ein Nickerchen', 'schnurrt heilend'];

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
            const baseDamage = attacker.stats.atk - target.stats.def;
            const damageMultiplier = target.isBlocking ? 0.5 : 1;
            const damage = Math.max(1, Math.floor(baseDamage * damageMultiplier));

            target.stats.hp = Math.max(0, target.stats.hp - damage);

            const verb = getRandomVerb(attackVerbs);
            const blockedText = target.isBlocking ? ' (GEBLOCKT!)' : '';
            log.push(`${attacker.emoji} ${attacker.name} ${verb} ${target.emoji} ${target.name} für ${damage} DMG${blockedText}`);

            if (target.stats.hp <= 0) {
                target.isDead = true;
                log.push(`💥 ${target.emoji} ${target.name} wurde besiegt!`);
            }
            break;
        }
        case 'HEAL': {
            const healAmount = 8;
            const actualHeal = Math.min(healAmount, target.stats.maxHp - target.stats.hp);
            target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healAmount);

            if (actualHeal > 0) {
                const verb = getRandomVerb(healVerbs);
                log.push(`${attacker.emoji} ${attacker.name} ${verb} +${actualHeal} HP`);
            } else {
                log.push(`${attacker.emoji} ${attacker.name} hat schon volle HP!`);
            }
            break;
        }
        case 'BLOCK':
            attacker.isBlocking = true;
            log.push(`🛡️ ${attacker.emoji} ${attacker.name} geht in Deckung!`);
            break;
        case 'WAIT':
            log.push(`💤 ${attacker.emoji} ${attacker.name} wartet ab...`);
            break;
    }
}

/**
 * Process a single unit's turn
 */
function processUnitTurn(unit: Unit, state: BattleState, log: string[]): string | null {
    if (unit.isDead) return null;

    unit.isBlocking = false;
    unit.lastTriggeredGambitId = null;

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

    log.push(`❓ ${unit.emoji} ${unit.name} ist verwirrt...`);
    return null;
}

/**
 * Check if battle should end
 */
function checkBattleEnd(state: BattleState): 'VICTORY' | 'DEFEAT' | 'ROOM_CLEARED' | 'FIGHTING' {
    const alliesAlive = state.allies.some(u => !u.isDead);
    const enemiesAlive = state.enemies.some(u => !u.isDead);

    if (!enemiesAlive) {
        // Check if this was the last room
        if (state.dungeon.room >= state.dungeon.maxRooms) {
            return 'VICTORY';
        }
        return 'ROOM_CLEARED';
    }
    if (!alliesAlive) return 'DEFEAT';
    return 'FIGHTING';
}

/**
 * Simulates one tick of combat
 */
export function simulateTick(state: BattleState): BattleState {
    if (state.status !== 'FIGHTING') {
        return state;
    }

    // Deep clone the state
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
        status: 'FIGHTING',
        dungeon: { ...state.dungeon }
    };

    newState.log.push(`──── Runde ${newState.tick} ────`);

    const allUnits = [...newState.allies, ...newState.enemies]
        .filter(u => !u.isDead)
        .sort((a, b) => b.stats.speed - a.stats.speed);

    for (const unit of allUnits) {
        processUnitTurn(unit, newState, newState.log);

        const battleResult = checkBattleEnd(newState);
        if (battleResult !== 'FIGHTING') {
            newState.status = battleResult;

            if (battleResult === 'VICTORY') {
                newState.log.push(`🎉 SIEG! Der Dungeon wurde bezwungen!`);
            } else if (battleResult === 'ROOM_CLEARED') {
                newState.log.push(`✨ Raum ${newState.dungeon.room} geschafft!`);
            } else {
                newState.log.push(`😿 NIEDERLAGE! Versuch es nochmal...`);
            }
            break;
        }
    }

    return newState;
}

/**
 * Advance to the next room in the dungeon
 * - Heals the player for 30% of max HP
 * - Spawns new enemies for the next room
 */
export function nextRoom(state: BattleState): BattleState {
    if (state.status !== 'ROOM_CLEARED') {
        return state;
    }

    const newRoom = state.dungeon.room + 1;

    // Deep clone allies and heal them
    const healedAllies = state.allies.map(u => {
        const healAmount = Math.floor(u.stats.maxHp * 0.3);
        const newHp = Math.min(u.stats.maxHp, u.stats.hp + healAmount);
        const actualHeal = newHp - u.stats.hp;

        return {
            ...u,
            stats: { ...u.stats, hp: newHp },
            gambits: u.gambits.map(g => ({ ...g })),
            isBlocking: false,
            lastTriggeredGambitId: null
        };
    });

    const newEnemies = getEnemiesForRoom(newRoom);
    const isBoss = newRoom === state.dungeon.maxRooms;

    return {
        tick: 0,
        allies: healedAllies,
        enemies: newEnemies,
        log: [
            `💚 +30% HP geheilt!`,
            `📍 Raum ${newRoom}/${state.dungeon.maxRooms}: ${getRoomDescription(newRoom)}`,
            isBoss ? `⚠️ BOSS KAMPF!` : `🐾 Neue Gegner erscheinen...`
        ],
        status: 'PREPARATION',
        dungeon: {
            room: newRoom,
            maxRooms: state.dungeon.maxRooms
        }
    };
}
