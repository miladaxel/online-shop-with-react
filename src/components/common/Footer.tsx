import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RotateCcw, CreditCard, ChevronUp, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-dk-border mt-16 text-gray-600">
      {/* Back to top button */}
      <div className="border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-dk-red text-white font-black text-lg px-2.5 py-0.5 rounded-lg">دیجی‌کالا</div>
            <span className="text-xs text-gray-500">پلتفرم فروشگاهی و مقایسه آنلاین کالا</span>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-dk-red transition-colors border border-gray-200 hover:border-dk-red px-3 py-1.5 rounded-xl"
          >
            <span>بازگشت به بالا</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trust Highlights */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-50 text-dk-red flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-dk-dark">امکان تحویل اکسپرس</span>
            <span className="text-[11px] text-gray-400">تحویل سریع سفارشات در کمترین زمان</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-dk-dark">ضمانت اصل بودن کالا</span>
            <span className="text-[11px] text-gray-400">تضمین ۱۰۰٪ اصالت و سلامت فیزیکی</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-dk-dark">۷ روز ضمانت بازگشت</span>
            <span className="text-[11px] text-gray-400">امکان مرجوعی کالا در صورت عدم رضایت</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-dk-dark">پرداخت امن شاپرک</span>
            <span className="text-[11px] text-gray-400">شبیه‌سازی کامل درگاه شتاب و پرداخت آنلاین</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="border-t border-gray-100 bg-gray-50/60 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h4 className="font-black text-sm text-dk-dark mb-3">درباره این پروژه</h4>
            <p className="text-gray-500 leading-relaxed">
              این وب‌اپلیکیشن یک بازآفرینی مدرن، ماژولار و کامل از پلتفرم فروشگاهی دیجی‌کالا بر بستر React و TypeScript است که با داده‌های Mock جامع، سامانه خرید هیبریدی، رهگیری ۵ مرحله‌ای مرسوله، ماتریس مقایسه کالا و پنل فروشندگان پیاده‌سازی شده است.
            </p>
          </div>

          <div>
            <h4 className="font-black text-sm text-dk-dark mb-3">دسته‌بندی‌های کالا</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/catalog?category=mobile-phones" className="hover:text-dk-red transition-colors">گوشی موبایل و لوازم جانبی</Link></li>
              <li><Link to="/catalog?category=laptops" className="hover:text-dk-red transition-colors">لپ‌تاپ و اولترابوک گیمینگ</Link></li>
              <li><Link to="/catalog?category=audio-headphones" className="hover:text-dk-red transition-colors">هدفون و سیستم‌های صوتی</Link></li>
              <li><Link to="/catalog?category=gaming-consoles" className="hover:text-dk-red transition-colors">کنسول‌های بازی پلی‌استیشن و ایکس‌باکس</Link></li>
              <li><Link to="/catalog?category=smart-watches" className="hover:text-dk-red transition-colors">ساعت‌های هوشمند و مچ‌بند</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm text-dk-dark mb-3">خدمات مشتریان و ابزارها</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/orders/track" className="hover:text-dk-red transition-colors">پیگیری آنلاین مرسوله پستی</Link></li>
              <li><Link to="/compare" className="hover:text-dk-red transition-colors">موتور مقایسه فنی کالاها</Link></li>
              <li><Link to="/wishlist" className="hover:text-dk-red transition-colors">لیست علاقه‌مندی‌ها</Link></li>
              <li><Link to="/cart" className="hover:text-dk-red transition-colors">سبد خرید و اعمال کد تخفیف</Link></li>
              <li><Link to="/seller" className="hover:text-dk-red transition-colors">مرکز فروشندگان دیجی‌کالا (Seller Center)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm text-dk-dark mb-3">مستندات و استقرار</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/docs" className="hover:text-dk-red transition-colors">معماری سیستم و مستندات API</Link></li>
              <li>
                <a
                  href="https://github.com/miladaxel/online-shop"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-dk-red transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>ریپازیتوری گیت‌هاب پروژه</span>
                </a>
              </li>
              <li className="text-gray-400">آماده استقرار مستقیم روی GitHub Pages</li>
            </ul>
            <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
              <span className="block text-[11px] font-bold text-dk-dark">کدهای تخفیف تست فعال:</span>
              <div className="flex gap-2 mt-1">
                <code className="bg-red-50 text-dk-red font-mono px-2 py-0.5 rounded text-[11px] font-bold">WELCOME</code>
                <code className="bg-red-50 text-dk-red font-mono px-2 py-0.5 rounded text-[11px] font-bold">DIGI10</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-4 bg-gray-100 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>برای استفاده از تمامی قابلیت‌های این فروشگاه نیازی به سرور بک‌اند واقعی ندارید.</span>
          <div className="flex items-center gap-1 text-[11px]">
            <span>طراحی‌شده با</span>
            <Heart className="w-3.5 h-3.5 text-dk-red fill-dk-red inline" />
            <span>برای نمایش بر روی GitHub Pages</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
