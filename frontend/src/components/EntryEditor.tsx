import React, { useState, useEffect, useRef } from 'react';
import { Todo, TodoCreate, TodoUpdate, TaskStatus, Priority, ItemType } from '../types';
import { Save, RotateCcw, Bold, List, Quote, Code, CheckSquare } from 'lucide-react';
import TypeSelector from './TypeSelector';

interface EntryEditorProps {
  todo?: Todo;
  onSave: (data: TodoCreate | TodoUpdate) => void;
  onCancel: () => void;
  className?: string;
}

const EntryEditor: React.FC<EntryEditorProps> = ({
  todo,
  onSave,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    due_date: '',
    tags: '',
    type: ItemType.TASK,
    content: '',
    subtasks: [] as string[],
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化表单数据
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description || '',
        status: todo.status,
        priority: todo.priority,
        due_date: todo.due_date ? todo.due_date.split('T')[0] : '',
        tags: todo.tags || '',
        type: todo.type || ItemType.TASK,
        content: todo.content || '',
        subtasks: [],
      });
    } else {
      // 新建时根据类型设置默认标题
      const today = new Date();
      const defaultTitle = formData.type === ItemType.DIARY 
        ? `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')} 日记`
        : '';
      
      setFormData(prev => ({
        ...prev,
        title: defaultTitle,
      }));
    }
  }, [todo, formData.type]);

  // 自动聚焦
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // 自动保存
  useEffect(() => {
    if (formData.title.trim()) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 800);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData]);

  const handleAutoSave = async () => {
    if (todo && formData.title.trim()) {
      try {
        const submitData: TodoUpdate = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
          tags: formData.tags.trim() || undefined,
          type: formData.type,
          content: formData.content.trim() || undefined,
        };

        onSave(submitData);
        setAutoSaveStatus(`已自动保存 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
        
        setTimeout(() => setAutoSaveStatus(''), 3000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('自动保存失败');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const submitData = todo ? {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      tags: formData.tags.trim() || undefined,
      type: formData.type,
      content: formData.content.trim() || undefined,
    } as TodoUpdate : {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      tags: formData.tags.trim() || undefined,
      type: formData.type,
      content: formData.content.trim() || undefined,
    } as TodoCreate;

    onSave(submitData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const addSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, '']
    }));
  };

  const updateSubtask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((task, i) => i === index ? value : task)
    }));
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || '粗体文字'}**`;
        break;
      case 'list':
        newText = `- ${selectedText || '列表项'}`;
        break;
      case 'quote':
        newText = `> ${selectedText || '引用文字'}`;
        break;
      case 'code':
        newText = `\`${selectedText || '代码'}\``;
        break;
      case 'task':
        newText = `- [ ] ${selectedText || '任务项'}`;
        break;
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // 恢复焦点
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 类型选择器 */}
        <div className="flex items-center justify-between">
          <TypeSelector
            selectedType={formData.type}
            onTypeChange={(type) => setFormData(prev => ({ ...prev, type }))}
          />
          {autoSaveStatus && (
            <span className="text-xs text-green-600 dark:text-green-400">{autoSaveStatus}</span>
          )}
        </div>

        {/* 标题输入 */}
        <div>
          <input
            ref={titleInputRef}
            type="text"
            required
            className="w-full px-4 py-3 text-2xl font-semibold text-gray-900 dark:text-gray-100 border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
            placeholder="输入标题..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* 富文本编辑区 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/20 transition-all duration-200">
          {/* Markdown 工具条（仅笔记类型） */}
          {formData.type === ItemType.NOTE && (
            <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => insertMarkdown('bold')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="加粗"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('list')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="列表"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('quote')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="引用"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('code')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="代码"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('task')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="任务清单"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <textarea
            ref={contentTextareaRef}
            className="w-full min-h-[400px] bg-transparent border-0 resize-none focus:outline-none text-gray-700 dark:text-gray-300 leading-relaxed text-base placeholder-gray-400 dark:placeholder-gray-500"
            placeholder={
              formData.type === ItemType.TASK ? '详细描述任务内容...' : 
              formData.type === ItemType.NOTE ? '记录你的想法和笔记...' : 
              '记录今天的心情和经历...'
            }
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* 任务相关设置 */}
        {formData.type === ItemType.TASK && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">状态</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
              >
                <option value={TaskStatus.TODO}>待办</option>
                <option value={TaskStatus.DOING}>进行中</option>
                <option value={TaskStatus.DONE}>已完成</option>
              </select>
            </div>
            
            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">优先级</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
              >
                <option value={Priority.LOW}>低优先级</option>
                <option value={Priority.MEDIUM}>中优先级</option>
                <option value={Priority.HIGH}>高优先级</option>
                <option value={Priority.URGENT}>紧急</option>
              </select>
            </div>
            
            {/* 截止日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">截止日期</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* 子任务（仅任务类型） */}
        {formData.type === ItemType.TASK && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">子任务</label>
              <button
                type="button"
                onClick={addSubtask}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                + 添加子任务
              </button>
            </div>
            <div className="space-y-2">
              {formData.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="输入子任务..."
                    value={subtask}
                    onChange={(e) => updateSubtask(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 日期选择（仅日记类型） */}
        {formData.type === ItemType.DIARY && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">日期</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={formData.due_date || new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
        )}

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="输入标签，用逗号分隔..."
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">例如：工作, 重要, 项目</p>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {todo ? '编辑模式' : '创建新条目'}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <Save className="h-4 w-4" />
              <span>{todo ? '保存' : '创建'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EntryEditor;