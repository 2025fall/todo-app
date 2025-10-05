import React from 'react';
import { ArrowUpDown, List, Grid, Clock, Calendar, Type } from 'lucide-react';

export type SortOption = 'updated' | 'created' | 'title' | 'due_date' | 'priority';
export type ViewMode = 'list' | 'card';

interface ViewControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  className = ''
}) => {
  const sortOptions = [
    { value: 'updated', label: '最近更新', icon: Clock },
    { value: 'created', label: '创建时间', icon: Calendar },
    { value: 'title', label: '标题', icon: Type },
    { value: 'due_date', label: '截止日期', icon: Calendar },
    { value: 'priority', label: '优先级', icon: ArrowUpDown },
  ];

  const getSortIcon = (sort: SortOption) => {
    const option = sortOptions.find(opt => opt.value === sort);
    return option ? option.icon : Clock;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* 排序选择 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">排序：</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {React.createElement(getSortIcon(sortBy), { className: "h-4 w-4 text-gray-400" })}
          </div>
        </div>
      </div>

      {/* 视图模式切换 */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-all duration-200 ${
            viewMode === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="列表视图"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewModeChange('card')}
          className={`p-2 rounded-md transition-all duration-200 ${
            viewMode === 'card'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="卡片视图"
        >
          <Grid className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ViewControls;
