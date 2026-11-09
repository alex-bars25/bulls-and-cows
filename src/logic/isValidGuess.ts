import { createDigitValidator } from './createDigitValidator';

export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  if (guess.length !== length) return false;

  const isDigit = createDigitValidator(base);
  const chars = [...guess.toLowerCase()];

  if (!chars.every(isDigit)) return false;

  return new Set(chars).size === length;
};
