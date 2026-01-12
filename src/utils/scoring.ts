import { PlayOutcome } from '../types/enums';

// Tier points as defined in scoring-matrix.md
const TIER_POINTS = {
  type: {
    run: 140,
    pass: 220,
  },
  direction: 70, // LEFT/CENTER/RIGHT
  depth: {
    back: 380,
    short: 200,
    long: 290,
  },
} as const;

// Streak multipliers
const STREAK_MULTIPLIERS = {
  0: 1.0,
  1: 1.2,
  2: 1.2,
  3: 1.5,
  4: 1.5,
  5: 2.0,
  6: 2.0,
  7: 2.0,
  8: 2.0,
  9: 2.0,
  10: 3.0, // 10+ uses 3.0
} as const;

export interface ParsedPrediction {
  type: 'run' | 'pass';
  depth?: 'back' | 'short' | 'long';
  direction?: 'left' | 'center' | 'right';
}

/**
 * Parse a PlayOutcome into its tier components
 */
export function parsePrediction(outcome: PlayOutcome): ParsedPrediction {
  const parts = outcome.split('_');

  if (parts[0] === 'RUN') {
    const direction = parts[1]?.toLowerCase() as 'left' | 'center' | 'right' | undefined;
    return {
      type: 'run',
      direction,
    };
  }

  if (parts[0] === 'PASS') {
    if (parts[1] === 'INCOMPLETE') {
      return { type: 'pass' };
    }

    const depth = parts[1]?.toLowerCase() as 'back' | 'short' | 'long';
    const direction = parts[2]?.toLowerCase() as 'left' | 'center' | 'right' | undefined;

    return {
      type: 'pass',
      depth,
      direction,
    };
  }

  // For other outcomes (SACK, etc.), treat as no tiers predicted
  return { type: 'run' }; // Default, but won't match anyway
}

/**
 * Check if prediction is exact match (all predicted tiers match)
 */
function isExactMatch(predicted: ParsedPrediction, actual: ParsedPrediction): boolean {
  if (predicted.type !== actual.type) return false;

  // Check depth if predicted
  if (predicted.depth !== undefined) {
    if (predicted.depth !== actual.depth) return false;
  }

  // Check direction if predicted
  if (predicted.direction !== undefined) {
    if (predicted.direction !== actual.direction) return false;
  }

  return true;
}

/**
 * Calculate base score (before multipliers)
 */
function calculateBaseScore(predicted: ParsedPrediction, actual: ParsedPrediction): number {
  // Exact match: sum all predicted tier points
  if (isExactMatch(predicted, actual)) {
    let score = TIER_POINTS.type[predicted.type];

    if (predicted.depth) {
      score += TIER_POINTS.depth[predicted.depth];
    }

    if (predicted.direction) {
      score += TIER_POINTS.direction;
    }

    return score;
  }

  // Partial match: type points only
  if (predicted.type === actual.type) {
    return TIER_POINTS.type[predicted.type];
  }

  // No match
  return 0;
}

/**
 * Get streak multiplier
 */
function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return STREAK_MULTIPLIERS[10];
  return STREAK_MULTIPLIERS[streak as keyof typeof STREAK_MULTIPLIERS] || 1.0;
}

/**
 * Calculate score for a prediction with streak and game breaker
 *
 * @param predicted The predicted outcome
 * @param actual The actual outcome
 * @param currentStreak Current consecutive exact matches
 * @param gameBreakerUsed Whether game breaker was used (doubles base score)
 * @returns Object with score and new streak
 */
export function calculateScore(
  predicted: PlayOutcome,
  actual: PlayOutcome,
  currentStreak: number = 0,
  gameBreakerUsed: boolean = false
): { score: number; newStreak: number } {
  const predParsed = parsePrediction(predicted);
  const actualParsed = parsePrediction(actual);

  const baseScore = calculateBaseScore(predParsed, actualParsed);

  // Determine new streak
  let newStreak = currentStreak;
  if (isExactMatch(predParsed, actualParsed)) {
    // Exact match: increment streak
    newStreak = currentStreak + 1;
  } else if (predParsed.type === actualParsed.type) {
    // Partial match: hold streak
    newStreak = currentStreak;
  } else {
    // Miss: reset streak
    newStreak = 0;
  }

  // Apply game breaker (doubles base score before streak multiplier)
  const gameBreakerMultiplier = gameBreakerUsed ? 2 : 1;
  const scoreAfterGameBreaker = baseScore * gameBreakerMultiplier;

  // Apply streak multiplier based on CURRENT streak (before increment)
  const streakMultiplier = getStreakMultiplier(currentStreak);
  const finalScore = Math.round(scoreAfterGameBreaker * streakMultiplier);

  return { score: finalScore, newStreak };
}

/**
 * Legacy function for backward compatibility (simple scoring)
 * @deprecated Use calculateScore with streak and game breaker support
 */
export function calculateSimpleScore(predicted: PlayOutcome, actual: PlayOutcome): number {
  const result = calculateScore(predicted, actual, 0, false);
  return result.score;
}
