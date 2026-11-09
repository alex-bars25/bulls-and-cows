import { describe, test, expect } from '@jest/globals';
import { evaluateGuess } from '../../src/logic/evaluateGuess';

describe('evaluateGuess', () => {
  describe('exact matches', () => {
    test('all bulls when guess equals secret', () => {
      expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
    });

    test('all cows when digits are permuted', () => {
      expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
    });
  });

  describe('partial matches', () => {
    test('counts bulls and cows together', () => {
      expect(evaluateGuess('1234', '1324')).toEqual({ bulls: 2, cows: 2 });
    });

    test('one bull and no cows', () => {
      expect(evaluateGuess('1234', '1567')).toEqual({ bulls: 1, cows: 0 });
    });

    test('no matches at all', () => {
      expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
    });
  });

  describe('hex case-insensitivity', () => {
    test('lowercase secret and uppercase guess', () => {
      expect(evaluateGuess('a1b2', 'A1B2')).toEqual({ bulls: 4, cows: 0 });
    });

    test('mixed case with permutation', () => {
      expect(evaluateGuess('a1b2', 'B2A1')).toEqual({ bulls: 0, cows: 4 });
    });
  });

  describe('leading zeros', () => {
    test('treats leading zero as a normal digit', () => {
      expect(evaluateGuess('0123', '0123')).toEqual({ bulls: 4, cows: 0 });
      expect(evaluateGuess('0123', '3210')).toEqual({ bulls: 0, cows: 4 });
    });
  });
});
