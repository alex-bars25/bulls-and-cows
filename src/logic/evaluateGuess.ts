export type GuessResult = { bulls: number; cows: number };

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  const secretChars = [...secret.toLowerCase()];
  const guessChars = [...guess.toLowerCase()];

  const bulls = guessChars.filter((ch, i) => ch === secretChars[i]).length;
  const commonCount = guessChars.filter((ch) => secretChars.includes(ch)).length;
  const cows = commonCount - bulls;

  return { bulls, cows };
};
