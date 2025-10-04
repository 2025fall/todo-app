import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, FileText, BookOpen, CheckSquare } from 'lucide-react';
import { ItemType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewItem: (type: ItemType) => void;
  onSearch: (query: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewItem,
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    {
      id: 'new-task',
      title: '新建任务',
      description: '创建一个新的任务',
      icon: CheckSquare,
      action: () => onNewItem(ItemType.TASK),
      keywords: ['任务', 'task', '新建', 'new']
    },
    {
      id: 'new-note',
      title: '新建笔记',
      description: '创建一个新的笔记',
      icon: FileText,
      action: () => onNewItem(ItemType.NOTE),
      keywords: ['笔记', 'note', '新建', 'new']
    },
    {
      id: 'new-diary',
      title: '新建日记',
      description: '创建一个新的日记',
      icon: BookOpen,
      action: () => onNewItem(ItemType.DIARY),
      keywords: ['日记', 'diary', '新建', 'new']
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <Search className="h-4 w-4 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索命令或创建新内容..."
            className="flex-1 outline-none text-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
              onSearch(e.target.value);
            }}
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              没有找到匹配的命令
            </div>
          ) : (
            filteredCommands.map((command, index) => {
              const Icon = command.icon;
              return (
                <button
                  key={command.id}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    command.action();
                    onClose();
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    command.id.includes('task') ? 'bg-blue-100 text-blue-600' :
                    command.id.includes('note') ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{command.title}</div>
                    <div className="text-sm text-gray-500">{command.description}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
        
        <div className="px-4 py-2 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>使用 ↑↓ 选择，Enter 确认，Esc 关闭</span>
            <div className="flex space-x-4">
              <span>⌘N 新建</span>
              <span>⌘S 保存</span>
              <span>⌘K 命令面板</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
