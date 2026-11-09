import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Scale,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  Store,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  BellRing,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronLeft,
} from 'lucide-react';
import { StorageManager } from '../data/storage';
import { Product, ProductVariant, ProductReview } from '../types';
import { formatToman, toPersianDigits, getDiscountedPrice, formatPersianDate } from '../utils/formatters';
import { useCart } from '../../src/context/CartContext';
import { useWishlist } from '../../src/context/WishlistContext';
import { useCompare } from '../../src/context/CompareContext';
import { useNotification } from '../../src/context/NotificationContext';
import { StockAlertModal } from '../components/product/StockAlertModal';
import { ReviewModal } from '../components/product/ReviewModal';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { showToast } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');

  const [isStockAlertOpen, setIsStockAlertOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const p = StorageManager.getProductBySlug(slug);
    if (p) {
      setProduct(p);
      setActiveImage(p.mainImage);
      // Pick variant with stock first, or first variant
      const defaultVar = p.variants.find((v) => v.stock > 0) || p.variants[0];
      setSelectedVariant(defaultVar || null);
      setReviews(StorageManager.getReviews(p.id));
      setQuantity(1);
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-black text-dk-dark mb-2">محصول مورد نظر یافت نشد</h2>
        <p className="text-xs text-gray-500 mb-6">ممکن است کالا حذف شده یا نشانی اشتباه باشد.</p>
        <Link to="/catalog" className="px-6 py-2.5 bg-dk-red text-white text-xs font-bold rounded-xl">
          بازگشت به کاتالوگ محصولات
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const isComparing = isInCompare(product.id);
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const rawPrice = selectedVariant?.price || 0;
  const discountPercent = selectedVariant?.discountPercent || 0;
  const finalUnitPrice = getDiscountedPrice(rawPrice, discountPercent);

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart(selectedVariant.id, product.id, quantity);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('پیوند کالا در حافظه موقت (Clipboard) کپی شد.', 'info');
    }
  };

  const refreshReviews = () => {
    setReviews(StorageManager.getReviews(product.id));
    const updatedProd = StorageManager.getProductById(product.id);
    if (updatedProd) setProduct(updatedProd);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link to="/" className="hover:text-dk-red transition-colors">دیجی‌کالا</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-dk-red transition-colors">کالای دیجیتال</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/catalog?category=${product.category.slug}`} className="hover:text-dk-red transition-colors">
              {product.category.titleFa}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-800 font-bold line-clamp-1">{product.titleFa}</span>
      </nav>

      {/* Main Product Card Grid */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-dk-border shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Column 1: Image Gallery (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Quick Action Badges */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isFavorite
                      ? 'bg-red-50 border-red-200 text-dk-red'
                      : 'bg-white border-gray-200 text-gray-500 hover:text-dk-red'
                  }`}
                  title="افزودن به علاقه‌مندی‌ها"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-dk-red' : ''}`} />
                </button>
                <button
                  onClick={() => addToCompare(product.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isComparing
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600'
                  }`}
                  title="مقایسه این کالا"
                >
                  <Scale className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-dk-dark transition-colors"
                  title="اشتراک‌گذاری"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {product.isOriginal && (
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                  ضمانت ۱۰۰٪ اصالت
                </span>
              )}
            </div>

            {/* Main Image */}
            <div className="w-full h-80 flex items-center justify-center p-4 bg-gray-50 rounded-2xl overflow-hidden mb-4 border border-gray-100">
              <img
                src={activeImage}
                alt={product.titleFa}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden p-1 transition-all ${
                    activeImage === img ? 'border-dk-red scale-105' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Center Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <span>برند: </span>
                <Link to={`/catalog?brand=${product.brand?.slug}`} className="text-dk-red font-bold hover:underline">
                  {product.brand?.nameFa} ({product.brand?.nameEn})
                </Link>
                <span>•</span>
                <span>دسته: {product.category?.titleFa}</span>
              </div>
              <h1 className="text-base md:text-lg font-black text-dk-dark leading-relaxed">
                {product.titleFa}
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-1">{product.titleEn}</p>
            </div>

            {/* Rating and Reviews Counter */}
            <div className="flex items-center gap-4 text-xs pb-4 border-b border-gray-100">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{toPersianDigits(product.rating)}</span>
                <span className="text-gray-400 font-normal">از ۵</span>
              </div>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-gray-500 hover:text-dk-red transition-colors"
              >
                {toPersianDigits(product.reviewCount)} دیدگاه کاربران
              </button>
            </div>

            {/* Color Swatch Picker */}
            {product.variants.length > 0 && (
              <div>
                <span className="block text-xs font-bold text-gray-700 mb-2">
                  رنگ انتخابی: <span className="text-dk-dark">{selectedVariant?.colorName}</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-dk-red bg-red-50/50 text-dk-red font-bold shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: v.colorHex }}
                          className="w-4 h-4 rounded-full border border-gray-300 inline-block shadow-2xs"
                        />
                        <span>{v.colorName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multi-Seller Switcher for this product */}
            <div>
              <span className="block text-xs font-bold text-gray-700 mb-2">
                سایر فروشندگان این کالا:
              </span>
              <div className="space-y-2">
                {product.variants.map((v) => {
                  const isCurrent = selectedVariant?.id === v.id;
                  const vPrice = getDiscountedPrice(v.price, v.discountPercent);

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-dk-red bg-red-50/40 ring-1 ring-red-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Store className={`w-4 h-4 ${isCurrent ? 'text-dk-red' : 'text-gray-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-dk-dark">
                            {v.seller?.storeName || 'دیجی‌کالا'}
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span>{v.warranty}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">
                              {toPersianDigits(v.seller?.rating || 4.8)} ★ رضایت خریداران
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-xs font-bold text-dk-dark">{formatToman(vPrice)}</div>
                        <span className={`text-[10px] font-bold ${v.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {v.stock > 0 ? `موجود در انبار (${toPersianDigits(v.stock)} عدد)` : 'ناموجود'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 mb-2">ویژگی‌های برجسته محصول:</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{product.shortDescription}</p>
            </div>
          </div>

          {/* Column 3: Sticky Buy Box (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200 sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-dk-dark pb-3 border-b border-gray-200">
                <Store className="w-4 h-4 text-dk-red" />
                <span>فروشنده: {selectedVariant?.seller?.storeName || 'دیجی‌کالا'}</span>
              </div>

              {/* Trust assurances */}
              <div className="space-y-2 text-xs text-gray-600 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selectedVariant?.warranty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>ارسال اکسپرس دیجی‌کالا (آماده تحویل)</span>
                </div>
              </div>

              {/* Price Row */}
              <div className="py-2">
                {isOutOfStock ? (
                  <div className="text-center py-2">
                    <span className="text-sm font-black text-red-600 bg-red-100 px-3 py-1 rounded-xl inline-block mb-3">
                      ناموجود در انبار
                    </span>
                    <button
                      onClick={() => setIsStockAlertOpen(true)}
                      className="w-full py-3 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>موجود شد خبرم کن!</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {discountPercent > 0 && (
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400 line-through">{formatToman(rawPrice)}</span>
                        <span className="bg-dk-red text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                          {toPersianDigits(discountPercent)}٪ تخفیف
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500">قیمت نهایی:</span>
                      <span className="text-lg font-black text-dk-dark">
                        {formatToman(finalUnitPrice * quantity)}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between pb-4">
                      <span className="text-xs font-bold text-gray-700">تعداد:</span>
                      <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden">
                        <button
                          onClick={() => setQuantity((q) => Math.min(q + 1, selectedVariant.stock))}
                          disabled={quantity >= selectedVariant.stock}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-bold text-xs font-mono">{toPersianDigits(quantity)}</span>
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-3 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>افزودن به سبد خرید</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Reviews */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-dk-border shadow-sm">
        {/* Tab Headers */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`text-sm font-black pb-3 transition-colors relative ${
              activeTab === 'specs' ? 'text-dk-red' : 'text-gray-500 hover:text-dk-dark'
            }`}
          >
            <span>مشخصات فنی و تخصصی</span>
            {activeTab === 'specs' && (
              <span className="absolute bottom-0 right-0 left-0 h-1 bg-dk-red rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm font-black pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'text-dk-red' : 'text-gray-500 hover:text-dk-dark'
            }`}
          >
            <span>دیدگاه خریداران ({toPersianDigits(reviews.length)})</span>
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 right-0 left-0 h-1 bg-dk-red rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Specs */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-dk-dark">مشخصات فنی کالا:</h3>
            {product.specs && product.specs.length > 0 ? (
              <div className="space-y-6">
                {product.specs.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-xs font-black text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      {group.groupTitle}
                    </h4>
                    <div className="divide-y divide-gray-100">
                      {group.attributes.map((attr, aIdx) => (
                        <div key={aIdx} className="grid grid-cols-1 md:grid-cols-4 py-2.5 text-xs">
                          <span className="text-gray-400 font-medium md:col-span-1">{attr.name}</span>
                          <span className="text-dk-dark font-bold md:col-span-3">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">{product.description}</p>
            )}
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-black text-dk-dark">نظرات خریداران این محصول</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  دیدگاه‌های واقعی ثبت شده توسط مشتریانی که این کالا را خریداری کرده‌اند.
                </p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="py-2.5 px-5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت نظر جدید</span>
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-dk-dark">{rev.userName}</span>
                        {rev.isBuyer && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            خریدار محصول
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {formatPersianDate(rev.createdAt)}
                      </span>
                    </div>

                    {/* Rating stars & title */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-dk-dark">{rev.title}</span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>

                    {/* Positive / Negative points */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {rev.positivePoints && rev.positivePoints.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-700">نکات مثبت:</span>
                          <ul className="space-y-0.5 text-xs text-emerald-900">
                            {rev.positivePoints.map((pt, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">+</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rev.negativePoints && rev.negativePoints.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-red-700">نکات منفی:</span>
                          <ul className="space-y-0.5 text-xs text-red-900">
                            {rev.negativePoints.map((pt, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="text-red-500 font-bold">-</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">هنوز دیدگاهی برای این کالا ثبت نشده است.</p>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="mt-3 text-xs font-bold text-dk-red hover:underline"
                >
                  اولین نفری باشید که نظر می‌دهد!
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock alert modal */}
      <StockAlertModal
        product={isStockAlertOpen ? product : null}
        onClose={() => setIsStockAlertOpen(false)}
      />

      {/* Review modal */}
      {isReviewModalOpen && (
        <ReviewModal
          product={product}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={refreshReviews}
        />
      )}
    </div>
  );
};
