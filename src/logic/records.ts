import type { GameSettings } from '../state/gameState';

export type RecordEntry = {
  readonly attempts: number;
  readonly durationMs: number;
  readonly settings: GameSettings;
  readonly finishedAt: number;
};

export type Records = readonly RecordEntry[];

export const addRecord = (_records: Records, _entry: RecordEntry, _limit: number): Records => {
  throw new Error('Not implemented');
};
