import React, { useState } from 'react';
import { Todo, TaskStatus, Priority, ItemType } from '../types';
import { MoreHorizontal, Calendar, Clock } from 'lucide-react';

interface SimpleEntryDetailProps {
  todo: Todo;
  onEdit: () => void;
  className?: string;
}

const SimpleEntryDetail: React.FC<SimpleEntryDetailProps> = ({ todo, onEdit, className = '' }) => {
  const [showMore, setShowMore] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return '待办';
      case TaskStatus.DOING: return '进行中';
      case TaskStatus.DONE: return '已完成';
      default: return '待办';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW: return '低';
      case Priority.MEDIUM: return '中';
      case Priority.HIGH: return '高';
      case Priority.URGENT: return '紧急';
      default: return '中';
    }
  };

  return (
    <div className={`${className}`}>
      {/* 标题 */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {todo.title}
      </h1>

      {/* 状态和优先级（仅任务） */}
      {todo.type === ItemType.TASK && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">状态：</span>
            <span className="px-3 py-1 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              {getStatusLabel(todo.status)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">优先级：</span>
            <span className="px-3 py-1 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              {getPriorityLabel(todo.priority)}
            </span>
          </div>
        </div>
      )}

      {/* 正文内容 */}
      <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {todo.content || todo.description || '暂无内容'}
        </div>
      </div>

      {/* 更多信息（折叠） */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>{showMore ? '收起' : '更多信息'}</span>
        </button>

        {showMore && (
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>创建于：{formatDate(todo.created_at)}</span>
            </div>
            {todo.updated_at && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>更新于：{formatDate(todo.updated_at)}</span>
              </div>
            )}
            {todo.due_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>截止日期：{formatDate(todo.due_date)}</span>
              </div>
            )}
            {todo.tags && (
              <div className="flex items-start space-x-2">
                <span>标签：</span>
                <div className="flex flex-wrap gap-2">
                  {todo.tags.split(',').map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 编辑按钮 */}
      <div className="mt-6">
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          编辑
        </button>
      </div>
    </div>
  );
};

export default SimpleEntryDetail;
