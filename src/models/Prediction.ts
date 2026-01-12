import { getDb } from '../database/connection';
import { Prediction, LeaderboardEntry } from '../types/models';
import { PlayOutcome } from '../types/enums';

/**
 * Prediction model - handles all prediction database operations
 */
export class PredictionModel {
  /**
   * Create or update a prediction
   */
  static createOrUpdate(playId: number, userId: number, predictedOutcome: PlayOutcome): Prediction {
    const db = getDb();
    
    // Check if prediction already exists
    const existing = this.findByPlayAndUser(playId, userId);
    
    if (existing) {
      // Update existing prediction
      const stmt = db.prepare(`
        UPDATE predictions 
        SET predicted_outcome = ? 
        WHERE play_id = ? AND user_id = ?
      `);
      stmt.run(predictedOutcome, playId, userId);
      return this.findByPlayAndUser(playId, userId)!;
    } else {
      // Create new prediction
      const stmt = db.prepare(`
        INSERT INTO predictions (play_id, user_id, predicted_outcome)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(playId, userId, predictedOutcome);
      return this.findById(result.lastInsertRowid as number)!;
    }
  }
  
  /**
   * Find prediction by ID
   */
  static findById(id: number): Prediction | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM predictions WHERE id = ?');
    return stmt.get(id) as Prediction | undefined;
  }
  
  /**
   * Find prediction by play and user
   */
  static findByPlayAndUser(playId: number, userId: number): Prediction | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM predictions WHERE play_id = ? AND user_id = ?');
    return stmt.get(playId, userId) as Prediction | undefined;
  }
  
  /**
   * Get all predictions for a play
   */
  static findByPlayId(playId: number): Prediction[] {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM predictions WHERE play_id = ?');
    return stmt.all(playId) as Prediction[];
  }
  
  /**
   * Update points awarded for a prediction
   */
  static updatePoints(id: number, points: number): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE predictions SET points_awarded = ? WHERE id = ?');
    stmt.run(points, id);
  }
  
  /**
   * Get leaderboard for a game
   */
  static getLeaderboard(gameId: number): LeaderboardEntry[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name as user_name,
        COALESCE(SUM(p.points_awarded), 0) as total_points
      FROM users u
      LEFT JOIN predictions p ON p.user_id = u.id
      LEFT JOIN plays pl ON pl.id = p.play_id
      WHERE u.role = 'player' AND (pl.game_id = ? OR pl.game_id IS NULL)
      GROUP BY u.id, u.name
      HAVING total_points > 0 OR COUNT(p.id) > 0
      ORDER BY total_points DESC, u.name ASC
    `);
    return stmt.all(gameId) as LeaderboardEntry[];
  }
  
  /**
   * Get user's predictions for a game
   */
  static findByGameAndUser(gameId: number, userId: number): Prediction[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT p.*
      FROM predictions p
      JOIN plays pl ON pl.id = p.play_id
      WHERE pl.game_id = ? AND p.user_id = ?
      ORDER BY pl.sequence_number ASC
    `);
    return stmt.all(gameId, userId) as Prediction[];
  }
}
