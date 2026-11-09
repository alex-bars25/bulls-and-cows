import { describe, test, expect } from '@jest/globals';
import { isValidGuess } from '../../src/logic/isValidGuess';

describe('isValidGuess', () => {
  describe('valid guesses', () => {
    test('accepts a 4-digit decimal guess', () => {
      expect(isValidGuess('1234', 4, 10)).toBe(true);
    });

    test('accepts a 2-digit binary guess', () => {
      expect(isValidGuess('01', 2, 2)).toBe(true);
    });

    test('accepts a 4-char hex guess with mixed case', () => {
      expect(isValidGuess('a1B2', 4, 16)).toBe(true);
    });

    test('accepts a guess that starts with 0', () => {
      expect(isValidGuess('0123', 4, 10)).toBe(true);
    });
  });

  describe('invalid guesses', () => {
    test('rejects a guess with wrong length', () => {
      expect(isValidGuess('123', 4, 10)).toBe(false);
      expect(isValidGuess('12345', 4, 10)).toBe(false);
    });

    test('rejects letters in decimal', () => {
      expect(isValidGuess('12a4', 4, 10)).toBe(false);
    });

    test('rejects digit 2 in binary', () => {
      expect(isValidGuess('10', 2, 2)).toBe(true);
      expect(isValidGuess('12', 2, 2)).toBe(false);
    });

    test('rejects duplicated digits in decimal', () => {
      expect(isValidGuess('1123', 4, 10)).toBe(false);
    });

    test('rejects duplicated hex letters regardless of case', () => {
      expect(isValidGuess('aA12', 4, 16)).toBe(false);
    });
  });
});
