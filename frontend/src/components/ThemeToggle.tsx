import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: 'light', label: '浅色', icon: Sun },
    { key: 'dark', label: '深色', icon: Moon },
    { key: 'system', label: '跟随系统', icon: Monitor },
  ];

  const getCurrentTheme = () => {
    if (theme === 'light') return 'light';
    if (theme === 'dark') return 'dark';
    return 'system';
  };

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(newTheme as 'light' | 'dark');
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="主题设置"
        aria-label="主题设置"
      >
        {theme === 'light' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
      
      {/* 下拉菜单 */}
      <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {themes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors duration-200 ${
                getCurrentTheme() === key
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
