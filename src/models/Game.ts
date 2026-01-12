import { getDb } from '../database/connection';
import { Game } from '../types/models';
import { GameStatus } from '../types/enums';

/**
 * Game model - handles all game database operations
 */
export class GameModel {
  /**
   * Create a new game
   */
  static create(name: string): Game {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO games (name, status) VALUES (?, ?)');
    const result = stmt.run(name, GameStatus.PENDING);
    
    return this.findById(result.lastInsertRowid as number)!;
  }
  
  /**
   * Find game by ID
   */
  static findById(id: number): Game | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM games WHERE id = ?');
    return stmt.get(id) as Game | undefined;
  }
  
  /**
   * Get all games
   */
  static findAll(): Game[] {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM games ORDER BY created_at DESC');
    return stmt.all() as Game[];
  }
  
  /**
   * Get games by status
   */
  static findByStatus(status: GameStatus): Game[] {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM games WHERE status = ? ORDER BY created_at DESC');
    return stmt.all(status) as Game[];
  }
  
  /**
   * Update game status
   */
  static updateStatus(id: number, status: GameStatus): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE games SET status = ? WHERE id = ?');
    stmt.run(status, id);
  }
  
  /**
   * Get active games (pending or live)
   */
  static findActive(): Game[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM games 
      WHERE status IN (?, ?) 
      ORDER BY created_at DESC
    `);
    return stmt.all(GameStatus.PENDING, GameStatus.LIVE) as Game[];
  }
}
