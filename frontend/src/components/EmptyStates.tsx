import React from 'react';
import { Plus, FileText, CheckSquare, BookOpen, Calendar } from 'lucide-react';
import { ItemType } from '../types';

interface EmptyStateProps {
  type: 'no-items' | 'no-selection';
  onNewItem: (itemType?: ItemType) => void;
  className?: string;
}

const EmptyStates: React.FC<EmptyStateProps> = ({ type, onNewItem, className = '' }) => {
  if (type === 'no-items') {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md mx-auto px-6">
          {/* 插画 */}
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
            <div className="grid grid-cols-2 gap-2">
              <CheckSquare className="h-8 w-8 text-blue-500" />
              <FileText className="h-8 w-8 text-green-500" />
              <BookOpen className="h-8 w-8 text-purple-500" />
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          {/* 标题和描述 */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            创建你的第一个条目
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            开始使用 Todo App 管理你的任务、记录笔记和写日记。选择下方模板快速开始，或点击新建按钮自由创建。
          </p>
          
          {/* 模板按钮 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => onNewItem(ItemType.TASK)}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 group"
            >
              <CheckSquare className="h-8 w-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">任务</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">管理待办事项</p>
            </button>
            
            <button
              onClick={() => onNewItem(ItemType.NOTE)}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-200 group"
            >
              <FileText className="h-8 w-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">笔记</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">记录想法</p>
            </button>
            
            <button
              onClick={() => onNewItem(ItemType.DIARY)}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200 group"
            >
              <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">日记</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">记录生活</p>
            </button>
          </div>
          
          {/* 主按钮 */}
          <button
            onClick={() => onNewItem()}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center mx-auto gap-2"
          >
            <Plus className="h-5 w-5" />
            开始创建
          </button>
        </div>
      </div>
    );
  }

  if (type === 'no-selection') {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md mx-auto px-6">
          {/* 图标 */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          
          {/* 标题和描述 */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            请选择左侧条目或新建
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            从左侧列表中选择一个条目查看详情，或点击下方按钮创建新内容。
          </p>
          
          {/* 新建按钮 */}
          <button
            onClick={() => onNewItem()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mx-auto gap-2"
          >
            <Plus className="h-4 w-4" />
            新建
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default EmptyStates;
