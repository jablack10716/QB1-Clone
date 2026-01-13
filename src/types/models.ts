import { UserRole, GameStatus, PlayStatus, PlayOutcome } from './enums';

/**
 * User model interface
 */
export interface User {
  id: number;
  name: string;
  role: UserRole;
  streak: number; // Current consecutive exact matches
  created_at: string;
}

/**
 * Game model interface
 */
export interface Game {
  id: number;
  name: string;
  status: GameStatus;
  created_at: string;
}

/**
 * Play model interface
 */
export interface Play {
  id: number;
  game_id: number;
  sequence_number: number;
  quarter: number;
  down: number;
  distance: number;
  yard_line: string;
  status: PlayStatus;
  locked_at: string | null;
  locked_by: number | null;
  actual_outcome: PlayOutcome | null;
  created_at: string;
}

/**
 * Prediction model interface
 */
export interface Prediction {
  id: number;
  play_id: number;
  user_id: number;
  predicted_outcome: PlayOutcome;
  game_breaker: number; // 0 = not used, 1 = used
  points_awarded: number;
  created_at: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  total_points: number;
}

/**
 * Session user data
 */
export interface SessionUser {
  id: number;
  name: string;
  role: UserRole;
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}
