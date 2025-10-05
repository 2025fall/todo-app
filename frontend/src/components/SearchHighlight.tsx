import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, searchQuery, className = '' }) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default SearchHighlight;
