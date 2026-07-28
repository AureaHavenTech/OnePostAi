// In-memory storage for OnePost AI — session-based auth with bcrypt
// Pattern matches Axel AI (AutoExec) for ecosystem parity

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: number;
  password_hash?: string;
  avatar_url?: string;
  created_at?: string;
}

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
}

interface Session {
  token: string;
  userId: string;
  createdAt: number;
}

const store = {
  users: [] as User[],
  subscriptions: [] as Subscription[],
  sessions: [] as Session[],
};

let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

  // Seed owner user for AUREA2026 code access
  const ownerId = 'ceo_' + Math.random().toString(36).substring(2, 11);
  store.users.push({
    id: ownerId,
    email: 'owner@onepostai.app',
    name: 'Aurea',
    is_admin: 1,
    created_at: new Date().toISOString(),
  });
  store.subscriptions.push({
    id: 'sub_' + ownerId,
    user_id: ownerId,
    tier: 'pro',
    status: 'active',
  });
}

export function generateSessionToken(): string {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
}

export function createSession(userId: string): Session {
  const token = generateSessionToken();
  const session: Session = { token, userId, createdAt: Date.now() };
  store.sessions.push(session);
  // Keep max 100 sessions
  if (store.sessions.length > 100) {
    store.sessions = store.sessions.slice(-100);
  }
  return session;
}

export function getSession(token: string): Session | undefined {
  return store.sessions.find(s => s.token === token);
}

export function deleteSession(token: string): void {
  store.sessions = store.sessions.filter(s => s.token !== token);
}

export function getDb() {
  init();
  return {
    prepare(sql: string) {
      return {
        get: (...params: any[]) => {
          if (sql.includes('users WHERE email')) return store.users.find(u => u.email === params[0]) || null;
          if (sql.includes('users WHERE id')) return store.users.find(u => u.id === params[0]) || null;
          if (sql.includes('users WHERE is_admin')) return store.users.find(u => u.is_admin === 1) || null;
          if (sql.includes('subscriptions WHERE user_id')) return store.subscriptions.find(s => s.user_id === params[0]) || null;
          return null;
        },
        all: (..._params: any[]) => {
          if (sql.includes('users')) return store.users;
          if (sql.includes('subscriptions')) return store.subscriptions;
          return [];
        },
        run: (...params: any[]) => {
          if (sql.includes('INSERT INTO users') && sql.includes('password_hash')) {
            store.users.push({
              id: params[0],
              email: params[1],
              name: params[2],
              password_hash: params[3],
              is_admin: params[4] || 0,
              created_at: new Date().toISOString(),
            });
          } else if (sql.includes('INSERT INTO users')) {
            store.users.push({
              id: params[0],
              email: params[1],
              name: params[2],
              is_admin: params[3] || 0,
              created_at: new Date().toISOString(),
            });
          } else if (sql.includes('INSERT OR IGNORE INTO users')) {
            const existing = store.users.find(u => u.id === params[0] || u.email === params[1]);
            if (!existing) {
              store.users.push({
                id: params[0],
                email: params[1],
                name: params[2],
                is_admin: params[3] || 0,
                created_at: new Date().toISOString(),
              });
            }
          } else if (sql.includes('INSERT INTO subscriptions')) {
            store.subscriptions.push({
              id: params[0],
              user_id: params[1],
              tier: params[2],
              status: params[3],
            });
          } else if (sql.includes('UPDATE subscriptions SET tier')) {
            const sub = store.subscriptions.find(s => s.user_id === params[1]);
            if (sub) sub.tier = params[0];
          } else if (sql.includes('UPDATE users SET is_admin')) {
            const user = store.users.find(u => u.id === params[0]);
            if (user) user.is_admin = 1;
          } else if (sql.includes('UPDATE users SET name')) {
            const user = store.users.find(u => u.id === params[1]);
            if (user) user.name = params[0];
          } else if (sql.includes('UPDATE users SET avatar_url')) {
            const user = store.users.find(u => u.id === params[1]);
            if (user) user.avatar_url = params[0];
          }
          return {};
        },
      };
    },
  };
}
