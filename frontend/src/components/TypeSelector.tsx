import React from 'react';
import { CheckSquare, FileText, BookOpen } from 'lucide-react';
import { ItemType } from '../types';

interface TypeSelectorProps {
  selectedType: ItemType;
  onTypeChange: (type: ItemType) => void;
  className?: string;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ selectedType, onTypeChange, className = '' }) => {
  const types = [
    { type: ItemType.TASK, label: '任务', icon: CheckSquare, color: 'blue' },
    { type: ItemType.NOTE, label: '笔记', icon: FileText, color: 'green' },
    { type: ItemType.DIARY, label: '日记', icon: BookOpen, color: 'purple' },
  ];

  return (
    <div className={`flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
      {types.map(({ type, label, icon: Icon, color }) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedType === type
              ? `bg-white dark:bg-gray-700 text-${color}-600 dark:text-${color}-400 shadow-sm`
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default TypeSelector;