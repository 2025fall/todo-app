import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, CheckSquare, BookOpen } from 'lucide-react';
import { Todo, ItemType, TaskStatus } from '../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectItem: (item: Todo) => void;
  searchResults: Todo[];
  isSearching: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSelectItem,
  searchResults,
  isSearching,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK: return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case ItemType.NOTE: return <FileText className="h-4 w-4 text-green-500" />;
      case ItemType.DIARY: return <BookOpen className="h-4 w-4 text-purple-500" />;
      default: return <CheckSquare className="h-4 w-4 text-blue-500" />;
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
    setShowResults(value.length > 0);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          handleSelectItem(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setQuery('');
        onSearch('');
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectItem = (item: Todo) => {
    onSelectItem(item);
    setShowResults(false);
    setQuery('');
    onSearch('');
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowResults(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={resultsRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索任务、笔记、日记..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder-gray-400"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(query.length > 0)}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 搜索结果下拉 */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-500 mx-auto mb-2"></div>
              搜索中...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    index === highlightedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        item.type === ItemType.TASK ? 'bg-blue-100' :
                        item.type === ItemType.NOTE ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {getTypeIcon(item.type || ItemType.TASK)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {highlightText(item.title, query)}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(item.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {getTypeLabel(item.type || ItemType.TASK)}
                        </span>
                        {item.type === ItemType.TASK && item.status && (
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === TaskStatus.DONE ? 'bg-green-500' :
                            item.status === TaskStatus.DOING ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {highlightText(item.content || item.description || '暂无内容', query)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>未找到相关结果</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
