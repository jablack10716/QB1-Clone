import { getDb } from '../database/connection';
import { User } from '../types/models';
import { UserRole } from '../types/enums';

/**
 * User model - handles all user database operations
 */
export class UserModel {
  /**
   * Create a new user
   */
  static create(name: string, role: UserRole): User {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
    const result = stmt.run(name, role);
    
    return this.findById(result.lastInsertRowid as number)!;
  }
  
  /**
   * Find user by ID
   */
  static findById(id: number): User | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }
  
  /**
   * Find user by name
   */
  static findByName(name: string): User | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
    return stmt.get(name) as User | undefined;
  }
  
  /**
   * Get all users
   */
  static findAll(): User[] {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as User[];
  }
  
  /**
   * Find or create user by name and role
   */
  static findOrCreate(name: string, role: UserRole): User {
    const existing = this.findByName(name);
    if (existing) {
      return existing;
    }
    return this.create(name, role);
  }
  
  /**
   * Update user's streak
   */
  static updateStreak(id: number, streak: number): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE users SET streak = ? WHERE id = ?');
    stmt.run(streak, id);
  }
}
