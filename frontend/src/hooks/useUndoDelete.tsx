import { useState, useCallback } from 'react';

interface DeletedItem {
  id: number;
  data: any;
  timestamp: number;
}

export const useUndoDelete = () => {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);

  const addDeletedItem = useCallback((id: number, data: any) => {
    const deletedItem: DeletedItem = {
      id,
      data,
      timestamp: Date.now()
    };
    
    setDeletedItems(prev => [deletedItem, ...prev.slice(0, 4)]); // 最多保存5个
    
    // 5秒后自动移除
    setTimeout(() => {
      setDeletedItems(prev => prev.filter(item => item.id !== id));
    }, 5000);
  }, []);

  const undoDelete = useCallback((id: number) => {
    setDeletedItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const removeDeletedItem = useCallback((id: number) => {
    setDeletedItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const getDeletedItem = useCallback((id: number) => {
    return deletedItems.find(item => item.id === id);
  }, [deletedItems]);

  return {
    deletedItems,
    addDeletedItem,
    undoDelete,
    removeDeletedItem,
    getDeletedItem
  };
};
