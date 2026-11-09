import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Tag,
  Clock,
} from 'lucide-react';
import { StorageManager } from '../data/storage';
import { ProductCard } from '../components/product/ProductCard';
import { StockAlertModal } from '../components/product/StockAlertModal';
import { Product } from '../types';
import { toPersianDigits } from '../utils/formatters';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(StorageManager.getCategories());
  const [brands, setBrands] = useState(StorageManager.getBrands());
  const [selectedStockAlertProduct, setSelectedStockAlertProduct] = useState<Product | null>(null);

  // Countdown timer for Incredible Offers
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    setProducts(StorageManager.getProducts());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const incredibleOffers = products.filter((p) => p.variants.some((v) => v.isSpecialOffer && v.stock > 0));
  const bestSellers = products.slice(0, 4);
  const outOfStockDemo = products.filter((p) => p.variants.every((v) => v.stock === 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-dk-red/20 border border-dk-red/40 text-red-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پلتفرم جامع فروشگاه آنلاین دیجی‌کالا (React + Mock Data)</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black mb-4 leading-snug">
            تجربه خرید آنلاین مدرن با سریع‌ترین استک فرانت‌اند
          </h1>

          <p className="text-sm md:text-base text-slate-300 mb-6 leading-relaxed">
            امکان تست و بررسی کامل قابلیت‌های دیجی‌کالا شامل موتور مقایسه کالا، سبد خرید هیبریدی، سامانه چندفروشندگی، کدهای تخفیف و رهگیری آنلاین مرسوله بدون نیاز به راه‌اندازی دیتابیس یا سرور بک‌اند.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/catalog"
              className="bg-dk-red hover:bg-dk-red-hover text-white text-xs md:text-sm font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>مشاهده کاتالوگ محصولات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              to="/compare"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs md:text-sm font-bold px-5 py-3 rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <span>موتور مقایسه تخصصی کالاها</span>
            </Link>

            <Link
              to="/seller"
              className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs md:text-sm font-bold px-5 py-3 rounded-xl shadow transition-all flex items-center gap-2"
            >
              <span>ورود به مرکز فروشندگان</span>
            </Link>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Categories Circle Hub */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-black text-dk-dark flex items-center gap-2">
            <span className="w-1.5 h-5 bg-dk-red rounded-full inline-block" />
            <span>دسته‌بندی‌های محبوب</span>
          </h2>
          <Link to="/catalog" className="text-xs font-bold text-dk-red hover:underline flex items-center gap-1">
            <span>مشاهده همه دسته‌ها</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="bg-white p-4 rounded-2xl border border-dk-border hover:border-dk-red hover:shadow-md transition-all group flex flex-col items-center text-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {cat.icon || '📦'}
              </div>
              <span className="text-xs font-bold text-dk-dark group-hover:text-dk-red transition-colors">
                {cat.titleFa}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{cat.titleEn}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Incredible Offers Slider (قرمز دیجی‌کالا) */}
      <section className="bg-dk-red rounded-3xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black">پیشنهاد شگفت‌انگیز</h2>
              <p className="text-xs text-red-100">تخفیف‌های استثنایی با موجودی محدود</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 self-start md:self-auto">
            <Clock className="w-4 h-4 text-white/80" />
            <span className="text-xs text-red-100 font-medium ml-1">زمان باقی‌مانده:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm">
              <span className="bg-white text-dk-red px-2 py-0.5 rounded-lg">
                {toPersianDigits(String(timeLeft.hours).padStart(2, '0'))}
              </span>
              <span>:</span>
              <span className="bg-white text-dk-red px-2 py-0.5 rounded-lg">
                {toPersianDigits(String(timeLeft.minutes).padStart(2, '0'))}
              </span>
              <span>:</span>
              <span className="bg-white text-dk-red px-2 py-0.5 rounded-lg">
                {toPersianDigits(String(timeLeft.seconds).padStart(2, '0'))}
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid inside Red Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {incredibleOffers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenStockAlert={(p) => setSelectedStockAlertProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full inline-block" />
            <h2 className="text-base md:text-lg font-black text-dk-dark">پرفروش‌ترین کالاهای دیجیتال</h2>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-dk-red hover:underline flex items-center gap-1">
            <span>مشاهده همه محصولات</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenStockAlert={(p) => setSelectedStockAlertProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Out of Stock Alert Test Showcase */}
      {outOfStockDemo.length > 0 && (
        <section className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="inline-block text-[11px] font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-md mb-1">
                تست سناریوی کاربردی
              </span>
              <h3 className="text-base font-black text-amber-950">
                کالاهای ناموجود و سیستم اعلان «موجود شد خبرم کن»
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                این کالاها عمداً با موجودی انبار صفر تنظیم شده‌اند تا عملکرد ماژول اعلان پیامکی را تست کنید.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {outOfStockDemo.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenStockAlert={(p) => setSelectedStockAlertProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top Brands Banner */}
      <section className="bg-white rounded-3xl p-6 border border-dk-border">
        <h3 className="text-center text-sm font-black text-dk-dark mb-4">برندهای مطرح و اورجینال</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/catalog?brand=${brand.slug}`}
              className="p-4 rounded-2xl border border-gray-100 hover:border-dk-red hover:shadow-xs transition-all text-center flex flex-col items-center gap-1 group"
            >
              <span className="text-base font-black text-gray-800 group-hover:text-dk-red transition-colors">
                {brand.nameFa}
              </span>
              <span className="text-[11px] font-mono text-gray-400">{brand.nameEn}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stock Alert Modal */}
      <StockAlertModal
        product={selectedStockAlertProduct}
        onClose={() => setSelectedStockAlertProduct(null)}
      />
    </div>
  );
};
