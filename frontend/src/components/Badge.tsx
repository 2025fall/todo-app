import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'soft' | 'solid' | 'outline';
  color?: 'blue' | 'green' | 'purple' | 'red' | 'gray' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'soft',
  color = 'gray',
  size = 'sm',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const colorClasses = {
    blue: {
      soft: 'bg-blue-100 text-blue-700',
      solid: 'bg-blue-600 text-white',
      outline: 'border border-blue-200 text-blue-700 bg-transparent'
    },
    green: {
      soft: 'bg-green-100 text-green-700',
      solid: 'bg-green-600 text-white',
      outline: 'border border-green-200 text-green-700 bg-transparent'
    },
    purple: {
      soft: 'bg-purple-100 text-purple-700',
      solid: 'bg-purple-600 text-white',
      outline: 'border border-purple-200 text-purple-700 bg-transparent'
    },
    red: {
      soft: 'bg-red-100 text-red-700',
      solid: 'bg-red-600 text-white',
      outline: 'border border-red-200 text-red-700 bg-transparent'
    },
    gray: {
      soft: 'bg-gray-100 text-gray-700',
      solid: 'bg-gray-600 text-white',
      outline: 'border border-gray-200 text-gray-700 bg-transparent'
    },
    yellow: {
      soft: 'bg-yellow-100 text-yellow-700',
      solid: 'bg-yellow-600 text-white',
      outline: 'border border-yellow-200 text-yellow-700 bg-transparent'
    }
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    colorClasses[color][variant],
    className
  ].join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;
