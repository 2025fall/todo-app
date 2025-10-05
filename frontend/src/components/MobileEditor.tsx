import React, { useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { ItemType, TaskStatus, Priority } from '../types';

interface MobileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    due_date: string;
    tags: string;
    type: ItemType;
    content: string;
    images: string[];
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onPasteImages: (event: ClipboardEvent) => Promise<void> | void;
  onUploadImages: (files: FileList | null) => Promise<void> | void;
  onRemoveImage: (index: number) => void;
}

const MobileEditor: React.FC<MobileEditorProps> = ({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  onPasteImages,
  onUploadImages,
  onRemoveImage
}) => {
  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK: return '📋';
      case ItemType.NOTE: return '📝';
      case ItemType.DIARY: return '📖';
      default: return '📋';
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

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 抽屉内容 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">新建{getTypeLabel(formData.type)}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          <form
            onSubmit={onSubmit}
            className="space-y-4"
            onPaste={(e) => onPasteImages(e.nativeEvent)}
          >
            {/* 类型选择 */}
            <div className="flex space-x-2">
              {Object.values(ItemType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onFormDataChange({ ...formData, type })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.type === type
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{getTypeIcon(type)}</span>
                  <span>{getTypeLabel(type)}</span>
                </button>
              ))}
            </div>

            {/* 标题输入 */}
            <div>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-lg font-semibold text-gray-900 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                placeholder="输入标题..."
                value={formData.title}
                onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                autoFocus
              />
            </div>

            {/* 内容输入 */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <textarea
                className="w-full min-h-[200px] bg-transparent border-0 resize-none focus:outline-none text-gray-700 leading-relaxed text-base placeholder-gray-400"
                placeholder={formData.type === ItemType.TASK ? '详细描述任务内容...' : 
                           formData.type === ItemType.NOTE ? '记录你的想法和笔记...' : 
                           '记录今天的心情和经历...'}
                value={formData.content}
                onChange={(e) => onFormDataChange({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onUploadImages(e.target.files)}
                />
                <span>上传图片</span>
              </label>
              <span className="text-xs text-gray-400">支持粘贴图片，最多 5 张</span>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`已添加图片 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 只有任务类型才显示状态和优先级选择 */}
            {formData.type === ItemType.TASK && (
              <div className="flex space-x-3">
                <select
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={formData.status}
                  onChange={(e) => onFormDataChange({ ...formData, status: e.target.value as TaskStatus })}
                >
                  <option value={TaskStatus.TODO}>待办</option>
                  <option value={TaskStatus.DOING}>进行中</option>
                  <option value={TaskStatus.DONE}>已完成</option>
                </select>
                
                <select
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={formData.priority}
                  onChange={(e) => onFormDataChange({ ...formData, priority: e.target.value as Priority })}
                >
                  <option value={Priority.LOW}>低优先级</option>
                  <option value={Priority.MEDIUM}>中优先级</option>
                  <option value={Priority.HIGH}>高优先级</option>
                  <option value={Priority.URGENT}>紧急</option>
                </select>
              </div>
            )}
          </form>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
            >
              取消
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>创建</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileEditor;
