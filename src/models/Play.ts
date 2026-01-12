import { getDb } from '../database/connection';
import { Play } from '../types/models';
import { PlayStatus, PlayOutcome } from '../types/enums';

/**
 * Play model - handles all play database operations
 */
export class PlayModel {
  /**
   * Create a new play
   */
  static create(
    gameId: number,
    sequenceNumber: number,
    quarter: number,
    down: number,
    distance: number,
    yardLine: string
  ): Play {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO plays (game_id, sequence_number, quarter, down, distance, yard_line, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(gameId, sequenceNumber, quarter, down, distance, yardLine, PlayStatus.OPEN);
    
    return this.findById(result.lastInsertRowid as number)!;
  }
  
  /**
   * Find play by ID
   */
  static findById(id: number): Play | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM plays WHERE id = ?');
    return stmt.get(id) as Play | undefined;
  }
  
  /**
   * Get all plays for a game
   */
  static findByGameId(gameId: number): Play[] {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM plays WHERE game_id = ? ORDER BY sequence_number ASC');
    return stmt.all(gameId) as Play[];
  }
  
  /**
   * Get current play for a game (the latest play that is not scored)
   */
  static getCurrentPlay(gameId: number): Play | undefined {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM plays 
      WHERE game_id = ? AND status != ?
      ORDER BY sequence_number DESC 
      LIMIT 1
    `);
    return stmt.get(gameId, PlayStatus.SCORED) as Play | undefined;
  }
  
  /**
   * Get the next sequence number for a game
   */
  static getNextSequenceNumber(gameId: number): number {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT MAX(sequence_number) as max_seq 
      FROM plays 
      WHERE game_id = ?
    `);
    const result = stmt.get(gameId) as { max_seq: number | null };
    return (result.max_seq || 0) + 1;
  }
  
  /**
   * Update play status
   */
  static updateStatus(id: number, status: PlayStatus): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE plays SET status = ? WHERE id = ?');
    stmt.run(status, id);
  }
  
  /**
   * Set actual outcome and mark as scored
   */
  static setActualOutcome(id: number, outcome: PlayOutcome): void {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE plays 
      SET actual_outcome = ?, status = ? 
      WHERE id = ?
    `);
    stmt.run(outcome, PlayStatus.SCORED, id);
  }
}
