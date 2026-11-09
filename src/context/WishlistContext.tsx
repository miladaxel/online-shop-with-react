import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StorageManager } from '../data/storage';
import { useNotification } from './NotificationContext';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => StorageManager.getWishlist());
  const { showToast } = useNotification();

  const toggleWishlist = (productId: string) => {
    const added = StorageManager.toggleWishlist(productId);
    const updated = StorageManager.getWishlist();
    setWishlistIds([...updated]);

    if (added) {
      showToast('کالا به لیست علاقه‌مندی‌ها اضافه شد.', 'success');
    } else {
      showToast('کالا از لیست علاقه‌مندی‌ها حذف شد.', 'info');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
