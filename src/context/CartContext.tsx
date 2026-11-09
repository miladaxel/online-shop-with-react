import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { StorageManager } from '../data/storage';
import { getDiscountedPrice } from '../utils/formatters';
import { useNotification } from './NotificationContext';

interface RawCartItem {
  id: string;
  variantId: string;
  productId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItemsCount: number;
  totalRawPrice: number;
  totalProductsDiscount: number;
  couponDiscount: number;
  shippingCost: number;
  finalPrice: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  addToCart: (variantId: string, productId: string, quantity?: number) => boolean;
  updateQuantity: (itemId: string, newQty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'dk_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rawItems, setRawItems] = useState<RawCartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const { showToast } = useNotification();

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(rawItems));
  }, [rawItems]);

  // Hydrate items with current product and variant data
  const items: CartItem[] = useMemo(() => {
    const products = StorageManager.getProducts();
    const result: CartItem[] = [];

    for (const raw of rawItems) {
      const product = products.find((p) => p.id === raw.productId);
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === raw.variantId);
      if (!variant) continue;

      result.push({
        id: raw.id,
        variantId: raw.variantId,
        productId: raw.productId,
        quantity: Math.min(raw.quantity, Math.max(1, variant.stock)),
        product,
        variant,
      });
    }

    return result;
  }, [rawItems]);

  // Totals
  const { totalRawPrice, totalProductsDiscount, totalItemsCount } = useMemo(() => {
    let raw = 0;
    let discount = 0;
    let count = 0;

    for (const item of items) {
      if (!item.variant) continue;
      const unitRaw = item.variant.price;
      const unitFinal = getDiscountedPrice(item.variant.price, item.variant.discountPercent);

      raw += unitRaw * item.quantity;
      discount += (unitRaw - unitFinal) * item.quantity;
      count += item.quantity;
    }

    return { totalRawPrice: raw, totalProductsDiscount: discount, totalItemsCount: count };
  }, [items]);

  const itemsFinalPrice = totalRawPrice - totalProductsDiscount;

  // Coupon discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'FIXED') {
      return appliedCoupon.discountValue;
    }
    const pctDiscount = Math.round((itemsFinalPrice * appliedCoupon.discountValue) / 100);
    if (appliedCoupon.maxDiscountAmount && pctDiscount > appliedCoupon.maxDiscountAmount) {
      return appliedCoupon.maxDiscountAmount;
    }
    return pctDiscount;
  }, [appliedCoupon, itemsFinalPrice]);

  // Shipping cost: Free for orders >= 500,000 Tomans, else 49,000 Tomans (if cart not empty)
  const shippingCost = useMemo(() => {
    if (items.length === 0) return 0;
    return itemsFinalPrice >= 500000 ? 0 : 49000;
  }, [items.length, itemsFinalPrice]);

  const finalPrice = Math.max(0, itemsFinalPrice - couponDiscount + shippingCost);

  const addToCart = (variantId: string, productId: string, quantity: number = 1): boolean => {
    const products = StorageManager.getProducts();
    const prod = products.find((p) => p.id === productId);
    const variant = prod?.variants.find((v) => v.id === variantId);

    if (!variant) {
      showToast('تنوع انتخابی یافت نشد.', 'error');
      return false;
    }

    if (variant.stock <= 0) {
      showToast('متاسفانه موجودی این تنوع در انبار به اتمام رسیده است.', 'warning');
      return false;
    }

    setRawItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === variantId);
      if (existingIndex !== -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty + quantity > variant.stock) {
          showToast(`تنها ${variant.stock} عدد از این کالا در انبار موجود است.`, 'warning');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + quantity,
        };
        showToast('تعداد کالا در سبد خرید به‌روزرسانی شد.', 'success');
        return updated;
      } else {
        const newItem: RawCartItem = {
          id: `item-${Date.now()}`,
          variantId,
          productId,
          quantity: Math.min(quantity, variant.stock),
        };
        showToast('کالا با موفقیت به سبد خرید افزوده شد.', 'success');
        return [...prev, newItem];
      }
    });

    return true;
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    setRawItems((prev) => {
      return prev.map((item) => {
        if (item.id === itemId) {
          // Check stock
          const prod = StorageManager.getProducts().find((p) => p.id === item.productId);
          const variant = prod?.variants.find((v) => v.id === item.variantId);
          if (variant && newQty > variant.stock) {
            showToast(`حداکثر موجودی قابل سفارش ${variant.stock} عدد است.`, 'warning');
            return { ...item, quantity: variant.stock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (itemId: string) => {
    setRawItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('کالا از سبد خرید حذف شد.', 'info');
  };

  const clearCart = () => {
    setRawItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const applyCoupon = (code: string): boolean => {
    if (!code.trim()) {
      setCouponError('لطفاً کد تخفیف را وارد کنید.');
      return false;
    }

    const result = StorageManager.validateCoupon(code, itemsFinalPrice);
    if (!result.valid) {
      setCouponError(result.message);
      showToast(result.message, 'error');
      return false;
    }

    setAppliedCoupon(result.coupon || null);
    setCouponError(null);
    showToast(`کد تخفیف ${code.toUpperCase()} با موفقیت اعمال شد.`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    showToast('کد تخفیف حذف شد.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        totalRawPrice,
        totalProductsDiscount,
        couponDiscount,
        shippingCost,
        finalPrice,
        appliedCoupon,
        couponError,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
