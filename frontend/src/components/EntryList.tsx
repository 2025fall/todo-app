import React from 'react';
import { Todo, TaskStatus, Priority, ItemType } from '../types';
import { CheckSquare, FileText, BookOpen, Clock, Calendar, AlertCircle } from 'lucide-react';
import SearchHighlight from './SearchHighlight';

interface EntryListProps {
  todos: Todo[];
  selectedTodo?: Todo;
  onSelectTodo: (todo: Todo) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
  searchQuery?: string;
  className?: string;
}

const EntryList: React.FC<EntryListProps> = ({
  todos,
  selectedTodo,
  onSelectTodo,
  onStatusChange,
  searchQuery = '',
  className = ''
}) => {
  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK:
        return CheckSquare;
      case ItemType.NOTE:
        return FileText;
      case ItemType.DIARY:
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK:
        return 'text-blue-500';
      case ItemType.NOTE:
        return 'text-green-500';
      case ItemType.DIARY:
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case TaskStatus.DOING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case TaskStatus.DONE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'text-gray-500';
      case Priority.MEDIUM:
        return 'text-yellow-500';
      case Priority.HIGH:
        return 'text-orange-500';
      case Priority.URGENT:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return <AlertCircle className="h-3 w-3" />;
      case Priority.HIGH:
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '明天';
    } else if (diffDays === -1) {
      return '昨天';
    } else if (diffDays > 0 && diffDays <= 7) {
      return `${diffDays}天后`;
    } else if (diffDays < 0 && diffDays >= -7) {
      return `${Math.abs(diffDays)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    if (status === TaskStatus.DONE) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const getPreview = (todo: Todo) => {
    if (todo.content) {
      return todo.content.length > 100 ? todo.content.substring(0, 100) + '...' : todo.content;
    }
    if (todo.description) {
      return todo.description.length > 100 ? todo.description.substring(0, 100) + '...' : todo.description;
    }
    return '暂无内容';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {todos.map((todo) => {
        const TypeIcon = getTypeIcon(todo.type);
        const isSelected = selectedTodo?.id === todo.id;
        const isTaskOverdue = todo.type === ItemType.TASK && todo.due_date && isOverdue(todo.due_date, todo.status);

        return (
          <div
            key={todo.id}
            className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => onSelectTodo(todo)}
          >
            {/* 左侧图标 */}
            <div className={`flex-shrink-0 ${getTypeColor(todo.type)}`}>
              <TypeIcon className="h-5 w-5" />
            </div>

            {/* 主要内容 */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* 标题 */}
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold text-sm truncate ${
                  isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  <SearchHighlight text={todo.title} searchQuery={searchQuery} />
                </h3>
                
                {/* 状态徽章（仅任务） */}
                {todo.type === ItemType.TASK && (
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(todo.status)}`}>
                      {todo.status === TaskStatus.TODO ? '待办' : 
                       todo.status === TaskStatus.DOING ? '进行中' : '已完成'}
                    </span>
                    {todo.priority !== Priority.MEDIUM && (
                      <div className={`flex items-center ${getPriorityColor(todo.priority)}`}>
                        {getPriorityIcon(todo.priority)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 时间信息 */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {todo.updated_at ? formatDate(todo.updated_at) : '刚刚'}
                  </span>
                </div>
                
                {todo.due_date && (
                  <div className={`flex items-center space-x-1 ${
                    isTaskOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <Calendar className="h-3 w-3" />
                    <span className={isTaskOverdue ? 'font-medium' : ''}>
                      {formatDate(todo.due_date)}
                    </span>
                  </div>
                )}
              </div>

              {/* 预览内容 */}
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                <SearchHighlight text={getPreview(todo)} searchQuery={searchQuery} />
              </p>

              {/* 标签 */}
              {todo.tags && (
                <div className="flex flex-wrap gap-1">
                  {todo.tags.split(',').slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                  {todo.tags.split(',').length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-gray-400">
                      +{todo.tags.split(',').length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 右侧操作按钮（仅任务） */}
            {todo.type === ItemType.TASK && (
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                  value={todo.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    onStatusChange(todo.id, e.target.value as TaskStatus);
                  }}
                  className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value={TaskStatus.TODO}>待办</option>
                  <option value={TaskStatus.DOING}>进行中</option>
                  <option value={TaskStatus.DONE}>已完成</option>
                </select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EntryList;