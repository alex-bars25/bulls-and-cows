import type { GameSettings } from '../state/gameState';

const ALLOWED_BASES = [2, 8, 10, 16] as const;
type AllowedBase = (typeof ALLOWED_BASES)[number];

const isAllowedBase = (base: number): base is AllowedBase =>
  (ALLOWED_BASES as readonly number[]).includes(base);

export const isValidSettings = (settings: GameSettings): boolean => {
  const { length, base } = settings;

  if (!Number.isInteger(length) || !Number.isInteger(base)) return false;
  if (length < 2 || length > 6) return false;
  if (!isAllowedBase(base)) return false;
  if (length > base) return false;

  return true;
};
