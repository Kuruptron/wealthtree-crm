import { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme } from '../theme';

const ThemeContext = createContext({ theme: lightTheme, isDark: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('wt-theme') === 'dark');

  const toggleTheme = () => {
    setIsDark(d => {
      const next = !d;
      localStorage.setItem('wt-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext).theme;
export const useToggleTheme = () => useContext(ThemeContext).toggleTheme;
export const useIsDark = () => useContext(ThemeContext).isDark;
