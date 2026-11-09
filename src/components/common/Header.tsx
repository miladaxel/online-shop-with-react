import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Truck,
  RotateCcw,
  BookOpen,
  Store,
  LogOut,
  Sliders,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { StorageManager } from '../../data/storage';
import { Product } from '../../types';
import { formatToman, toPersianDigits, getDiscountedPrice } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isAdmin, isSeller, logout, switchDemoUser } = useAuth();
  const { totalItemsCount, items, finalPrice } = useCart();
  const { wishlistIds } = useWishlist();
  const { compareIds } = useCompare();
  const { showToast } = useNotification();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cart preview state
  const [isCartHovered, setIsCartHovered] = useState(false);

  // Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const products = StorageManager.getProducts();
    const matches = products.filter(
      (p) =>
        p.titleFa.toLowerCase().includes(query) ||
        p.titleEn.toLowerCase().includes(query) ||
        p.brand?.nameFa.toLowerCase().includes(query) ||
        p.brand?.nameEn.toLowerCase().includes(query) ||
        p.category?.titleFa.toLowerCase().includes(query)
    );

    setSearchResults(matches.slice(0, 5));
    setIsSearchOpen(true);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetData = () => {
    if (window.confirm('آیا از بازنشانی کلیه داده‌های اولیه (محصولات، انبار، سفارشات و نظرات) اطمینان دارید؟')) {
      StorageManager.resetAllData();
      showToast('کلیه داده‌های فروشگاه با موفقیت به حالت اولیه بازنشانی شدند.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const categories = StorageManager.getCategories();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-dk-border shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-dk-red via-red-600 to-rose-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded font-bold">پیشنهاد ویژه</span>
            <span>ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان در سراسر کشور</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="hidden md:inline">پشتیبانی ۲۴ ساعته: ۶۱۹۳۰۰۰۰-۰۲۱</span>
            <button
              onClick={handleResetData}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded transition-colors text-white"
              title="بازنشانی پایگاه‌داده دمو به داده‌های اولیه"
            >
              <RotateCcw className="w-3 h-3" />
              <span>بازنشانی دیتای اولیه</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="bg-dk-red text-white font-black text-xl px-3 py-1 rounded-lg tracking-tight shadow-sm group-hover:bg-dk-red-hover transition-colors">
            دیجی‌کالا
          </div>
          <div className="hidden sm:flex flex-col text-[10px] text-gray-500 font-medium leading-tight">
            <span>فروشگاه اینترنتی</span>
            <span className="text-dk-red font-bold">نسخه جامع React</span>
          </div>
        </Link>

        {/* Live Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-2xl relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              placeholder="جستجو در دیجی‌کالا (نام کالا، برند سامسونگ، آیفون، سونی...)"
              className="w-full bg-gray-100/90 text-sm py-2.5 pr-10 pl-4 rounded-xl border border-transparent focus:border-dk-red focus:bg-white focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200 placeholder:text-gray-400"
            />
            <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-dk-border overflow-hidden z-50">
              <div className="p-2 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 px-3">
                <span>نتایج جستجوی کالاها</span>
                <span className="font-bold text-dk-red">{toPersianDigits(searchResults.length)} محصول یافت شد</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {searchResults.map((product) => {
                  const defaultVariant = product.variants[0];
                  const hasDiscount = defaultVariant?.discountPercent > 0;
                  const finalUnitPrice = defaultVariant
                    ? getDiscountedPrice(defaultVariant.price, defaultVariant.discountPercent)
                    : 0;

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group"
                    >
                      <img
                        src={product.mainImage}
                        alt={product.titleFa}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-dk-dark line-clamp-1 group-hover:text-dk-red transition-colors">
                          {product.titleFa}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{product.brand?.nameFa}</span>
                          <span>•</span>
                          <span>{product.category?.titleFa}</span>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        {defaultVariant && (
                          <div>
                            <div className="text-xs font-bold text-dk-dark">
                              {formatToman(finalUnitPrice)}
                            </div>
                            {hasDiscount && (
                              <div className="text-[10px] text-gray-400 line-through">
                                {formatToman(defaultVariant.price)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
                <Link
                  to={`/catalog?search=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="text-xs font-bold text-dk-red hover:underline"
                >
                  مشاهده همه نتایج جستجو برای «{searchQuery}» ←
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Profile / Login Dropdown */}
          <div ref={userMenuRef} className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-dk-red hover:bg-red-50/40 text-sm font-medium transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-red-100 text-dk-red flex items-center justify-center font-bold text-xs">
                  {currentUser?.firstName?.charAt(0) || 'ک'}
                </div>
                <span className="hidden sm:inline font-bold text-xs text-dk-dark">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-dk-red hover:text-dk-red text-xs font-bold transition-all text-dk-dark"
              >
                <UserIcon className="w-4 h-4 text-dk-red" />
                <span>ورود | ثبت‌نام</span>
              </Link>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && isAuthenticated && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-dk-border py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-xs font-bold text-dk-dark">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{currentUser?.phoneNumber}</div>
                  {isAdmin && (
                    <span className="inline-block mt-1 text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      مدیر ارشد سیستم
                    </span>
                  )}
                  {isSeller && !isAdmin && (
                    <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      فروشنده مجاز دیجی‌کالا
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>پروفایل و آدرس‌های من</span>
                  </Link>

                  <Link
                    to="/orders/track"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span>پیگیری و تاریخچه سفارشات</span>
                  </Link>

                  <Link
                    to="/seller"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>مرکز فروشندگان دیجی‌کالا</span>
                  </Link>
                </div>

                {/* Switch Demo Accounts */}
                <div className="border-t border-gray-100 pt-1 mt-1">
                  <div className="px-4 py-1 text-[10px] text-gray-400 font-bold">سوئیچ سریع حساب آزمایشی:</div>
                  <button
                    onClick={() => {
                      switchDemoUser('customer');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>سارا احمدی (مشتری نمونه)</span>
                    {currentUser?.phoneNumber === '09121112233' && <Check className="w-3.5 h-3.5 text-dk-red" />}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('admin');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>مدیر سیستم (Superuser)</span>
                    {currentUser?.phoneNumber === '09120000000' && <Check className="w-3.5 h-3.5 text-dk-red" />}
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-right flex items-center gap-2 px-4 py-2 text-xs font-bold text-dk-red hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>خروج از حساب</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Matrix Link */}
          <Link
            to="/compare"
            className="relative p-2.5 rounded-xl border border-gray-200 hover:border-dk-red hover:text-dk-red text-gray-600 transition-all"
            title="مقایسه تخصصی کالاها"
          >
            <Scale className="w-4 h-4" />
            {compareIds.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {toPersianDigits(compareIds.length)}
              </span>
            )}
          </Link>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-xl border border-gray-200 hover:border-dk-red hover:text-dk-red text-gray-600 transition-all"
            title="لیست علاقه‌مندی‌ها"
          >
            <Heart className="w-4 h-4" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-dk-red text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {toPersianDigits(wishlistIds.length)}
              </span>
            )}
          </Link>

          {/* Shopping Cart Button & Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
          >
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold shadow-sm transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">سبد خرید</span>
              {totalItemsCount > 0 && (
                <span className="bg-white text-dk-red font-black text-xs px-1.5 py-0.2 rounded-full">
                  {toPersianDigits(totalItemsCount)}
                </span>
              )}
            </Link>

            {/* Hover Mini-Cart Preview */}
            {isCartHovered && items.length > 0 && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-dk-border p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
                  <span className="font-bold text-gray-700">{toPersianDigits(totalItemsCount)} کالا در سبد شما</span>
                  <Link to="/cart" className="text-dk-red font-bold hover:underline">
                    مشاهده سبد خرید ←
                  </Link>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 py-2">
                  {items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center gap-3">
                      <img
                        src={item.product?.mainImage}
                        alt={item.product?.titleFa}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-dk-dark line-clamp-1">{item.product?.titleFa}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {toPersianDigits(item.quantity)} عدد × {formatToman(item.variant ? getDiscountedPrice(item.variant.price, item.variant.discountPercent) : 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">مبلغ نهایی:</span>
                  <span className="text-sm font-black text-dk-dark">{formatToman(finalPrice)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="mt-3 block text-center w-full py-2 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  ثبت سفارش و پرداخت
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Navigation Menu */}
      <nav className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6 overflow-x-auto py-2 text-xs text-gray-700 font-medium">
          <div className="flex items-center gap-6 shrink-0">
            {/* Catalog Hub Link */}
            <Link
              to="/catalog"
              className="flex items-center gap-1.5 font-bold text-dk-dark hover:text-dk-red py-1 transition-colors"
            >
              <Sliders className="w-4 h-4 text-dk-red" />
              <span>همه محصولات</span>
            </Link>

            {/* Quick Categories */}
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="hover:text-dk-red py-1 transition-colors shrink-0"
              >
                <span>{cat.titleFa}</span>
              </Link>
            ))}

            {/* Incredible Offers */}
            <Link
              to="/catalog?special=true"
              className="flex items-center gap-1 font-bold text-dk-red hover:text-dk-red-hover py-1 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>شگفت‌انگیزها</span>
            </Link>

            {/* Order Tracking */}
            <Link
              to="/orders/track"
              className="flex items-center gap-1 hover:text-dk-red py-1 transition-colors shrink-0"
            >
              <Truck className="w-4 h-4 text-blue-500" />
              <span>پیگیری مرسوله</span>
            </Link>

            {/* Comparison */}
            <Link
              to="/compare"
              className="flex items-center gap-1 hover:text-dk-red py-1 transition-colors shrink-0"
            >
              <Scale className="w-4 h-4 text-amber-500" />
              <span>مقایسه فنی کالاها</span>
            </Link>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Seller Center */}
            <Link
              to="/seller"
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>مرکز فروشندگان</span>
            </Link>

            {/* Documentation */}
            <Link
              to="/docs"
              className="flex items-center gap-1 text-purple-700 hover:text-purple-800 font-bold bg-purple-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>مستندات سیستم</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};
