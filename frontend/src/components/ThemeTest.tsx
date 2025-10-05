import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeTest: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed top-4 left-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">主题测试</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        如果你能看到这个卡片在暗色主题下有不同的背景色，说明主题切换正常工作。
      </p>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
        当前主题: <span className="font-mono">{theme}</span>
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
        DOM类: <span className="font-mono">{document.documentElement.classList.contains('dark') ? 'dark' : 'light'}</span>
      </div>
    </div>
  );
};

export default ThemeTest;
