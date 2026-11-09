import type { GameSettings } from '../state/gameState';
import type { RecordEntry, Records } from '../logic/records';

export const RECORDS_STORAGE_KEY = 'bulls-and-cows:records';

const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isGameSettings = (value: unknown): value is GameSettings => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return isInteger(candidate.length) && isInteger(candidate.base);
};

const isRecordEntry = (value: unknown): value is RecordEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    isInteger(candidate.attempts) &&
    isInteger(candidate.durationMs) &&
    isInteger(candidate.finishedAt) &&
    isGameSettings(candidate.settings)
  );
};

export const loadRecords = (): Records => {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const entries = parsed.filter(isRecordEntry);
    if (entries.length !== parsed.length) return [];

    return entries;
  } catch {
    return [];
  }
};

export const saveRecords = (records: Records): void => {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Хранилище может быть недоступно
  }
};
