// Battle Simulator - Pure TypeScript, NO React imports
// Phase 5: Advanced Tactics with Dodge & Charge

import type { BattleState, Unit, Gambit, ActionType, TargetType } from './types';
import { getEnemiesForRoom, getRoomDescription } from './mockData';

// ==========================================
// CONSTANTS
// ==========================================

const HUNGER_START_ROUND = 20;
const BASE_HEAL_AMOUNT = 12;
const CHARGE_MULTIPLIER = 3;

// ==========================================
// RNG HELPERS
// ==========================================

function getVarianceMultiplier(): number {
    return 0.8 + Math.random() * 0.4;
}

function getHitQuality(multiplier: number): string {
    if (multiplier >= 1.1) return ' (KRIT!)';
    if (multiplier <= 0.9) return ' (Streifer)';
    return '';
}

// ==========================================
// CONDITION EVALUATION
// ==========================================

function evaluateCondition(gambit: Gambit, unit: Unit, state: BattleState): boolean {
    if (!gambit.active) return false;

    const isAlly = state.allies.some(a => a.id === unit.id);
    const enemies = isAlly ? state.enemies : state.allies;
    const livingEnemies = enemies.filter(u => !u.isDead);

    switch (gambit.condition) {
        case 'ALWAYS':
            return true;
        case 'HP_BELOW_30':
            return (unit.stats.hp / unit.stats.maxHp) < 0.3;
        case 'HP_BELOW_50':
            return (unit.stats.hp / unit.stats.maxHp) < 0.5;
        case 'ENEMY_HP_ABOVE_50':
            return livingEnemies.some(e => (e.stats.hp / e.stats.maxHp) > 0.5);
        case 'ENEMY_IS_BLOCKING':
            return livingEnemies.some(e => e.statusEffects.isBlocking);
        case 'MANA_FULL':
            return true;
        default:
            return false;
    }
}

// ==========================================
// TARGET RESOLUTION
// ==========================================

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
        case 'ENEMY_STRONGEST':
            if (livingEnemies.length === 0) return null;
            return livingEnemies.reduce((strongest, current) =>
                current.stats.atk > strongest.stats.atk ? current : strongest
            );
        default:
            return null;
    }
}

// ==========================================
// ACTION EXECUTION
// ==========================================

const attackVerbs = ['kratzt', 'springt auf', 'beißt', 'schlägt', 'faucht'];
const healVerbs = ['leckt sich', 'macht ein Nickerchen', 'schnurrt heilend'];

function getRandomVerb(verbs: string[]): string {
    return verbs[Math.floor(Math.random() * verbs.length)];
}

function executeAction(
    action: ActionType,
    attacker: Unit,
    target: Unit,
    log: string[]
): void {
    switch (action) {
        case 'ATTACK': {
            // Check if target is dodging
            if (target.statusEffects.isDodging) {
                log.push(`💨 ${attacker.emoji} ${attacker.name} greift an... aber ${target.emoji} ${target.name} weicht aus!`);
                return;
            }

            // Calculate damage with variance
            let multiplier = getVarianceMultiplier();
            let chargeBonus = '';

            // Check if attacker is charged (3x damage)
            if (attacker.statusEffects.isCharged) {
                multiplier *= CHARGE_MULTIPLIER;
                attacker.statusEffects.isCharged = false;
                chargeBonus = ' 💥AUFGELADEN!';
            }

            const rawDamage = Math.floor(attacker.stats.atk * multiplier);

            // Block reduces damage significantly
            let finalDamage: number;
            let blockText = '';
            if (target.statusEffects.isBlocking) {
                finalDamage = Math.max(1, rawDamage - target.stats.def * 2);
                blockText = ' [GEBLOCKT]';
            } else {
                finalDamage = Math.max(1, rawDamage - target.stats.def);
            }

            target.stats.hp = Math.max(0, target.stats.hp - finalDamage);

            const verb = getRandomVerb(attackVerbs);
            const quality = getHitQuality(multiplier / (attacker.statusEffects.isCharged ? 1 : CHARGE_MULTIPLIER));

            log.push(`${attacker.emoji} ${attacker.name} ${verb} ${target.emoji} ${target.name} für ${finalDamage} DMG${chargeBonus}${quality}${blockText}`);

            if (target.stats.hp <= 0) {
                target.isDead = true;
                log.push(`💥 ${target.emoji} ${target.name} wurde besiegt!`);
            }
            break;
        }

        case 'HEAL': {
            const multiplier = getVarianceMultiplier();
            const healAmount = Math.floor(BASE_HEAL_AMOUNT * multiplier);
            const actualHeal = Math.min(healAmount, target.stats.maxHp - target.stats.hp);
            target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healAmount);

            if (actualHeal > 0) {
                const verb = getRandomVerb(healVerbs);
                const quality = getHitQuality(multiplier);
                log.push(`${attacker.emoji} ${attacker.name} ${verb} +${actualHeal} HP${quality}`);
            } else {
                log.push(`${attacker.emoji} ${attacker.name} hat schon volle HP!`);
            }
            break;
        }

        case 'BLOCK':
            attacker.statusEffects.isBlocking = true;
            log.push(`🛡️ ${attacker.emoji} ${attacker.name} geht in Deckung!`);
            break;

        case 'DODGE':
            attacker.statusEffects.isDodging = true;
            log.push(`💨 ${attacker.emoji} ${attacker.name} bewegt sich wie ein Schatten!`);
            break;

        case 'CHARGE':
            attacker.statusEffects.isCharged = true;
            log.push(`⚡ ${attacker.emoji} ${attacker.name} lädt einen mächtigen Angriff auf!`);
            break;

        case 'WAIT':
            log.push(`💤 ${attacker.emoji} ${attacker.name} wartet ab...`);
            break;
    }
}

// ==========================================
// UNIT TURN PROCESSING
// ==========================================

function processUnitTurn(unit: Unit, state: BattleState, log: string[]): string | null {
    if (unit.isDead) return null;

    // Reset blocking and dodging at start of turn (but NOT isCharged - it carries over)
    unit.statusEffects.isBlocking = false;
    unit.statusEffects.isDodging = false;
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

// ==========================================
// HUNGER / SUDDEN DEATH
// ==========================================

function applyHunger(state: BattleState, log: string[]): void {
    if (state.tick <= HUNGER_START_ROUND) return;

    const hungerDamage = state.tick - HUNGER_START_ROUND;
    const allLivingUnits = [...state.allies, ...state.enemies].filter(u => !u.isDead);

    log.push(`🔥 HUNGER setzt ein! Alle nehmen ${hungerDamage} Schaden!`);

    for (const unit of allLivingUnits) {
        unit.stats.hp = Math.max(0, unit.stats.hp - hungerDamage);
        if (unit.stats.hp <= 0) {
            unit.isDead = true;
            log.push(`💀 ${unit.emoji} ${unit.name} verhungert!`);
        }
    }
}

// ==========================================
// BATTLE END CHECK
// ==========================================

function checkBattleEnd(state: BattleState): 'VICTORY' | 'DEFEAT' | 'ROOM_CLEARED' | 'FIGHTING' {
    const alliesAlive = state.allies.some(u => !u.isDead);
    const enemiesAlive = state.enemies.some(u => !u.isDead);

    if (!enemiesAlive) {
        if (state.dungeon.room >= state.dungeon.maxRooms) {
            return 'VICTORY';
        }
        return 'ROOM_CLEARED';
    }
    if (!alliesAlive) return 'DEFEAT';
    return 'FIGHTING';
}

// ==========================================
// MAIN TICK FUNCTION
// ==========================================

export function simulateTick(state: BattleState): BattleState {
    if (state.status !== 'FIGHTING') {
        return state;
    }

    // Deep clone state
    const newState: BattleState = {
        tick: state.tick + 1,
        allies: state.allies.map(u => ({
            ...u,
            stats: { ...u.stats },
            gambits: u.gambits.map(g => ({ ...g })),
            statusEffects: { ...u.statusEffects }
        })),
        enemies: state.enemies.map(u => ({
            ...u,
            stats: { ...u.stats },
            gambits: u.gambits.map(g => ({ ...g })),
            statusEffects: { ...u.statusEffects }
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
            return newState;
        }
    }

    applyHunger(newState, newState.log);

    const postHungerResult = checkBattleEnd(newState);
    if (postHungerResult !== 'FIGHTING') {
        newState.status = postHungerResult;
        if (postHungerResult === 'VICTORY') {
            newState.log.push(`🎉 SIEG! Der Dungeon wurde bezwungen!`);
        } else if (postHungerResult === 'ROOM_CLEARED') {
            newState.log.push(`✨ Raum ${newState.dungeon.room} geschafft!`);
        } else {
            newState.log.push(`😿 NIEDERLAGE durch Hunger...`);
        }
    }

    return newState;
}

// ==========================================
// ROOM TRANSITION
// ==========================================

export function nextRoom(state: BattleState): BattleState {
    if (state.status !== 'ROOM_CLEARED') {
        return state;
    }

    const newRoom = state.dungeon.room + 1;

    const healedAllies = state.allies.map(u => {
        const healAmount = Math.floor(u.stats.maxHp * 0.3);
        const newHp = Math.min(u.stats.maxHp, u.stats.hp + healAmount);

        return {
            ...u,
            stats: { ...u.stats, hp: newHp },
            gambits: u.gambits.map(g => ({ ...g })),
            statusEffects: { isBlocking: false, isDodging: false, isCharged: false },
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
