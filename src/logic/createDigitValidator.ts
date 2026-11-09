const DIGIT_CHARS = '0123456789abcdef';

export const createDigitValidator =
  (base: number) =>
  (char: string): boolean => {
    if (char.length !== 1) return false;
    const lower = char.toLowerCase();
    return DIGIT_CHARS.slice(0, base).includes(lower);
  };
