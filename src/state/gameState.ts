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

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
  switch (action.type) {
    case 'start':
      return {
        settings: action.settings,
        secret: action.secret,
        history: [],
        status: 'in-progress',
        startedAt: action.startedAt,
      };

    case 'guess': {
      if (state === null) return null;
      if (state.status === 'won') return state;

      const entry: HistoryEntry = {
        guess: action.guess,
        bulls: action.result.bulls,
        cows: action.result.cows,
        attemptNumber: state.history.length + 1,
        timestamp: action.timestamp,
      };

      const nextStatus: GameStatus =
        action.result.bulls === state.settings.length ? 'won' : 'in-progress';

      return {
        ...state,
        history: [...state.history, entry],
        status: nextStatus,
      };
    }

    case 'reset':
      return null;
  }
};
