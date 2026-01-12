import { getDb } from './connection';

/**
 * Run database migrations
 * This creates all the necessary tables with proper schema
 */
export function runMigrations(): void {
  const db = getDb();
  
  console.log('Running database migrations...');
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'player')),
      streak INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  // Create games table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'live', 'finished')) DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  // Create plays table
  db.exec(`
    CREATE TABLE IF NOT EXISTS plays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      sequence_number INTEGER NOT NULL,
      quarter INTEGER NOT NULL CHECK(quarter >= 1 AND quarter <= 4),
      down INTEGER NOT NULL CHECK(down >= 1 AND down <= 4),
      distance INTEGER NOT NULL,
      yard_line TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('open', 'locked', 'scored')) DEFAULT 'open',
      actual_outcome TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      UNIQUE(game_id, sequence_number)
    )
  `);
  
  // Create predictions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      play_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      predicted_outcome TEXT NOT NULL,
      game_breaker INTEGER NOT NULL DEFAULT 0,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (play_id) REFERENCES plays(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(play_id, user_id)
    )
  `);
  
  // Add game_breaker column to existing predictions table if it doesn't exist
  try {
    db.exec(`ALTER TABLE predictions ADD COLUMN game_breaker INTEGER NOT NULL DEFAULT 0`);
  } catch (error) {
    // Column may already exist, ignore error
  }
  
  // Add streak column to existing users table if it doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN streak INTEGER NOT NULL DEFAULT 0`);
  } catch (error) {
    // Column may already exist, ignore error
  }
  
  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_plays_game_id ON plays(game_id);
    CREATE INDEX IF NOT EXISTS idx_predictions_play_id ON predictions(play_id);
    CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
  `);
  
  console.log('Migrations completed successfully!');
}

// Run migrations if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  try {
    runMigrations();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
