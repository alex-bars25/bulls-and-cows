import type { GameSettings } from '../state/gameState';

export type RecordEntry = {
  readonly attempts: number;
  readonly durationMs: number;
  readonly settings: GameSettings;
  readonly finishedAt: number;
};

export type Records = readonly RecordEntry[];

const compareRecords = (a: RecordEntry, b: RecordEntry): number => {
  if (a.attempts !== b.attempts) return a.attempts - b.attempts;
  return a.durationMs - b.durationMs;
};

export const addRecord = (records: Records, entry: RecordEntry, limit: number): Records => {
  if (limit <= 0) return [];
  return [...records, entry].sort(compareRecords).slice(0, limit);
};
