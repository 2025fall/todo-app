import React from 'react';
import { useTheme } from '../hooks/useTheme';

const SimpleThemeTest: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          主题测试
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          当前主题: <span className="font-bold">{theme}</span>
        </p>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          切换主题
        </button>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          DOM: {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        </div>
      </div>
    </div>
  );
};

export default SimpleThemeTest;
