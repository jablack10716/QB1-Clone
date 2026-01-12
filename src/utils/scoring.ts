import { PlayOutcome } from '../types/enums';

/**
 * Calculate score for a prediction
 * 
 * Scoring rules:
 * - Exact match: 100 points
 * - Partial match (same type - run vs pass): 40 points
 * - No match: 0 points
 * 
 * @param predicted The predicted outcome
 * @param actual The actual outcome
 * @returns The score (0, 40, or 100)
 */
export function calculateScore(predicted: PlayOutcome, actual: PlayOutcome): number {
  // Exact match
  if (predicted === actual) {
    return 100;
  }
  
  // Check for partial match (same high-level category)
  const predictedCategory = getOutcomeCategory(predicted);
  const actualCategory = getOutcomeCategory(actual);
  
  if (predictedCategory === actualCategory && predictedCategory !== 'other') {
    return 40;
  }
  
  // No match
  return 0;
}

/**
 * Get the high-level category of an outcome
 * 
 * @param outcome The play outcome
 * @returns The category: 'run', 'pass', or 'other'
 */
function getOutcomeCategory(outcome: PlayOutcome): 'run' | 'pass' | 'other' {
  const runOutcomes = [
    PlayOutcome.RUN_SHORT_LEFT,
    PlayOutcome.RUN_SHORT_MIDDLE,
    PlayOutcome.RUN_SHORT_RIGHT,
    PlayOutcome.RUN_LONG_LEFT,
    PlayOutcome.RUN_LONG_MIDDLE,
    PlayOutcome.RUN_LONG_RIGHT,
  ];
  
  const passOutcomes = [
    PlayOutcome.PASS_SHORT_COMPLETE,
    PlayOutcome.PASS_LONG_COMPLETE,
    PlayOutcome.PASS_INCOMPLETE,
  ];
  
  if (runOutcomes.includes(outcome)) {
    return 'run';
  }
  
  if (passOutcomes.includes(outcome)) {
    return 'pass';
  }
  
  return 'other';
}
