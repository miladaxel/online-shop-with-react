import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  Store,
  Check,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatToman, toPersianDigits, getDiscountedPrice } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    totalItemsCount,
    totalRawPrice,
    totalProductsDiscount,
    couponDiscount,
    shippingCost,
    finalPrice,
    appliedCoupon,
    couponError,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyCoupon(couponCodeInput)) {
      setCouponCodeInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-12 border border-dk-border shadow-sm">
          <div className="w-20 h-20 rounded-full bg-red-50 text-dk-red flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-dk-dark mb-2">سبد خرید شما در حال حاضر خالی است!</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            می‌توانید برای مشاهده محصولات جدید و پیشنهادات شگفت‌انگیز به کاتالوگ دیجی‌کالا مراجعه کنید.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <span>مشاهده کاتالوگ و خرید کالا</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-dk-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-dk-red flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-dk-dark">سبد خرید شما</h1>
            <span className="text-xs text-gray-400 font-medium">
              {toPersianDigits(totalItemsCount)} کالا آماده ثبت نهایی سفارش
            </span>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-gray-400 hover:text-dk-red transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>خالی کردن سبد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const variant = item.variant;
            const product = item.product;
            if (!variant || !product) return null;

            const unitRaw = variant.price;
            const unitFinal = getDiscountedPrice(unitRaw, variant.discountPercent);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-dk-border shadow-xs hover:border-gray-300 transition-all flex flex-col sm:flex-row items-center gap-5"
              >
                {/* Thumb */}
                <Link to={`/product/${product.slug}`} className="shrink-0 group">
                  <img
                    src={product.mainImage}
                    alt={product.titleFa}
                    className="w-28 h-28 object-contain rounded-2xl p-1 bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-right">
                  <Link
                    to={`/product/${product.slug}`}
                    className="text-xs md:text-sm font-black text-dk-dark hover:text-dk-red transition-colors line-clamp-2"
                  >
                    {product.titleFa}
                  </Link>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span
                        style={{ backgroundColor: variant.colorHex }}
                        className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                      />
                      <span>{variant.colorName}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-gray-400" />
                      <span>{variant.seller?.storeName || 'دیجی‌کالا'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{variant.warranty}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-gray-600">ارسال اکسپرس دیجی‌کالا از انبار</span>
                  </div>
                </div>

                {/* Counter & Price */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= variant.stock}
                      className="p-1.5 hover:bg-gray-200 text-gray-700 disabled:opacity-30 transition-colors"
                      title="افزایش تعداد"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-bold text-xs font-mono text-dk-dark">
                      {toPersianDigits(item.quantity)}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-700 transition-colors"
                      title="کاهش تعداد"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-dk-red" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Price breakdown */}
                  <div className="text-left">
                    {variant.discountPercent > 0 && (
                      <div className="text-[11px] text-gray-400 line-through">
                        {formatToman(unitRaw * item.quantity)}
                      </div>
                    )}
                    <div className="text-sm font-black text-dk-dark">
                      {formatToman(unitFinal * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-dk-border shadow-sm space-y-5">
            <h3 className="text-sm font-black text-dk-dark pb-3 border-b border-gray-100">
              خلاصه صورت‌حساب سفارش
            </h3>

            {/* Price list */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span>قیمت کالاها ({toPersianDigits(totalItemsCount)} قلم):</span>
                <span className="font-bold text-gray-700">{formatToman(totalRawPrice)}</span>
              </div>

              {totalProductsDiscount > 0 && (
                <div className="flex items-center justify-between text-dk-red">
                  <span>سود شما از خرید (تخفیف کالاها):</span>
                  <span className="font-bold">({formatToman(totalProductsDiscount)}) -</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-600 bg-emerald-50 p-2 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>کد تخفیف ({appliedCoupon.code}):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">({formatToman(couponDiscount)}) -</span>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-600"
                      title="حذف کد تخفیف"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-gray-500">
                <span>هزینه ارسال مرسوله:</span>
                <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : 'text-gray-700'}`}>
                  {shippingCost === 0 ? 'رایگان (سفارش بالای ۵۰۰ هزار)' : formatToman(shippingCost)}
                </span>
              </div>
            </div>

            {/* Coupon form */}
            {!appliedCoupon && (
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1.5">کد تخفیف دارید؟</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="کد تخفیف (مثال: WELCOME)"
                    className="flex-1 text-xs py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none uppercase font-mono tracking-wider"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
                  >
                    ثبت
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-500 mt-1 font-medium">{couponError}</p>}
                <div className="mt-2 text-[10px] text-gray-400">
                  تست: کد <span className="font-mono text-dk-red font-bold">WELCOME</span> (۱۰۰ هزار تومان) یا{' '}
                  <span className="font-mono text-dk-red font-bold">DIGI10</span> (۱۰٪ تخفیف)
                </div>
              </form>
            )}

            {/* Final Total */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-500">مبلغ قابل پرداخت:</span>
                <span className="text-[11px] text-gray-400">شامل کلیه مالیات‌ها و تخفیف‌ها</span>
              </div>
              <span className="text-lg font-black text-dk-red">{formatToman(finalPrice)}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>ادامه فرآیند خرید و پرداخت</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
