import React from 'react';

interface SkeletonLoaderProps {
  type?: 'list' | 'detail' | 'form';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'list', 
  count = 1 
}) => {
  if (type === 'list') {
    return (
      <div className="px-2 py-2 space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="mx-2 p-3 rounded-xl bg-white border border-gray-100">
            <div className="flex items-start space-x-3">
              {/* 图标骨架 */}
              <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse"></div>
              
              {/* 内容骨架 */}
              <div className="flex-1 space-y-2">
                {/* 标题行 */}
                <div className="flex items-start justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                
                {/* 徽章行 */}
                <div className="flex items-center space-x-2">
                  <div className="h-5 bg-gray-200 rounded-full animate-pulse w-12"></div>
                  <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                
                {/* 预览行 */}
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="p-6 space-y-4">
        {/* 标题骨架 */}
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
        
        {/* 徽章行骨架 */}
        <div className="flex items-center space-x-2">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-12"></div>
        </div>
        
        {/* 内容骨架 */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="p-4 space-y-4">
        {/* 类型选择骨架 */}
        <div className="flex space-x-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-8 bg-gray-200 rounded-lg animate-pulse w-20"></div>
          ))}
        </div>
        
        {/* 标题输入骨架 */}
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        
        {/* 内容输入骨架 */}
        <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
        
        {/* 按钮骨架 */}
        <div className="flex justify-end space-x-2">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-16"></div>
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-20"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
