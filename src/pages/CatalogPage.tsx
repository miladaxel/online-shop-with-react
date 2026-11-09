import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { StorageManager } from '../data/storage';
import { ProductCard } from '../components/product/ProductCard';
import { StockAlertModal } from '../components/product/StockAlertModal';
import { Product } from '../types';
import { toPersianDigits, getDiscountedPrice } from '../utils/formatters';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const categories = StorageManager.getCategories();
  const brands = StorageManager.getBrands();

  // Filters state from URL or default
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const searchQuery = searchParams.get('search') || '';
  const isSpecialOnly = searchParams.get('special') === 'true';

  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [selectedStockAlertProduct, setSelectedStockAlertProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(StorageManager.getProducts());
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory && p.category?.slug !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand && p.brand?.slug !== selectedBrand) {
        return false;
      }

      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.titleFa.toLowerCase().includes(q) || p.titleEn.toLowerCase().includes(q);
        const matchesBrand = p.brand?.nameFa.toLowerCase().includes(q) || p.brand?.nameEn.toLowerCase().includes(q);
        const matchesCategory = p.category?.titleFa.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesCategory) return false;
      }

      // Special offers filter
      if (isSpecialOnly && !p.variants.some((v) => v.isSpecialOffer)) {
        return false;
      }

      // In stock filter
      if (inStockOnly && !p.variants.some((v) => v.stock > 0)) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedBrand, searchQuery, isSpecialOnly, inStockOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      const aPrice = a.variants[0] ? getDiscountedPrice(a.variants[0].price, a.variants[0].discountPercent) : 0;
      const bPrice = b.variants[0] ? getDiscountedPrice(b.variants[0].price, b.variants[0].discountPercent) : 0;

      if (sortBy === 'price_asc') return aPrice - bPrice;
      if (sortBy === 'price_desc') return bPrice - aPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default order
    });
    return list;
  }, [filteredProducts, sortBy]);

  const updateParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setInStockOnly(false);
  };

  const hasActiveFilters = selectedCategory || selectedBrand || searchQuery || isSpecialOnly || inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-dk-border mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dk-dark flex items-center gap-2">
            <Layers className="w-6 h-6 text-dk-red" />
            <span>کاتالوگ جامع کالاها</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            مشاهده و فیلتر {toPersianDigits(products.length)} کالای دیجیتال، پرچمداران موبایل، لپ‌تاپ و کنسول‌ها
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>مرتب‌سازی:</span>
          </span>
          <div className="bg-white rounded-xl border border-gray-200 p-1 flex items-center gap-1">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                sortBy === 'newest' ? 'bg-dk-red text-white' : 'text-gray-600 hover:text-dk-dark'
              }`}
            >
              جدیدترین
            </button>
            <button
              onClick={() => setSortBy('price_asc')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                sortBy === 'price_asc' ? 'bg-dk-red text-white' : 'text-gray-600 hover:text-dk-dark'
              }`}
            >
              ارزان‌ترین
            </button>
            <button
              onClick={() => setSortBy('price_desc')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                sortBy === 'price_desc' ? 'bg-dk-red text-white' : 'text-gray-600 hover:text-dk-dark'
              }`}
            >
              گران‌ترین
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                sortBy === 'rating' ? 'bg-dk-red text-white' : 'text-gray-600 hover:text-dk-dark'
              }`}
            >
              محبوب‌ترین
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-dk-border shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-black text-sm text-dk-dark flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-dk-red" />
                <span>فیلترهای پیشرفته</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-dk-red hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>حذف فیلترها</span>
                </button>
              )}
            </div>

            {/* Quick in-page search input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">جستجو در نتایج:</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateParam('search', e.target.value)}
                  placeholder="نام مدل، رم یا پردازنده..."
                  className="w-full text-xs py-2 pr-9 pl-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">دسته‌بندی‌ها:</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <button
                  onClick={() => updateParam('category', null)}
                  className={`w-full text-right px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                    !selectedCategory ? 'bg-red-50 text-dk-red font-bold' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>همه دسته‌ها</span>
                  {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('category', c.slug)}
                    className={`w-full text-right px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                      selectedCategory === c.slug ? 'bg-red-50 text-dk-red font-bold' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span>{c.titleFa}</span>
                    {selectedCategory === c.slug && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">برند محصول:</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <button
                  onClick={() => updateParam('brand', null)}
                  className={`w-full text-right px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                    !selectedBrand ? 'bg-red-50 text-dk-red font-bold' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>همه برندها</span>
                  {!selectedBrand && <Check className="w-3.5 h-3.5" />}
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateParam('brand', b.slug)}
                    className={`w-full text-right px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                      selectedBrand === b.slug ? 'bg-red-50 text-dk-red font-bold' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span>{b.nameFa}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{b.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              {/* Only In Stock Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-700">فقط کالاهای موجود در انبار</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-dk-red focus:ring-dk-red accent-dk-red cursor-pointer"
                />
              </label>

              {/* Special Offers Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-dk-red flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>فقط کالاهای شگفت‌انگیز</span>
                </span>
                <input
                  type="checkbox"
                  checked={isSpecialOnly}
                  onChange={(e) => updateParam('special', e.target.checked ? 'true' : null)}
                  className="w-4 h-4 rounded text-dk-red focus:ring-dk-red accent-dk-red cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-gray-400">فیلترهای فعال:</span>
              {selectedCategory && (
                <span className="bg-red-50 text-dk-red text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>دسته: {categories.find((c) => c.slug === selectedCategory)?.titleFa}</span>
                  <button onClick={() => updateParam('category', null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {selectedBrand && (
                <span className="bg-red-50 text-dk-red text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>برند: {brands.find((b) => b.slug === selectedBrand)?.nameFa}</span>
                  <button onClick={() => updateParam('brand', null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="bg-red-50 text-dk-red text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>جستجو: «{searchQuery}»</span>
                  <button onClick={() => updateParam('search', null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {isSpecialOnly && (
                <span className="bg-red-50 text-dk-red text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>پیشنهاد شگفت‌انگیز</span>
                  <button onClick={() => updateParam('special', null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="bg-red-50 text-dk-red text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>فقط موجود</span>
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenStockAlert={(p) => setSelectedStockAlertProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dk-border">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-dk-dark mb-1">کالایی با این مشخصات یافت نشد</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                فیلترهای انتخابی یا عبارت جستجو شده را بررسی کرده یا تغییر دهید.
              </p>
              <button
                onClick={clearAllFilters}
                className="py-2.5 px-6 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl transition-all"
              >
                پاک کردن فیلترها
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stock alert modal */}
      <StockAlertModal
        product={selectedStockAlertProduct}
        onClose={() => setSelectedStockAlertProduct(null)}
      />
    </div>
  );
};
