import { getDb } from './db';
import bcrypt from 'bcryptjs';

function generateId(): string {
  return crypto.randomUUID();
}

export async function createUser(email: string, name: string, password: string) {
  const db = getDb();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const stmt = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)');
  const result = stmt.run(email, name, hashedPassword);
  
  return { id: result.lastInsertRowid, email, name };
}

export async function verifyUser(email: string, password: string) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  
  if (!user) return null;
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  
  return { id: user.id, email: user.email, name: user.name, plan: user.plan };
}

export function createSession(userId: number): string {
  const db = getDb();
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .run(sessionId, userId, expiresAt);
  
  return sessionId;
}

export function getSession(sessionId: string) {
  const db = getDb();
  const session = db.prepare(`
    SELECT s.*, u.email, u.name, u.plan 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).get(sessionId) as any;
  
  return session || null;
}

export function deleteSession(sessionId: string) {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}
