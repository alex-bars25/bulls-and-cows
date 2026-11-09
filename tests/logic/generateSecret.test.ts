import { describe, test, expect } from '@jest/globals';
import { generateSecret } from '../../src/logic/generateSecret';
import { createDigitValidator } from '../../src/logic/createDigitValidator';

describe('generateSecret', () => {
  describe('basic properties', () => {
    test('returns a string of the requested length', () => {
      expect(generateSecret(4, 10)).toHaveLength(4);
      expect(generateSecret(2, 2)).toHaveLength(2);
    });

    test('contains only digits valid for the base', () => {
      const secret = generateSecret(4, 10);
      const isDigit = createDigitValidator(10);
      for (const ch of secret) {
        expect(isDigit(ch)).toBe(true);
      }
    });

    test('contains no duplicates', () => {
      const secret = generateSecret(4, 10);
      expect(new Set(secret).size).toBe(secret.length);
    });
  });

  describe('deterministic with injected random', () => {
    test('always picking first remaining yields 0123', () => {
      expect(generateSecret(4, 10, () => 0)).toBe('0123');
    });

    test('always picking last remaining yields 9876', () => {
      expect(generateSecret(4, 10, () => 0.999)).toBe('9876');
    });
  });

  describe('binary base', () => {
    test('generates a 2-char binary secret with both digits', () => {
      const secret = generateSecret(2, 2);
      expect(secret).toHaveLength(2);
      expect(new Set(secret).size).toBe(2);
      expect([...secret].sort().join('')).toBe('01');
    });
  });

  describe('invalid arguments', () => {
    test('throws when length exceeds the number of available digits', () => {
      expect(() => generateSecret(5, 2)).toThrow();
    });
  });
});
