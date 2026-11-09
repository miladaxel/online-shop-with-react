import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StorageManager } from '../data/storage';
import { useNotification } from './NotificationContext';

interface CompareContextType {
  compareIds: string[];
  isInCompare: (productId: string) => boolean;
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareIds, setCompareIds] = useState<string[]>(() => StorageManager.getCompareList());
  const { showToast } = useNotification();

  const addToCompare = (productId: string): boolean => {
    if (compareIds.includes(productId)) {
      showToast('این کالا قبلاً به لیست مقایسه اضافه شده است.', 'info');
      return false;
    }
    if (compareIds.length >= 4) {
      showToast('حداکثر می‌توانید ۴ کالا را همزمان مقایسه نمایید.', 'warning');
      return false;
    }

    StorageManager.addToCompare(productId);
    const updated = StorageManager.getCompareList();
    setCompareIds([...updated]);
    showToast('کالا به لیست مقایسه اضافه شد.', 'success');
    return true;
  };

  const removeFromCompare = (productId: string) => {
    StorageManager.removeFromCompare(productId);
    const updated = StorageManager.getCompareList();
    setCompareIds([...updated]);
    showToast('کالا از لیست مقایسه حذف شد.', 'info');
  };

  const clearCompare = () => {
    StorageManager.clearCompare();
    setCompareIds([]);
    showToast('لیست مقایسه خالی شد.', 'info');
  };

  const isInCompare = (productId: string) => {
    return compareIds.includes(productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        isInCompare,
        addToCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
