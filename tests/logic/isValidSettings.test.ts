import { describe, test, expect } from '@jest/globals';
import { isValidSettings } from '../../src/logic/isValidSettings';

describe('isValidSettings', () => {
  describe('valid', () => {
    test('accepts length 2 with base 2', () => {
      expect(isValidSettings({ length: 2, base: 2 })).toBe(true);
    });

    test('accepts length 4 with base 10', () => {
      expect(isValidSettings({ length: 4, base: 10 })).toBe(true);
    });

    test('accepts length 6 with base 16', () => {
      expect(isValidSettings({ length: 6, base: 16 })).toBe(true);
    });
  });

  describe('length out of range', () => {
    test('rejects length 1', () => {
      expect(isValidSettings({ length: 1, base: 10 })).toBe(false);
    });

    test('rejects length 7', () => {
      expect(isValidSettings({ length: 7, base: 16 })).toBe(false);
    });
  });

  describe('base not allowed', () => {
    test('rejects base 3', () => {
      expect(isValidSettings({ length: 2, base: 3 })).toBe(false);
    });
  });

  describe('length exceeds base', () => {
    test('rejects length 3 with base 2', () => {
      expect(isValidSettings({ length: 3, base: 2 })).toBe(false);
    });
  });

  describe('non-integer values', () => {
    test('rejects fractional length', () => {
      expect(isValidSettings({ length: 2.5, base: 10 })).toBe(false);
    });
  });
});
