const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

// Ensure database directory exists
const dbDir = path.dirname(config.DATABASE_PATH);
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = config.DATABASE_PATH;

// Create and export a singleton database instance
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Create tables if not exist
db.serialize(() => {
  // Users table - maps Telegram sender_id to Actual Budget user
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      actual_user_id TEXT,
      budget_id TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Telegram chats table - tracks chat sessions
  db.run(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      budget_name TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(sender_id)
    )
  `);

  // Budget accounts table - stores Actual Budget accounts per user
  db.run(`
    CREATE TABLE IF NOT EXISTS budget_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      actual_account_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      on_budget BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Transaction log - stores parsed transactions
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      chat_id TEXT,
      raw_text TEXT,
      parsed_json TEXT,
      actual_transaction_id TEXT,
      synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

// Helper function to get user by sender_id
const getUserBySenderId = (senderId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE sender_id = ?',
      [senderId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

// Helper function to get or create user by sender_id (upsert)
const getOrCreateUser = (senderId, email, name) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE sender_id = ?',
      [senderId],
      (err, row) => {
        if (err) reject(err);
        else if (row) {
          // User exists, return it
          resolve(row);
        } else {
          // User doesn't exist, create it
          db.run(
            'INSERT INTO users (sender_id, email, name) VALUES (?, ?, ?)',
            [senderId, email, name],
            function(err) {
              if (err) reject(err);
              else {
                // Return the newly created user
                db.get(
                  'SELECT * FROM users WHERE sender_id = ?',
                  [senderId],
                  (err, newRow) => {
                    if (err) reject(err);
                    else resolve(newRow);
                  }
                );
              }
            }
          );
        }
      }
    );
  });
};

// Export db and helpers
module.exports = {
  db,
  getUserBySenderId,
  getOrCreateUser
};
