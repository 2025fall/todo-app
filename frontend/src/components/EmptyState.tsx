import React from 'react';
import { Plus, Search, Filter, FileText, CheckSquare, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-items' | 'no-search-results' | 'no-filter-results';
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, className = '' }) => {
  const getContent = () => {
    switch (type) {
      case 'no-items':
        return {
          icon: <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Plus className="h-10 w-10 text-blue-500" />
          </div>,
          title: '开始创建你的第一个条目',
          description: '在右侧创建任务、笔记或日记，开始你的高效工作之旅',
          actionText: '立即创建',
          actionIcon: <Plus className="h-4 w-4" />
        };
      
      case 'no-search-results':
        return {
          icon: <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-10 w-10 text-gray-400" />
          </div>,
          title: '未找到相关结果',
          description: '尝试使用不同的关键词或检查拼写',
          actionText: '清除搜索',
          actionIcon: <Search className="h-4 w-4" />
        };
      
      case 'no-filter-results':
        return {
          icon: <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="h-10 w-10 text-gray-400" />
          </div>,
          title: '没有匹配的条目',
          description: '当前筛选条件下没有找到相关条目',
          actionText: '清除筛选',
          actionIcon: <Filter className="h-4 w-4" />
        };
    }
  };

  const content = getContent();

  return (
    <div className={`text-center py-12 ${className}`}>
      {content.icon}
      
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {content.title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {content.description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
        >
          {content.actionIcon}
          <span>{content.actionText}</span>
        </button>
      )}
      
      {/* 快捷键提示 */}
      {type === 'no-items' && (
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">快捷键提示</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">K</kbd>
              <span className="text-gray-500 dark:text-gray-400">命令面板</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">N</kbd>
              <span className="text-gray-500 dark:text-gray-400">快速新建</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">N</kbd>
              <span className="text-gray-500 dark:text-gray-400">新建条目</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
