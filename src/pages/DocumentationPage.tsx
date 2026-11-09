import React from 'react';
import { BookOpen, Layers, Database, ShieldCheck, Terminal, Cpu, CheckCircle2, GitBranch } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>مستندات معماری و راهنمای پیاده‌سازی</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-2">
          طراحی و ساختار پروژه فروشگاه دیجی‌کالا (React + Mock Data)
        </h1>
        <p className="text-xs md:text-sm text-purple-200 leading-relaxed max-w-2xl">
          این مستند تشریح‌کننده معماری سمت کلاینت، ساختار مدل‌های داده‌ای، منطق تراکنش‌های اتمیک و نحوه اجرای مستقل پروژه بدون نیاز به سرور بک‌اند واقعی برای ارائه در رزومه و استقرار در GitHub Pages است.
        </p>
      </div>

      {/* Highlights & Features Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-dk-border shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-dk-red flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-dk-dark">معماری ماژولار و کلاینت‌محور</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            طراحی شده بر پایه React 18، TypeScript و Tailwind CSS همراه با تفکیک کامل لایه‌های Context، Storage و Presentation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-dk-border shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-dk-dark">پایگاه داده موک پایدار (Storage)</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            استفاده از LocalStorage به همراه دیتای اولیه کامل (Seed Data) مشتق‌شده از پروژه جنگو با امکان بازنشانی یک‌کلیکه داده‌ها.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-dk-border shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GitBranch className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-dk-dark">آماده استقرار روی GitHub Pages</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            پیکربندی شده با مسیرهای نسبی (`base: './'`) و پکیج `gh-pages` برای استقرار خودکار و بدون خطای مسیر‌یابی ۴۰۴.
          </p>
        </div>
      </div>

      {/* ERD Structure */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-dk-border shadow-sm space-y-4">
        <h2 className="text-base font-black text-dk-dark flex items-center gap-2">
          <Database className="w-5 h-5 text-dk-red" />
          <span>دیاگرام ارتباط موجودیت‌ها (ERD Data Models)</span>
        </h2>
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{`User ||--o{ Address : "نشانی‌های ارسال"
User ||--o{ Order : "سفارشات ثبت شده"
User ||--o| Seller : "پروفایل فروشنده در مارکت‌پلیس"
User ||--o{ Wishlist : "لیست علاقه‌مندی‌ها"

Category ||--o{ Product : "دسته‌بندی درختی"
Brand ||--o{ Product : "برند سازنده"
Product ||--o{ ProductVariant : "تنوع رنگ و گارانتی"
Seller ||--o{ ProductVariant : "عرضه توسط فروشندگان مختلف"
Product ||--o{ ProductReview : "دیدگاه‌های ثبت‌شده خریداران"
Product ||--o{ StockAlert : "اعلان‌های پیامکی موجودی"

Cart ||--o{ CartItem : "اقلام سبد خرید کاربر"
Order ||--o{ OrderItem : "اقلام سفارش (Snapshot فریز شده)"
Coupon ||--o{ Order : "تخفیف اعمال‌شده"`}</pre>
        </div>
      </div>

      {/* REST API Endpoints Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-dk-border shadow-sm space-y-4">
        <h2 className="text-base font-black text-dk-dark flex items-center gap-2">
          <Terminal className="w-5 h-5 text-dk-red" />
          <span>شبیه‌سازی اندپوینت‌های REST API در فرانت‌اند</span>
        </h2>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                <th className="p-3">متد HTTP</th>
                <th className="p-3">مسیر اندپوینت</th>
                <th className="p-3">شرح عملکرد کلاینت</th>
                <th className="p-3">پایداری داده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold font-mono px-2 py-0.5 rounded">POST</span></td>
                <td className="p-3 font-mono">/api/v1/accounts/otp/send/</td>
                <td className="p-3">ارسال رمز یکبار مصرف به شماره موبایل کاربر</td>
                <td className="p-3 text-emerald-600 font-bold">حافظه کلاینت</td>
              </tr>
              <tr>
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold font-mono px-2 py-0.5 rounded">POST</span></td>
                <td className="p-3 font-mono">/api/v1/accounts/otp/verify/</td>
                <td className="p-3">اعتبارسنجی کد ۵ رقمی و ورود خودکار</td>
                <td className="p-3 text-emerald-600 font-bold">LocalStorage</td>
              </tr>
              <tr>
                <td className="p-3"><span className="bg-emerald-100 text-emerald-800 font-bold font-mono px-2 py-0.5 rounded">GET</span></td>
                <td className="p-3 font-mono">/api/v1/products/items/</td>
                <td className="p-3">فهرست محصولات همراه با فیلتر دسته‌بندی و برند</td>
                <td className="p-3 text-emerald-600 font-bold">Seed Data</td>
              </tr>
              <tr>
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold font-mono px-2 py-0.5 rounded">POST</span></td>
                <td className="p-3 font-mono">/api/v1/orders/checkout/</td>
                <td className="p-3">ثبت سفارش اتمیک با فریز نشانی و کاهش همگام انبار</td>
                <td className="p-3 text-emerald-600 font-bold">LocalStorage</td>
              </tr>
              <tr>
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold font-mono px-2 py-0.5 rounded">POST</span></td>
                <td className="p-3 font-mono">/api/v1/payments/verify/</td>
                <td className="p-3">تایید پرداخت بانکی درگاه شاپرک و تولید REF-ID</td>
                <td className="p-3 text-emerald-600 font-bold">LocalStorage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Credentials & Deployment Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-white p-6 rounded-3xl border border-dk-border shadow-xs space-y-3">
          <h3 className="text-sm font-black text-dk-dark">اطلاعات حساب‌های کاربری و کدهای تخفیف دمو</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <strong>مشتری نمونه:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">09121112233</code> (سارا احمدی)
            </li>
            <li>
              <strong>مدیر سیستم:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">09120000000</code> (دسترسی نامحدود)
            </li>
            <li>
              <strong>کد تخفیف ثابت:</strong> <code className="bg-red-50 text-dk-red font-bold px-2 py-0.5 rounded font-mono">WELCOME</code> (۱۰۰ هزار تومان تخفیف)
            </li>
            <li>
              <strong>کد تخفیف درصدی:</strong> <code className="bg-red-50 text-dk-red font-bold px-2 py-0.5 rounded font-mono">DIGI10</code> (۱۰٪ تخفیف تا سقف ۵۰۰ هزار)
            </li>
            <li>
              <strong>کد رهگیری نمونه:</strong> <code className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded font-mono">DK-77889900</code>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-dk-border shadow-xs space-y-3">
          <h3 className="text-sm font-black text-dk-dark">راهنمای استقرار روی GitHub Pages</h3>
          <p className="text-gray-500 leading-relaxed">
            این پروژه با تنظیمات خودکار Vite و پکیج `gh-pages` آماده انتشار فوری بر روی هاست رایگان GitHub Pages است:
          </p>
          <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] space-y-1">
            <div># ۱. ساخت بیلد پروداکشن:</div>
            <div className="text-emerald-400">npm run build</div>
            <div className="pt-1"># ۲. انتشار خودکار روی گیت‌هاب پیجز:</div>
            <div className="text-emerald-400">npm run deploy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
