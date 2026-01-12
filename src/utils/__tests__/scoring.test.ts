import { calculateScore, parsePrediction } from '../scoring';
import { PlayOutcome } from '../../types/enums';

describe('parsePrediction', () => {
  test('should parse RUN_LEFT correctly', () => {
    expect(parsePrediction(PlayOutcome.RUN_LEFT)).toEqual({
      type: 'run',
      direction: 'left',
    });
  });

  test('should parse PASS_BACK_RIGHT correctly', () => {
    expect(parsePrediction(PlayOutcome.PASS_BACK_RIGHT)).toEqual({
      type: 'pass',
      depth: 'back',
      direction: 'right',
    });
  });

  test('should parse PASS_SHORT correctly (no direction)', () => {
    // Note: PASS_SHORT doesn't exist in enum, but PASS_SHORT_LEFT would be parsed as having depth
    expect(parsePrediction(PlayOutcome.PASS_SHORT_LEFT)).toEqual({
      type: 'pass',
      depth: 'short',
      direction: 'left',
    });
  });

  test('should parse PASS_INCOMPLETE correctly', () => {
    expect(parsePrediction(PlayOutcome.PASS_INCOMPLETE)).toEqual({
      type: 'pass',
    });
  });
});

describe('calculateScore', () => {
  describe('Exact matches', () => {
    test('should award full points for RUN_LEFT exact match', () => {
      const result = calculateScore(PlayOutcome.RUN_LEFT, PlayOutcome.RUN_LEFT, 0, false);
      expect(result.score).toBe(210); // 140 (run) + 70 (direction) * 1.0x
      expect(result.newStreak).toBe(1);
    });

    test('should award full points for PASS_BACK_RIGHT exact match', () => {
      const result = calculateScore(PlayOutcome.PASS_BACK_RIGHT, PlayOutcome.PASS_BACK_RIGHT, 0, false);
      expect(result.score).toBe(670); // 220 (pass) + 380 (back) + 70 (direction) * 1.0x
      expect(result.newStreak).toBe(1);
    });

    test('should award full points for PASS_SHORT_LEFT exact match', () => {
      const result = calculateScore(PlayOutcome.PASS_SHORT_LEFT, PlayOutcome.PASS_SHORT_LEFT, 0, false);
      expect(result.score).toBe(490); // 220 (pass) + 200 (short) + 70 (direction) * 1.0x
      expect(result.newStreak).toBe(1);
    });
  });

  describe('Partial matches (type only)', () => {
    test('should award type points only for RUN direction mismatch', () => {
      const result = calculateScore(PlayOutcome.RUN_LEFT, PlayOutcome.RUN_CENTER, 2, false);
      expect(result.score).toBe(168); // 140 (run) * 1.2x (current streak 2)
      expect(result.newStreak).toBe(2); // Streak holds
    });

    test('should award type points only for PASS depth/direction mismatch', () => {
      const result = calculateScore(PlayOutcome.PASS_BACK_RIGHT, PlayOutcome.PASS_SHORT_LEFT, 1, false);
      expect(result.score).toBe(264); // 220 (pass) * 1.2x (current streak 1)
      expect(result.newStreak).toBe(1); // Streak holds
    });
  });

  describe('No matches', () => {
    test('should award 0 points for RUN vs PASS', () => {
      const result = calculateScore(PlayOutcome.RUN_LEFT, PlayOutcome.PASS_BACK_RIGHT, 3, false);
      expect(result.score).toBe(0);
      expect(result.newStreak).toBe(0); // Streak resets
    });

    test('should award 0 points for PASS vs RUN', () => {
      const result = calculateScore(PlayOutcome.PASS_SHORT_LEFT, PlayOutcome.RUN_CENTER, 2, false);
      expect(result.score).toBe(0);
      expect(result.newStreak).toBe(0); // Streak resets
    });
  });

  describe('Streak multipliers', () => {
    test('should apply 1.2x multiplier for streak of 1-2', () => {
      const result = calculateScore(PlayOutcome.RUN_LEFT, PlayOutcome.RUN_LEFT, 1, false);
      expect(result.score).toBe(Math.round(210 * 1.2)); // 210 * 1.2 = 252
      expect(result.newStreak).toBe(2);
    });

    test('should apply 1.5x multiplier for streak of 3-4', () => {
      const result = calculateScore(PlayOutcome.RUN_LEFT, PlayOutcome.RUN_LEFT, 3, false);
      expect(result.score).toBe(Math.round(210 * 1.5)); // 210 * 1.5 = 315
      expect(result.newStreak).toBe(4);
    });

    test('should apply 2.0x multiplier for streak of 5-9', () => {
      const result = calculateScore(PlayOutcome.PASS_BACK_RIGHT, PlayOutcome.PASS_BACK_RIGHT, 5, false);
      expect(result.score).toBe(Math.round(670 * 2.0)); // 670 * 2.0 = 1340
      expect(result.newStreak).toBe(6);
    });

    test('should apply 3.0x multiplier for streak of 10+', () => {
      const result = calculateScore(PlayOutcome.PASS_BACK_RIGHT, PlayOutcome.PASS_BACK_RIGHT, 10, false);
      expect(result.score).toBe(Math.round(670 * 3.0)); // 670 * 3.0 = 2010
      expect(result.newStreak).toBe(11);
    });
  });

  describe('Game Breaker', () => {
    test('should double base score before streak multiplier', () => {
      const result = calculateScore(PlayOutcome.PASS_BACK_RIGHT, PlayOutcome.PASS_BACK_RIGHT, 3, true);
      expect(result.score).toBe(Math.round((670 * 2) * 1.5)); // (670 * 2) * 1.5 = 2010
      expect(result.newStreak).toBe(4);
    });

    test('should work with streak multipliers', () => {
      const result = calculateScore(PlayOutcome.RUN_LEFT, PlayOutcome.RUN_LEFT, 5, true);
      expect(result.score).toBe(Math.round((210 * 2) * 2.0)); // (210 * 2) * 2.0 = 840
      expect(result.newStreak).toBe(6);
    });
  });

  describe('Edge cases', () => {
    test('should handle PASS_INCOMPLETE (no depth/direction)', () => {
      const result = calculateScore(PlayOutcome.PASS_INCOMPLETE, PlayOutcome.PASS_INCOMPLETE, 0, false);
      expect(result.score).toBe(220); // Only pass type points * 1.0x
      expect(result.newStreak).toBe(1);
    });

    test('should handle partial match with PASS_INCOMPLETE', () => {
      const result = calculateScore(PlayOutcome.PASS_BACK_RIGHT, PlayOutcome.PASS_INCOMPLETE, 2, false);
      expect(result.score).toBe(264); // 220 (pass) * 1.2x (current streak 2)
      expect(result.newStreak).toBe(2); // Streak holds
    });
  });
});
