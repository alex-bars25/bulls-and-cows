import type { GuessResult } from '../logic/evaluateGuess';

export type GameSettings = {
  readonly length: number;
  readonly base: number;
};

export type HistoryEntry = GuessResult & {
  readonly guess: string;
  readonly attemptNumber: number;
  readonly timestamp: number;
};

export type GameStatus = 'in-progress' | 'won';

export type GameState = {
  readonly settings: GameSettings;
  readonly secret: string;
  readonly history: readonly HistoryEntry[];
  readonly status: GameStatus;
  readonly startedAt: number;
};

export type GameAction =
  | {
      readonly type: 'start';
      readonly settings: GameSettings;
      readonly secret: string;
      readonly startedAt: number;
    }
  | {
      readonly type: 'guess';
      readonly guess: string;
      readonly result: GuessResult;
      readonly timestamp: number;
    }
  | { readonly type: 'reset' };

export const gameReducer = (_state: GameState | null, _action: GameAction): GameState | null => {
  throw new Error('Not implemented');
};
