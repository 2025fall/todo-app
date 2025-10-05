import React from 'react';
import { Plus } from 'lucide-react';

interface SimpleEmptyStateProps {
  onNewItem: () => void;
  className?: string;
}

const SimpleEmptyState: React.FC<SimpleEmptyStateProps> = ({ onNewItem, className = '' }) => {
  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          选择左侧条目查看详情，或新建内容
        </p>
        <button
          onClick={onNewItem}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>新建</span>
        </button>
      </div>
    </div>
  );
};

export default SimpleEmptyState;
