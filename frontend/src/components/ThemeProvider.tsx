import React, { useEffect, useState } from 'react';
import { devLog } from '../utils/devLogger';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    devLog('Applying theme:', newTheme);
    if (newTheme === 'dark') {
      root.classList.add('dark');
      devLog('Added dark class');
    } else {
      root.classList.remove('dark');
      devLog('Removed dark class');
    }
    devLog('Root classes:', root.className);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    // 从 localStorage 读取主题设置
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      setThemeState(systemTheme);
      applyTheme(systemTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
