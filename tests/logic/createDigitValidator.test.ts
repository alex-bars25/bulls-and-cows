import { describe, test, expect } from '@jest/globals';
import { createDigitValidator } from '../../src/logic/createDigitValidator';

describe('createDigitValidator', () => {
  describe('base 10 (decimal)', () => {
    const isDigit = createDigitValidator(10);

    test('accepts digits 0-9', () => {
      expect(isDigit('0')).toBe(true);
      expect(isDigit('9')).toBe(true);
      expect(isDigit('a')).toBe(false);
      expect(isDigit('F')).toBe(false);
    });
  });

  describe('base 16 (hex)', () => {
    const isDigit = createDigitValidator(16);

    test('accepts 0-9 and a-f', () => {
      expect(isDigit('0')).toBe(true);
      expect(isDigit('9')).toBe(true);
      expect(isDigit('a')).toBe(true);
      expect(isDigit('f')).toBe(true);
      expect(isDigit('g')).toBe(false);
    });

    test('is case-insensitive for hex letters', () => {
      expect(isDigit('A')).toBe(true);
      expect(isDigit('F')).toBe(true);
    });
  });

  describe('base 2 (binary)', () => {
    const isDigit = createDigitValidator(2);

    test('accepts only 0 and 1', () => {
      expect(isDigit('0')).toBe(true);
      expect(isDigit('1')).toBe(true);
      expect(isDigit('2')).toBe(false);
      expect(isDigit('a')).toBe(false);
    });
  });

  describe('edge cases', () => {
    const isDigit = createDigitValidator(10);

    test('rejects empty string', () => {
      expect(isDigit('')).toBe(false);
    });

    test('rejects multi-character strings', () => {
      expect(isDigit('12')).toBe(false);
      expect(isDigit('ab')).toBe(false);
    });
  });

  test('returns a function', () => {
    expect(typeof createDigitValidator(10)).toBe('function');
  });
});
