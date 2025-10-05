import React from 'react';
import { ItemType } from '../types';
import { CheckSquare, FileText, BookOpen, Tag, X } from 'lucide-react';

interface FiltersProps {
  selectedType: ItemType | 'all';
  onTypeChange: (type: ItemType | 'all') => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
  className?: string;
}

const Filters: React.FC<FiltersProps> = ({
  selectedType,
  onTypeChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClearTags,
  className = ''
}) => {
  const types = [
    { type: 'all' as const, label: '全部', icon: null, count: 0 },
    { type: ItemType.TASK, label: '任务', icon: CheckSquare, count: 0 },
    { type: ItemType.NOTE, label: '笔记', icon: FileText, count: 0 },
    { type: ItemType.DIARY, label: '日记', icon: BookOpen, count: 0 },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 类型筛选 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">类型</h3>
        <div className="space-y-1">
          {types.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedType === type
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{label}</span>
              </div>
              {/* 这里可以添加计数 */}
            </button>
          ))}
        </div>
      </div>

      {/* 标签筛选 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">标签</h3>
          {selectedTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              清除
            </button>
          )}
        </div>
        
        {allTags.length === 0 ? (
          <div className="text-center py-6">
            <Tag className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">暂无标签</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">点击上方 + 新增</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Tag className="h-3 w-3" />
                  <span className="truncate">{tag}</span>
                </div>
                {selectedTags.includes(tag) && (
                  <X className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
