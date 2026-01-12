import { calculateScore } from '../scoring';
import { PlayOutcome } from '../../types/enums';

describe('calculateScore', () => {
  describe('Exact matches', () => {
    test('should return 100 for exact run match', () => {
      expect(calculateScore(PlayOutcome.RUN_SHORT_LEFT, PlayOutcome.RUN_SHORT_LEFT)).toBe(100);
    });
    
    test('should return 100 for exact pass match', () => {
      expect(calculateScore(PlayOutcome.PASS_LONG_COMPLETE, PlayOutcome.PASS_LONG_COMPLETE)).toBe(100);
    });
    
    test('should return 100 for exact other outcome match', () => {
      expect(calculateScore(PlayOutcome.SACK, PlayOutcome.SACK)).toBe(100);
      expect(calculateScore(PlayOutcome.INTERCEPTION, PlayOutcome.INTERCEPTION)).toBe(100);
      expect(calculateScore(PlayOutcome.TOUCHDOWN, PlayOutcome.TOUCHDOWN)).toBe(100);
    });
  });
  
  describe('Partial matches (same category)', () => {
    test('should return 40 for run partial match', () => {
      expect(calculateScore(PlayOutcome.RUN_SHORT_LEFT, PlayOutcome.RUN_SHORT_RIGHT)).toBe(40);
      expect(calculateScore(PlayOutcome.RUN_LONG_MIDDLE, PlayOutcome.RUN_SHORT_MIDDLE)).toBe(40);
      expect(calculateScore(PlayOutcome.RUN_SHORT_LEFT, PlayOutcome.RUN_LONG_RIGHT)).toBe(40);
    });
    
    test('should return 40 for pass partial match', () => {
      expect(calculateScore(PlayOutcome.PASS_SHORT_COMPLETE, PlayOutcome.PASS_LONG_COMPLETE)).toBe(40);
      expect(calculateScore(PlayOutcome.PASS_INCOMPLETE, PlayOutcome.PASS_SHORT_COMPLETE)).toBe(40);
      expect(calculateScore(PlayOutcome.PASS_LONG_COMPLETE, PlayOutcome.PASS_INCOMPLETE)).toBe(40);
    });
  });
  
  describe('No matches', () => {
    test('should return 0 for run vs pass', () => {
      expect(calculateScore(PlayOutcome.RUN_SHORT_LEFT, PlayOutcome.PASS_SHORT_COMPLETE)).toBe(0);
      expect(calculateScore(PlayOutcome.PASS_LONG_COMPLETE, PlayOutcome.RUN_LONG_MIDDLE)).toBe(0);
    });
    
    test('should return 0 for run vs other', () => {
      expect(calculateScore(PlayOutcome.RUN_SHORT_LEFT, PlayOutcome.SACK)).toBe(0);
      expect(calculateScore(PlayOutcome.RUN_LONG_MIDDLE, PlayOutcome.INTERCEPTION)).toBe(0);
    });
    
    test('should return 0 for pass vs other', () => {
      expect(calculateScore(PlayOutcome.PASS_SHORT_COMPLETE, PlayOutcome.FUMBLE)).toBe(0);
      expect(calculateScore(PlayOutcome.PASS_INCOMPLETE, PlayOutcome.TOUCHDOWN)).toBe(0);
    });
    
    test('should return 0 for different other outcomes', () => {
      expect(calculateScore(PlayOutcome.SACK, PlayOutcome.INTERCEPTION)).toBe(0);
      expect(calculateScore(PlayOutcome.FUMBLE, PlayOutcome.TOUCHDOWN)).toBe(0);
      expect(calculateScore(PlayOutcome.PENALTY_REPLAY_DOWN, PlayOutcome.SACK)).toBe(0);
    });
  });
  
  describe('Edge cases', () => {
    test('should handle all run variations correctly', () => {
      const runOutcomes = [
        PlayOutcome.RUN_SHORT_LEFT,
        PlayOutcome.RUN_SHORT_MIDDLE,
        PlayOutcome.RUN_SHORT_RIGHT,
        PlayOutcome.RUN_LONG_LEFT,
        PlayOutcome.RUN_LONG_MIDDLE,
        PlayOutcome.RUN_LONG_RIGHT,
      ];
      
      // All runs should give 40 points when predicted vs any other run
      runOutcomes.forEach(predicted => {
        runOutcomes.forEach(actual => {
          if (predicted === actual) {
            expect(calculateScore(predicted, actual)).toBe(100);
          } else {
            expect(calculateScore(predicted, actual)).toBe(40);
          }
        });
      });
    });
    
    test('should handle all pass variations correctly', () => {
      const passOutcomes = [
        PlayOutcome.PASS_SHORT_COMPLETE,
        PlayOutcome.PASS_LONG_COMPLETE,
        PlayOutcome.PASS_INCOMPLETE,
      ];
      
      // All passes should give 40 points when predicted vs any other pass
      passOutcomes.forEach(predicted => {
        passOutcomes.forEach(actual => {
          if (predicted === actual) {
            expect(calculateScore(predicted, actual)).toBe(100);
          } else {
            expect(calculateScore(predicted, actual)).toBe(40);
          }
        });
      });
    });
  });
});
