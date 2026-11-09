import { describe, test, expect, beforeEach } from '@jest/globals';
import { loadRecords, saveRecords, RECORDS_STORAGE_KEY } from '../../src/state/recordsStorage';
import type { RecordEntry } from '../../src/logic/records';

const sampleEntry: RecordEntry = {
  attempts: 3,
  durationMs: 1_000,
  settings: { length: 4, base: 10 },
  finishedAt: 123_456,
};

describe('recordsStorage', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    const localStorageMock = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
      key: (index: number) => [...store.keys()][index] ?? null,
      get length() {
        return store.size;
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
  });

  describe('loadRecords', () => {
    test('returns empty array when nothing stored', () => {
      expect(loadRecords()).toEqual([]);
    });

    test('returns empty array on invalid JSON', () => {
      store.set(RECORDS_STORAGE_KEY, '{not valid json');
      expect(loadRecords()).toEqual([]);
    });

    test('returns empty array when stored value is not an array', () => {
      store.set(RECORDS_STORAGE_KEY, JSON.stringify({ attempts: 3 }));
      expect(loadRecords()).toEqual([]);
    });

    test('returns empty array when an entry has wrong shape', () => {
      store.set(RECORDS_STORAGE_KEY, JSON.stringify([{ attempts: 'three' }]));
      expect(loadRecords()).toEqual([]);
    });

    test('returns parsed records when stored value is valid', () => {
      store.set(RECORDS_STORAGE_KEY, JSON.stringify([sampleEntry]));
      expect(loadRecords()).toEqual([sampleEntry]);
    });
  });

  describe('saveRecords', () => {
    test('writes records as JSON under the storage key', () => {
      saveRecords([sampleEntry]);
      expect(store.get(RECORDS_STORAGE_KEY)).toBe(JSON.stringify([sampleEntry]));
    });

    test('does not throw when the underlying storage throws', () => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: () => null,
          setItem: () => {
            throw new Error('QuotaExceeded');
          },
        },
        configurable: true,
        writable: true,
      });

      expect(() => saveRecords([sampleEntry])).not.toThrow();
    });
  });
});
