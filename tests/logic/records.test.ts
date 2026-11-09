import { describe, test, expect } from '@jest/globals';
import { addRecord, type RecordEntry } from '../../src/logic/records';

const makeEntry = (attempts: number, durationMs: number, finishedAt = 0): RecordEntry => ({
  attempts,
  durationMs,
  settings: { length: 4, base: 10 },
  finishedAt,
});

describe('addRecord', () => {
  describe('adding to empty list', () => {
    test('returns a single entry', () => {
      const entry = makeEntry(3, 1000);
      expect(addRecord([], entry, 10)).toEqual([entry]);
    });
  });

  describe('sorting by attempts', () => {
    test('puts the entry with fewer attempts first', () => {
      const worse = makeEntry(5, 1000);
      const better = makeEntry(2, 5000);
      const result = addRecord([worse], better, 10);

      expect(result.map((entry) => entry.attempts)).toEqual([2, 5]);
    });
  });

  describe('tie-break by duration', () => {
    test('when attempts are equal, faster entry goes first', () => {
      const slower = makeEntry(3, 5000);
      const faster = makeEntry(3, 1000);
      const result = addRecord([slower], faster, 10);

      expect(result.map((entry) => entry.durationMs)).toEqual([1000, 5000]);
    });
  });

  describe('limit', () => {
    test('truncates to the given limit', () => {
      const existing = [makeEntry(1, 100), makeEntry(2, 200), makeEntry(3, 300)];
      const result = addRecord(existing, makeEntry(4, 400), 3);

      expect(result).toHaveLength(3);
      expect(result.map((entry) => entry.attempts)).toEqual([1, 2, 3]);
    });

    test('drops the worst entry when the list is full', () => {
      const existing = [makeEntry(1, 100), makeEntry(2, 200), makeEntry(3, 300)];
      const result = addRecord(existing, makeEntry(10, 50), 3);

      expect(result.map((entry) => entry.attempts)).toEqual([1, 2, 3]);
    });

    test('keeps a new best entry and drops the worst', () => {
      const existing = [makeEntry(2, 200), makeEntry(3, 300), makeEntry(4, 400)];
      const newBest = makeEntry(1, 1000);
      const result = addRecord(existing, newBest, 3);

      expect(result.map((entry) => entry.attempts)).toEqual([1, 2, 3]);
    });
  });

  describe('immutability', () => {
    test('does not mutate the input array', () => {
      const existing = [makeEntry(5, 500)];
      const snapshot = [...existing];

      addRecord(existing, makeEntry(1, 100), 10);

      expect(existing).toEqual(snapshot);
    });
  });

  describe('edge cases', () => {
    test('limit 0 returns an empty list', () => {
      expect(addRecord([], makeEntry(1, 100), 0)).toEqual([]);
    });
  });
});
