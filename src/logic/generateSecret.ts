import { DIGIT_CHARS } from './digitChars';

const pick = (available: readonly string[], count: number, random: () => number): string[] => {
  if (count === 0) return [];
  const index = Math.floor(random() * available.length);
  const chosen = available[index];
  if (chosen === undefined) {
    throw new Error('Selected index out of bounds');
  }
  const remaining = [...available.slice(0, index), ...available.slice(index + 1)];
  return [chosen, ...pick(remaining, count - 1, random)];
};

export const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random,
): string => {
  if (length > base) {
    throw new Error(`Cannot generate ${length}-digit secret with ${base} digits`);
  }
  return pick([...DIGIT_CHARS.slice(0, base)], length, random).join('');
};
