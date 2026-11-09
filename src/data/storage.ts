import {
  initialCategories,
  initialBrands,
  initialSellers,
  initialProducts,
  initialReviews,
  initialCoupons,
  initialOrders,
  initialAddresses,
  initialStockAlerts,
  demoUserCustomer,
  demoUserAdmin,
} from './mockData';
import {
  Category,
  Brand,
  Seller,
  Product,
  ProductReview,
  Coupon,
  Order,
  Address,
  StockAlert,
  User,
  ProductVariant,
} from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'dk_categories',
  BRANDS: 'dk_brands',
  SELLERS: 'dk_sellers',
  PRODUCTS: 'dk_products',
  REVIEWS: 'dk_reviews',
  COUPONS: 'dk_coupons',
  ORDERS: 'dk_orders',
  ADDRESSES: 'dk_addresses',
  STOCK_ALERTS: 'dk_stock_alerts',
  CURRENT_USER: 'dk_current_user',
  WISHLIST: 'dk_wishlist',
  COMPARE: 'dk_compare',
  CART: 'dk_cart',
};

// Generic read with fallback
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

// Generic write
function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage for key: ${key}`, err);
  }
}

// Storage Manager
export const StorageManager = {
  // Initialization & Reset
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.resetAllData();
    }
  },

  resetAllData() {
    setStored(STORAGE_KEYS.CATEGORIES, initialCategories);
    setStored(STORAGE_KEYS.BRANDS, initialBrands);
    setStored(STORAGE_KEYS.SELLERS, initialSellers);
    setStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    setStored(STORAGE_KEYS.REVIEWS, initialReviews);
    setStored(STORAGE_KEYS.COUPONS, initialCoupons);
    setStored(STORAGE_KEYS.ORDERS, initialOrders);
    setStored(STORAGE_KEYS.ADDRESSES, initialAddresses);
    setStored(STORAGE_KEYS.STOCK_ALERTS, initialStockAlerts);
    setStored(STORAGE_KEYS.CURRENT_USER, demoUserCustomer);
    setStored(STORAGE_KEYS.WISHLIST, ['prod-ip15pm', 'prod-sony-xm5']);
    setStored(STORAGE_KEYS.COMPARE, ['prod-s24u', 'prod-ip15pm']);
    setStored(STORAGE_KEYS.CART, []);
  },

  // Categories & Brands & Sellers
  getCategories(): Category[] {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  getBrands(): Brand[] {
    return getStored<Brand[]>(STORAGE_KEYS.BRANDS, initialBrands);
  },

  getSellers(): Seller[] {
    return getStored<Seller[]>(STORAGE_KEYS.SELLERS, initialSellers);
  },

  // Products
  getProducts(): Product[] {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const sellers = this.getSellers();
    const categories = this.getCategories();
    const brands = this.getBrands();

    // Hydrate references
    return products.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId),
      brand: brands.find((b) => b.id === p.brandId),
      variants: p.variants.map((v) => ({
        ...v,
        seller: sellers.find((s) => s.id === v.sellerId),
      })),
    }));
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  saveProducts(products: Product[]) {
    setStored(STORAGE_KEYS.PRODUCTS, products);
  },

  // Update a single variant (e.g. from Seller Center inventory)
  updateVariant(
    variantId: string,
    updates: Partial<Pick<ProductVariant, 'price' | 'discountPercent' | 'stock' | 'isSpecialOffer'>>
  ): boolean {
    const products = this.getProducts();
    let updated = false;

    for (const p of products) {
      const vIndex = p.variants.findIndex((v) => v.id === variantId);
      if (vIndex !== -1) {
        p.variants[vIndex] = {
          ...p.variants[vIndex],
          ...updates,
        };
        updated = true;
        break;
      }
    }

    if (updated) {
      this.saveProducts(products);
    }
    return updated;
  },

  // Create a new variant for an existing product (Seller Center)
  addVariantToProduct(productId: string, variant: Omit<ProductVariant, 'id'>): ProductVariant {
    const products = this.getProducts();
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) throw new Error('Product not found');

    const newVariant: ProductVariant = {
      ...variant,
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    targetProduct.variants.push(newVariant);
    this.saveProducts(products);
    return newVariant;
  },

  // Stock deduction atomic-like helper
  deductStock(variantId: string, quantity: number): boolean {
    const products = this.getProducts();
    for (const p of products) {
      const v = p.variants.find((item) => item.id === variantId);
      if (v) {
        if (v.stock < quantity) return false;
        v.stock -= quantity;
        this.saveProducts(products);
        return true;
      }
    }
    return false;
  },

  // Reviews
  getReviews(productId?: string): ProductReview[] {
    const all = getStored<ProductReview[]>(STORAGE_KEYS.REVIEWS, initialReviews);
    if (productId) {
      return all.filter((r) => r.productId === productId);
    }
    return all;
  },

  addReview(review: Omit<ProductReview, 'id' | 'createdAt'>): ProductReview {
    const all = this.getReviews();
    const newRev: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newRev);
    setStored(STORAGE_KEYS.REVIEWS, all);

    // Update product review count and average rating
    const products = this.getProducts();
    const prod = products.find((p) => p.id === review.productId);
    if (prod) {
      const prodReviews = all.filter((r) => r.productId === review.productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      prod.reviewCount = prodReviews.length;
      prod.rating = parseFloat(avg.toFixed(1));
      this.saveProducts(products);
    }

    return newRev;
  },

  // Coupons
  getCoupons(): Coupon[] {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
  },

  validateCoupon(code: string, orderAmount: number): { valid: boolean; coupon?: Coupon; discount: number; message: string } {
    const coupons = this.getCoupons();
    const target = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!target) {
      return { valid: false, discount: 0, message: 'کد تخفیف وارد شده معتبر نمی‌باشد.' };
    }
    if (!target.isActive) {
      return { valid: false, discount: 0, message: 'این کد تخفیف منقضی یا غیرفعال شده است.' };
    }
    if (target.usageLimit && target.usedCount >= target.usageLimit) {
      return { valid: false, discount: 0, message: 'سقف استفاده از این کد تخفیف به پایان رسیده است.' };
    }
    if (orderAmount < target.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `حداقل مبلغ سفارش برای استفاده از این کد تخفیف ${(target.minOrderAmount).toLocaleString('fa-IR')} تومان است.`,
      };
    }

    let discount = 0;
    if (target.discountType === 'FIXED') {
      discount = target.discountValue;
    } else {
      discount = Math.round((orderAmount * target.discountValue) / 100);
      if (target.maxDiscountAmount && discount > target.maxDiscountAmount) {
        discount = target.maxDiscountAmount;
      }
    }

    return {
      valid: true,
      coupon: target,
      discount,
      message: 'کد تخفیف با موفقیت اعمال شد.',
    };
  },

  useCoupon(code: string) {
    const coupons = this.getCoupons();
    const target = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (target) {
      target.usedCount += 1;
      setStored(STORAGE_KEYS.COUPONS, coupons);
    }
  },

  // Orders
  getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
  },

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.getOrders().find(
      (o) => o.orderNumber.toUpperCase().trim() === orderNumber.toUpperCase().trim()
    );
  },

  addOrder(order: Order): Order {
    const orders = this.getOrders();
    orders.unshift(order);
    setStored(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  // Advance Order status for testing tracking timeline
  advanceOrderStatus(orderNumber: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return undefined;

    const stages: Order['status'][] = ['PENDING_PAYMENT', 'PROCESSING', 'PACKAGING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = stages.indexOf(order.status);
    if (currentIdx < stages.length - 1) {
      order.status = stages[currentIdx + 1];
      setStored(STORAGE_KEYS.ORDERS, orders);
    }
    return order;
  },

  // Addresses
  getAddresses(): Address[] {
    return getStored<Address[]>(STORAGE_KEYS.ADDRESSES, initialAddresses);
  },

  addAddress(address: Omit<Address, 'id'>): Address {
    const list = this.getAddresses();
    if (address.isDefault) {
      list.forEach((a) => (a.isDefault = false));
    }
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    list.unshift(newAddr);
    setStored(STORAGE_KEYS.ADDRESSES, list);
    return newAddr;
  },

  setDefaultAddress(addressId: string) {
    const list = this.getAddresses();
    list.forEach((a) => {
      a.isDefault = a.id === addressId;
    });
    setStored(STORAGE_KEYS.ADDRESSES, list);
  },

  // Stock Alerts
  getStockAlerts(): StockAlert[] {
    return getStored<StockAlert[]>(STORAGE_KEYS.STOCK_ALERTS, initialStockAlerts);
  },

  addStockAlert(productId: string, productTitle: string, phone: string): StockAlert {
    const list = this.getStockAlerts();
    const existing = list.find((a) => a.productId === productId && a.phone === phone);
    if (existing) return existing;

    const newAlert: StockAlert = {
      id: `alert-${Date.now()}`,
      productId,
      productTitle,
      phone,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newAlert);
    setStored(STORAGE_KEYS.STOCK_ALERTS, list);
    return newAlert;
  },

  // Current User
  getCurrentUser(): User | null {
    return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, demoUserCustomer);
  },

  setCurrentUser(user: User | null) {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Wishlist
  getWishlist(): string[] {
    return getStored<string[]>(STORAGE_KEYS.WISHLIST, ['prod-ip15pm', 'prod-sony-xm5']);
  },

  toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const idx = list.indexOf(productId);
    let added = false;
    if (idx !== -1) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
      added = true;
    }
    setStored(STORAGE_KEYS.WISHLIST, list);
    return added;
  },

  // Comparison
  getCompareList(): string[] {
    return getStored<string[]>(STORAGE_KEYS.COMPARE, ['prod-s24u', 'prod-ip15pm']);
  },

  addToCompare(productId: string): boolean {
    const list = this.getCompareList();
    if (list.includes(productId)) return false;
    if (list.length >= 4) {
      list.shift(); // keep max 4
    }
    list.push(productId);
    setStored(STORAGE_KEYS.COMPARE, list);
    return true;
  },

  removeFromCompare(productId: string) {
    const list = this.getCompareList().filter((id) => id !== productId);
    setStored(STORAGE_KEYS.COMPARE, list);
  },

  clearCompare() {
    setStored(STORAGE_KEYS.COMPARE, []);
  },

  // Demo User Helpers
  switchUser(role: 'customer' | 'admin' | 'guest') {
    if (role === 'customer') {
      this.setCurrentUser(demoUserCustomer);
    } else if (role === 'admin') {
      this.setCurrentUser(demoUserAdmin);
    } else {
      this.setCurrentUser(null);
    }
  },
};

// Auto initialize on first module load
StorageManager.init();
