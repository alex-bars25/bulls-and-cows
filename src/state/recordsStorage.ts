import type { Records } from '../logic/records';

export const RECORDS_STORAGE_KEY = 'bulls-and-cows:records';

export const loadRecords = (): Records => {
  throw new Error('Not implemented');
};

export const saveRecords = (_records: Records): void => {
  throw new Error('Not implemented');
};
