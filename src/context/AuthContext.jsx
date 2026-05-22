import { createContext, useContext, useState } from 'react';

const USERS = [
  { id: 1, username: 'sachin',  password: 'sachin123',  name: 'Sachin',  role: 'admin',  initials: 'S' },
  { id: 2, username: 'sandhya', password: 'sandhya123', name: 'Sandhya', role: 'member', initials: 'Sa' },
  { id: 3, username: 'bindu',   password: 'bindu123',   name: 'Bindu',   role: 'member', initials: 'B' },
  { id: 4, username: 'ganesh',  password: 'ganesh123',  name: 'Ganesh',  role: 'member', initials: 'G' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('wt-user')); } catch { return null; }
  });

  const login = (username, password) => {
    const found = USERS.find(u => u.username === username.toLowerCase() && u.password === password);
    if (!found) return false;
    const { password: _, ...safe } = found;
    sessionStorage.setItem('wt-user', JSON.stringify(safe));
    setUser(safe);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem('wt-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
