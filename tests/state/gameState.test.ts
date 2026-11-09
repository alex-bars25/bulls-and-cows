import { describe, test, expect } from '@jest/globals';
import { gameReducer, type GameState, type GameSettings } from '../../src/state/gameState';

const expectState = (state: GameState | null): GameState => {
  if (state === null) throw new Error('expected non-null state');
  return state;
};

describe('gameReducer', () => {
  const decimalSettings: GameSettings = { length: 4, base: 10 };

  const startedGame = (): GameState =>
    expectState(
      gameReducer(null, {
        type: 'start',
        settings: decimalSettings,
        secret: '1234',
        startedAt: 1_000,
      }),
    );

  describe('start', () => {
    test('creates state with empty history and in-progress status', () => {
      const state = expectState(
        gameReducer(null, {
          type: 'start',
          settings: decimalSettings,
          secret: '1234',
          startedAt: 1_000,
        }),
      );

      expect(state.settings).toEqual(decimalSettings);
      expect(state.secret).toBe('1234');
      expect(state.history).toEqual([]);
      expect(state.status).toBe('in-progress');
      expect(state.startedAt).toBe(1_000);
    });
  });

  describe('guess', () => {
    test('adds an entry with attempt number 1', () => {
      const nextState = expectState(
        gameReducer(startedGame(), {
          type: 'guess',
          guess: '5678',
          result: { bulls: 0, cows: 0 },
          timestamp: 1_500,
        }),
      );

      expect(nextState.history).toHaveLength(1);
      expect(nextState.history[0]).toEqual({
        guess: '5678',
        bulls: 0,
        cows: 0,
        attemptNumber: 1,
        timestamp: 1_500,
      });
      expect(nextState.status).toBe('in-progress');
    });

    test('does not mutate the previous state', () => {
      const previousState = startedGame();
      const previousHistory = previousState.history;

      gameReducer(previousState, {
        type: 'guess',
        guess: '5678',
        result: { bulls: 0, cows: 0 },
        timestamp: 1_500,
      });

      expect(previousState.history).toBe(previousHistory);
      expect(previousState.history).toHaveLength(0);
    });

    test('increments attempt number for consecutive guesses', () => {
      const firstState = expectState(
        gameReducer(startedGame(), {
          type: 'guess',
          guess: '5678',
          result: { bulls: 0, cows: 0 },
          timestamp: 1_500,
        }),
      );
      const secondState = expectState(
        gameReducer(firstState, {
          type: 'guess',
          guess: '9012',
          result: { bulls: 0, cows: 0 },
          timestamp: 2_000,
        }),
      );

      expect(secondState.history.map((entry) => entry.attemptNumber)).toEqual([1, 2]);
    });

    test('sets status to won when bulls equal length', () => {
      const nextState = expectState(
        gameReducer(startedGame(), {
          type: 'guess',
          guess: '1234',
          result: { bulls: 4, cows: 0 },
          timestamp: 1_500,
        }),
      );

      expect(nextState.status).toBe('won');
    });

    test('ignores guesses after win', () => {
      const wonState = expectState(
        gameReducer(startedGame(), {
          type: 'guess',
          guess: '1234',
          result: { bulls: 4, cows: 0 },
          timestamp: 1_500,
        }),
      );

      const afterWinState = gameReducer(wonState, {
        type: 'guess',
        guess: '5678',
        result: { bulls: 0, cows: 0 },
        timestamp: 2_000,
      });

      expect(afterWinState).toBe(wonState);
    });

    test('returns null when no game is started', () => {
      const nextState = gameReducer(null, {
        type: 'guess',
        guess: '5678',
        result: { bulls: 0, cows: 0 },
        timestamp: 1_500,
      });

      expect(nextState).toBeNull();
    });
  });

  describe('reset', () => {
    test('returns null from any state', () => {
      expect(gameReducer(startedGame(), { type: 'reset' })).toBeNull();
      expect(gameReducer(null, { type: 'reset' })).toBeNull();
    });
  });
});
