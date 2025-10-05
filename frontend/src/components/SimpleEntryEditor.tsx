import React, { useState, useEffect, useRef } from 'react';
import { Todo, TodoCreate, TodoUpdate, TaskStatus, Priority, ItemType } from '../types';
import { CheckSquare, FileText, BookOpen, X } from 'lucide-react';

interface SimpleEntryEditorProps {
  todo?: Todo;
  onSave: (data: TodoCreate | TodoUpdate) => Promise<void>;
  onCancel: () => void;
  className?: string;
  images: string[];
  onUploadImages: (files: FileList | null) => Promise<void> | void;
  onPasteImages: (event: ClipboardEvent) => Promise<void> | void;
  onRemoveImage: (index: number) => void;
}

const SimpleEntryEditor: React.FC<SimpleEntryEditorProps> = ({
  todo,
  onSave,
  onCancel,
  className = '',
  images,
  onUploadImages,
  onPasteImages,
  onRemoveImage,
}) => {
  const [formData, setFormData] = useState({
    type: ItemType.TASK,
    title: '',
    content: '',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
  });

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (todo) {
      setFormData({
        type: todo.type || ItemType.TASK,
        title: todo.title,
        content: todo.content || todo.description || '',
        status: todo.status || TaskStatus.TODO,
        priority: todo.priority || Priority.MEDIUM,
      });
    }
  }, [todo]);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const submitData = {
      title: formData.title.trim(),
      content: formData.content.trim() || undefined,
      description: formData.content.trim() || undefined,
      type: formData.type,
      status: formData.type === ItemType.TASK ? formData.status : undefined,
      priority: formData.type === ItemType.TASK ? formData.priority : undefined,
      attachments: images,
    };

    await onSave(submitData as any);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const types = [
    { type: ItemType.TASK, label: '任务', icon: CheckSquare },
    { type: ItemType.NOTE, label: '笔记', icon: FileText },
    { type: ItemType.DIARY, label: '日记', icon: BookOpen },
  ];

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* 类型选择器 */}
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {types.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type }))}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              formData.type === type
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 标题输入 */}
      <input
        ref={titleInputRef}
        type="text"
        required
        placeholder="输入标题..."
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 text-2xl font-semibold border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />

      {/* 状态和优先级（仅任务） */}
      {formData.type === ItemType.TASK && (
        <div className="flex items-center space-x-3">
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value={TaskStatus.TODO}>待办</option>
            <option value={TaskStatus.DOING}>进行中</option>
            <option value={TaskStatus.DONE}>已完成</option>
          </select>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value={Priority.LOW}>低优先级</option>
            <option value={Priority.MEDIUM}>中优先级</option>
            <option value={Priority.HIGH}>高优先级</option>
            <option value={Priority.URGENT}>紧急</option>
          </select>
        </div>
      )}

      {/* 正文输入 */}
      <div
        className="space-y-3"
        onPaste={(e) => {
          onPasteImages(e.nativeEvent);
        }}
      >
        <textarea
          placeholder="输入内容..."
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          onKeyDown={handleKeyDown}
          rows={12}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onUploadImages(e.target.files)}
              className="hidden"
            />
            <span>上传图片</span>
          </label>
          <span className="text-xs text-gray-400">支持直接粘贴图片，最多 5 张</span>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`已添加图片 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="删除图片"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          保存
        </button>
      </div>
    </form>
  );
};

export default SimpleEntryEditor;
