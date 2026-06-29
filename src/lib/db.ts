// Graceful database module - uses better-sqlite3 when available (local dev)
// Falls back to in-memory storage on serverless platforms (Vercel)

let Database: any = null;
try {
  // Try to load the native module - only available in local Node.js
  Database = require('better-sqlite3');
} catch (e) {
  console.log('better-sqlite3 not available, using in-memory fallback');
}

import path from 'path';
import fs from 'fs';

const dbPath = process.env.VERCEL ? '/tmp/onepostai.db' : path.join(process.cwd(), 'data', 'onepostai.db');

// In-memory storage for Vercel/serverless environments
const memoryStore: {
  users: any[];
  posts: any[];
  sessions: any[];
} = {
  users: [],
  posts: [],
  sessions: [],
};

let db: any = null;

export function getDb(): any {
  if (Database) {
    // Use real SQLite when available
    if (!db) {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      initDb(db);
    }
    return db;
  }
  
  // Return in-memory fallback
  return createMemoryDb();
}

function initDb(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      platform TEXT DEFAULT 'all',
      status TEXT DEFAULT 'draft',
      scheduled_for TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      published_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS autoexec_integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      webhook_url TEXT,
      api_key TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

function createMemoryDb() {
  return {
    prepare: (sql: string) => ({
      run: (...params: any[]) => {
        const now = new Date().toISOString();
        if (sql.includes('INSERT INTO users')) {
          const newUser = { id: memoryStore.users.length + 1, email: params[0], name: params[1], password: params[2], plan: 'free', created_at: now };
          memoryStore.users.push(newUser);
          return { lastInsertRowid: newUser.id, changes: 1 };
        }
        if (sql.includes('INSERT INTO posts')) {
          const newPost = { id: memoryStore.posts.length + 1, user_id: params[0], title: params[1], content: params[2] || '', platform: params[3] || 'all', status: 'draft', created_at: now, updated_at: now, published_at: null, scheduled_for: params[4] || null };
          memoryStore.posts.push(newPost);
          return { lastInsertRowid: newPost.id, changes: 1 };
        }
        return { lastInsertRowid: 0, changes: 1 };
      },
      get: (...params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE email')) {
          return memoryStore.users.find(u => u.email === params[0]) || undefined;
        }
        if (sql.includes('SELECT * FROM sessions WHERE id')) {
          return memoryStore.sessions.find(s => s.id === params[0]) || undefined;
        }
        if (sql.includes('SELECT * FROM posts WHERE id')) {
          return memoryStore.posts.find(p => p.id === params[0]) || undefined;
        }
        return undefined;
      },
      all: (...params: any[]) => {
        if (sql.includes('SELECT * FROM posts WHERE user_id')) {
          return memoryStore.posts.filter(p => p.user_id === params[0]);
        }
        if (sql.includes('SELECT * FROM posts')) {
          return memoryStore.posts;
        }
        return [];
      },
    }),
    exec: (sql: string) => {},
    pragma: () => {},
  };
}

export default getDb;