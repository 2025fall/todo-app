import React from 'react';
import { Todo, TaskStatus, ItemType, Priority } from '../types';
import { CheckSquare, FileText, BookOpen, Calendar, Flag, Clock, Tag } from 'lucide-react';
import Badge from './Badge';

interface EntryDetailProps {
  todo: Todo;
  className?: string;
}

const EntryDetail: React.FC<EntryDetailProps> = ({ todo, className = '' }) => {
  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK: return <CheckSquare className="h-5 w-5 text-blue-500" />;
      case ItemType.NOTE: return <FileText className="h-5 w-5 text-green-500" />;
      case ItemType.DIARY: return <BookOpen className="h-5 w-5 text-purple-500" />;
      default: return <CheckSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK: return '任务';
      case ItemType.NOTE: return '笔记';
      case ItemType.DIARY: return '日记';
      default: return '任务';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT: return 'text-red-600 bg-red-100 border-red-200';
      case Priority.HIGH: return 'text-orange-600 bg-orange-100 border-orange-200';
      case Priority.MEDIUM: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case Priority.LOW: return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT: return '紧急';
      case Priority.HIGH: return '高';
      case Priority.MEDIUM: return '中';
      case Priority.LOW: return '低';
      default: return '中';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffInDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 1 && diffInDays >= 0;
  };

  const renderMarkdown = (content: string) => {
    // 简单的 Markdown 渲染
    return content
      .split('\n')
      .map((line, index) => {
        // 处理标题
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold text-gray-900 mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium text-gray-900 mb-2">{line.slice(4)}</h3>;
        }
        
        // 处理列表项
        if (line.startsWith('- [ ] ')) {
          return (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <div className="w-4 h-4 border border-gray-300 rounded mt-1 flex-shrink-0"></div>
              <span className="text-gray-700">{line.slice(6)}</span>
            </div>
          );
        }
        if (line.startsWith('- [x] ')) {
          return (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              <span className="text-gray-700 line-through">{line.slice(6)}</span>
            </div>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{line.slice(2)}</span>
            </div>
          );
        }
        
        // 处理代码块
        if (line.startsWith('```')) {
          return <div key={index} className="bg-gray-100 rounded p-2 font-mono text-sm my-2">{line.slice(3)}</div>;
        }
        
        // 处理普通段落
        if (line.trim()) {
          return <p key={index} className="text-gray-700 leading-relaxed mb-3">{line}</p>;
        }
        
        return <br key={index} />;
      });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题区域 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {todo.title}
        </h1>
        
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              todo.type === ItemType.TASK ? 'bg-blue-100' :
              todo.type === ItemType.NOTE ? 'bg-green-100' : 'bg-purple-100'
            }`}>
              {getTypeIcon(todo.type || ItemType.TASK)}
            </div>
            <span className="font-medium">{getTypeLabel(todo.type || ItemType.TASK)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>创建于 {formatTime(todo.created_at)}</span>
          </div>
          
          {todo.updated_at && todo.updated_at !== todo.created_at && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>更新于 {formatTime(todo.updated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 元信息卡片 */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* 状态 */}
          {todo.type === ItemType.TASK && todo.status && (
            <Badge 
              variant="soft" 
              color={
                todo.status === TaskStatus.DONE ? 'green' :
                todo.status === TaskStatus.DOING ? 'blue' : 'gray'
              }
              size="md"
            >
              {todo.status === TaskStatus.DONE ? '已完成' :
               todo.status === TaskStatus.DOING ? '进行中' : '待办'}
            </Badge>
          )}
          
          {/* 优先级 */}
          {todo.type === ItemType.TASK && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getPriorityColor(todo.priority)}`}>
              <Flag className="h-4 w-4" />
              <span className="font-medium">{getPriorityLabel(todo.priority)}优先级</span>
            </div>
          )}
          
          {/* 截止日期 */}
          {todo.type === ItemType.TASK && todo.due_date && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
              isOverdue(todo.due_date) 
                ? 'text-red-700 bg-red-100 border-red-200' 
                : isDueSoon(todo.due_date)
                  ? 'text-yellow-700 bg-yellow-100 border-yellow-200'
                  : 'text-gray-700 bg-gray-100 border-gray-200'
            }`}>
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                截止 {new Date(todo.due_date).toLocaleDateString('zh-CN', { 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
        
        {/* 标签 */}
        {todo.tags && (
          <div className="flex items-start space-x-2">
            <Tag className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {todo.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="prose prose-gray max-w-none">
        {(todo.content || todo.description) ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-gray-700 leading-relaxed">
              {renderMarkdown(todo.content || todo.description || '')}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">暂无详细内容</p>
            <p className="text-sm">点击右上角"编辑"按钮添加内容</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryDetail;
