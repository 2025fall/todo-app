import React, { useState, useEffect } from 'react';
import { X, Tag, Plus } from 'lucide-react';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onAddTag: (tag: string) => void;
  className?: string;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allTags,
  selectedTags,
  onTagsChange,
  onAddTag,
  className = ''
}) => {
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    if (trimmedTag && !allTags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setNewTag('');
      setShowAddTag(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowAddTag(false);
      setNewTag('');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
          <Tag className="h-4 w-4" />
          <span>标签筛选</span>
        </h3>
        <button
          onClick={() => setShowAddTag(!showAddTag)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="添加标签"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* 添加标签输入 */}
      {showAddTag && (
        <form onSubmit={handleAddTag} className="space-y-2">
          <input
            type="text"
            placeholder="输入新标签..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddTag(false);
                setNewTag('');
              }}
              className="px-3 py-1 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 标签列表 */}
      <div className="space-y-2">
        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>#{tag}</span>
                {selectedTags.includes(tag) && (
                  <X className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无标签</p>
            <p className="text-xs">点击上方 + 号添加标签</p>
          </div>
        )}
      </div>

      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">已选择 ({selectedTags.length})</span>
            <button
              onClick={() => onTagsChange([])}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              清除全部
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagFilter;
