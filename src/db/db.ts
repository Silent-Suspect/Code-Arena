// Dexie Database Configuration
// Stores run state as JSON blob (no relational joins for savegames)

import Dexie, { type EntityTable } from 'dexie';
import type { BattleState } from '../engine/types';

// Define the Run record structure
export interface Run {
    id?: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    battleState: BattleState;
}

// Extend Dexie with our tables
const db = new Dexie('CodeArenaDB') as Dexie & {
    runs: EntityTable<Run, 'id'>;
};

// Schema definition
db.version(1).stores({
    runs: '++id, name, createdAt, updatedAt'
});

export { db };

// Helper functions
export async function saveRun(run: Omit<Run, 'id'>): Promise<number> {
    return await db.runs.add(run);
}

export async function updateRun(id: number, updates: Partial<Run>): Promise<void> {
    await db.runs.update(id, { ...updates, updatedAt: new Date() });
}

export async function getRun(id: number): Promise<Run | undefined> {
    return await db.runs.get(id);
}

export async function getAllRuns(): Promise<Run[]> {
    return await db.runs.orderBy('updatedAt').reverse().toArray();
}

export async function deleteRun(id: number): Promise<void> {
    await db.runs.delete(id);
}
