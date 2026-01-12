/**
 * Enum for play outcomes
 * Used for both predictions and actual play results
 */
export enum PlayOutcome {
  // Run plays
  RUN_LEFT = 'RUN_LEFT',
  RUN_CENTER = 'RUN_CENTER',
  RUN_RIGHT = 'RUN_RIGHT',
  
  // Pass plays - depth combinations with directions
  PASS_BACK_LEFT = 'PASS_BACK_LEFT',
  PASS_BACK_CENTER = 'PASS_BACK_CENTER',
  PASS_BACK_RIGHT = 'PASS_BACK_RIGHT',
  PASS_SHORT_LEFT = 'PASS_SHORT_LEFT',
  PASS_SHORT_CENTER = 'PASS_SHORT_CENTER',
  PASS_SHORT_RIGHT = 'PASS_SHORT_RIGHT',
  PASS_LONG_LEFT = 'PASS_LONG_LEFT',
  PASS_LONG_CENTER = 'PASS_LONG_CENTER',
  PASS_LONG_RIGHT = 'PASS_LONG_RIGHT',
  PASS_INCOMPLETE = 'PASS_INCOMPLETE',
  
  // Other outcomes
  SACK = 'SACK',
  INTERCEPTION = 'INTERCEPTION',
  FUMBLE = 'FUMBLE',
  TOUCHDOWN = 'TOUCHDOWN',
  PENALTY_REPLAY_DOWN = 'PENALTY_REPLAY_DOWN'
}

/**
 * Enum for user roles
 */
export enum UserRole {
  ADMIN = 'admin',
  PLAYER = 'player'
}

/**
 * Enum for game status
 */
export enum GameStatus {
  PENDING = 'pending',
  LIVE = 'live',
  FINISHED = 'finished'
}

/**
 * Enum for play status
 */
export enum PlayStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  SCORED = 'scored'
}
