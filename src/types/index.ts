export interface User {
  id: string;
  phoneNumber: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isSeller: boolean;
  isStaff: boolean;
  avatar?: string;
}

export interface Address {
  id: string;
  recipientName: string;
  recipientPhone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  buildingNumber?: string;
  unit?: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  parentId?: string | null;
  icon?: string;
  displayOrder: number;
}

export interface Brand {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  description: string;
  logo?: string;
}

export interface Seller {
  id: string;
  slug: string;
  storeName: string;
  rating: number;
  isOfficial: boolean;
  phone?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  productId: string;
  sellerId: string;
  seller?: Seller;
  colorName: string;
  colorHex: string;
  warranty: string;
  price: number; // in Tomans
  discountPercent: number;
  stock: number;
  isSpecialOffer: boolean;
}

export interface SpecificationAttribute {
  name: string;
  value: string;
}

export interface SpecificationGroup {
  groupTitle: string;
  attributes: SpecificationAttribute[];
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userPhone: string;
  title: string;
  rating: number;
  comment: string;
  positivePoints: string[];
  negativePoints: string[];
  isBuyer: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  categoryId: string;
  category?: Category;
  brandId: string;
  brand?: Brand;
  shortDescription: string;
  description: string;
  isOriginal: boolean;
  rating: number;
  reviewCount: number;
  mainImage: string;
  images: string[];
  variants: ProductVariant[];
  specs: SpecificationGroup[];
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  quantity: number;
  // Hydrated references
  variant?: ProductVariant;
  product?: Product;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PROCESSING' | 'PACKAGING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  variantId: string;
  productSlug: string;
  productTitle: string;
  sellerName: string;
  colorName: string;
  colorHex: string;
  warranty: string;
  unitRawPrice: number;
  unitFinalPrice: number;
  quantity: number;
  totalPrice: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userPhone: string;
  status: OrderStatus;
  shippingMethod: 'EXPRESS' | 'REGULAR';
  shippingCost: number;
  totalRawPrice: number;
  totalProductsDiscount: number;
  couponDiscount: number;
  couponCode?: string;
  finalPrice: number;
  postalTrackingCode: string;
  paidAt?: string;
  createdAt: string;
  addressSnapshot: {
    recipientName: string;
    recipientPhone: string;
    province: string;
    city: string;
    postalCode: string;
    addressLine: string;
    buildingNumber?: string;
    unit?: string;
  };
  items: OrderItem[];
  refId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'FIXED' | 'PERCENT';
  discountValue: number; // Toman for FIXED, percentage (0-100) for PERCENT
  maxDiscountAmount?: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  validUntil?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productTitle: string;
  phone: string;
  createdAt: string;
}
