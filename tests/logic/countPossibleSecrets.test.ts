import { describe, test, expect } from '@jest/globals';
import { countPossibleSecrets } from '../../src/logic/countPossibleSecrets';

describe('countPossibleSecrets', () => {
  describe('basic permutations', () => {
    test('length 2 from base 4 gives 12', () => {
      expect(countPossibleSecrets(2, 4)).toBe(12);
    });

    test('length 4 from base 10 gives 5040', () => {
      expect(countPossibleSecrets(4, 10)).toBe(5040);
    });

    test('length 2 from base 2 gives 2', () => {
      expect(countPossibleSecrets(2, 2)).toBe(2);
    });

    test('length 6 from base 16 gives 5765760', () => {
      expect(countPossibleSecrets(6, 16)).toBe(16 * 15 * 14 * 13 * 12 * 11);
    });
  });

  describe('edge cases', () => {
    test('length 0 gives 1 regardless of base', () => {
      expect(countPossibleSecrets(0, 10)).toBe(1);
      expect(countPossibleSecrets(0, 0)).toBe(1);
    });

    test('length equal to base gives base factorial', () => {
      expect(countPossibleSecrets(4, 4)).toBe(24);
      expect(countPossibleSecrets(3, 3)).toBe(6);
    });

    test('length greater than base gives 0', () => {
      expect(countPossibleSecrets(5, 4)).toBe(0);
      expect(countPossibleSecrets(1, 0)).toBe(0);
    });
  });

  describe('symmetry of memoization', () => {
    test('repeated calls return the same value', () => {
      const first = countPossibleSecrets(4, 10);
      const second = countPossibleSecrets(4, 10);
      expect(second).toBe(first);
      expect(second).toBe(5040);
    });
  });
});
