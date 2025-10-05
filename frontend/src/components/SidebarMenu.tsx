import React, { useState } from 'react';
import { SortOption, ViewMode } from './ViewControls';
import { MoreVertical, ArrowUpDown, Grid, List, Tag } from 'lucide-react';

interface SidebarMenuProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  className?: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  allTags,
  selectedTags,
  onTagToggle,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="更多选项"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2">
            {/* 排序 */}
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                <ArrowUpDown className="h-3 w-3" />
                <span>排序</span>
              </div>
              <div className="space-y-1">
                {[
                  { value: 'updated_at' as SortOption, label: '最近更新' },
                  { value: 'created_at' as SortOption, label: '创建时间' },
                  { value: 'title' as SortOption, label: '标题' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      onSortChange(value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      sortBy === value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* 视图 */}
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                <Grid className="h-3 w-3" />
                <span>视图</span>
              </div>
              <div className="space-y-1">
                {[
                  { value: 'list' as ViewMode, label: '列表视图', icon: List },
                  { value: 'grid' as ViewMode, label: '卡片视图', icon: Grid },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      onViewModeChange(value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center space-x-2 ${
                      viewMode === value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 标签 */}
            {allTags.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <Tag className="h-3 w-3" />
                    <span>标签筛选</span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagToggle(tag)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SidebarMenu;
