import { createContext, useContext, useState, useEffect, useRef } from 'react';

export const USERS = [
  { id: 1, username: 'sachin',  name: 'Sachin',  role: 'admin',  initials: 'S'  },
  { id: 2, username: 'sandhya', name: 'Sandhya', role: 'member', initials: 'Sa' },
  { id: 3, username: 'bindu',   name: 'Bindu',   role: 'member', initials: 'B'  },
  { id: 4, username: 'ganesh',  name: 'Ganesh',  role: 'member', initials: 'G'  },
];

const DEFAULT_PASSWORDS = {
  sachin:  'Sachi2102*',
  sandhya: 'sandhya123',
  bindu:   'bindu123',
  ganesh:  'ganesh123',
};

const STORAGE_KEY = 'wt-pw-v2';
const ITERATIONS  = 100_000;

// ── Crypto helpers ────────────────────────────────────────────────────────────

function randomSalt() {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

async function pbkdf2Hash(password, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    key, 256
  );
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Seed localStorage with hashed defaults on first run (key wt-pw-v2 not present yet)
async function initStore() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  const store = {};
  for (const [uname, pwd] of Object.entries(DEFAULT_PASSWORDS)) {
    const salt = randomSalt();
    store[uname] = { salt, hash: await pbkdf2Hash(pwd, salt) };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return store;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('wt-user')); } catch { return null; }
  });
  const [ready, setReady] = useState(false);
  const store = useRef(null);

  useEffect(() => {
    initStore().then(s => { store.current = s; setReady(true); });
  }, []);

  const login = async (username, password) => {
    const uname = username.toLowerCase().trim();
    const record = USERS.find(u => u.username === uname);
    if (!record) return false;
    const entry = store.current?.[uname];
    if (!entry) return false;
    const hash = await pbkdf2Hash(password, entry.salt);
    if (hash !== entry.hash) return false;
    sessionStorage.setItem('wt-user', JSON.stringify(record));
    setUser(record);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem('wt-user');
    setUser(null);
  };

  // Any user changes their own password (must supply current password correctly)
  const changePassword = async (username, currentPwd, newPwd) => {
    const uname = username.toLowerCase();
    const entry = store.current?.[uname];
    if (!entry) return { ok: false, error: 'User not found' };
    const currentHash = await pbkdf2Hash(currentPwd, entry.salt);
    if (currentHash !== entry.hash) return { ok: false, error: 'Current password is incorrect' };
    const salt = randomSalt();
    const hash = await pbkdf2Hash(newPwd, salt);
    const updated = { ...store.current, [uname]: { salt, hash } };
    store.current = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true };
  };

  // Admin resets any user's password without needing their current password
  const adminResetPassword = async (username, newPwd) => {
    if (user?.role !== 'admin') return { ok: false, error: 'Admin access required' };
    const uname = username.toLowerCase();
    const salt = randomSalt();
    const hash = await pbkdf2Hash(newPwd, salt);
    const updated = { ...store.current, [uname]: { salt, hash } };
    store.current = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true };
  };

  return (
    <AuthContext.Provider value={{
      user, ready, login, logout,
      changePassword, adminResetPassword,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
