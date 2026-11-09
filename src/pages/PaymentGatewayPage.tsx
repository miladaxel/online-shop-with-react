import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Clock, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageManager } from '../data/storage';
import { useCart } from '../context/CartContext';
import { formatToman, toPersianDigits } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

export const PaymentGatewayPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { showToast } = useNotification();

  const [order, setOrder] = useState(() => (orderNumber ? StorageManager.getOrderByNumber(orderNumber) : null));

  // Form Fields
  const [cardNumber, setCardNumber] = useState('6037-9918-4455-6677');
  const [cvv2, setCvv2] = useState('345');
  const [expMonth, setExpMonth] = useState('08');
  const [expYear, setExpYear] = useState('06');
  const [otp, setOtp] = useState('');
  const [captcha, setCaptcha] = useState('8491');
  const [enteredCaptcha, setEnteredCaptcha] = useState('8491');

  // OTP Timer
  const [otpTimer, setOtpTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      const found = StorageManager.getOrderByNumber(orderNumber);
      if (!found) {
        showToast('سفارش مورد نظر یافت نشد.', 'error');
        navigate('/');
      } else {
        setOrder(found);
      }
    }
  }, [orderNumber, navigate, showToast]);

  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  if (!order) return null;

  const handleRequestOtp = () => {
    setOtpTimer(120);
    setOtp('54321');
    showToast('رمز یکبار مصرف پیامک شد: ۵۴۳۲۱ (به‌صورت خودکار در فیلد مربوطه درج شد)', 'success');
  };

  const handlePaySuccess = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // 1. Deduct stock for all items
      for (const item of order.items) {
        StorageManager.deductStock(item.variantId, item.quantity);
      }

      // 2. Update order status
      const allOrders = StorageManager.getOrders();
      const target = allOrders.find((o) => o.orderNumber === order.orderNumber);
      if (target) {
        target.status = 'PROCESSING';
        target.paidAt = new Date().toISOString();
        target.refId = `REF-${Math.floor(10000000 + Math.random() * 90000000)}`;
        localStorage.setItem('dk_orders', JSON.stringify(allOrders));
      }

      // 3. Clear cart
      clearCart();

      // 4. Trigger celebratory Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore if confetti blocked
      }

      setIsProcessing(false);
      navigate(`/order/success/${order.orderNumber}`);
    }, 1200);
  };

  const handleCancel = () => {
    if (window.confirm('آیا از انصراف از پرداخت و بازگشت به سبد خرید اطمینان دارید؟')) {
      const allOrders = StorageManager.getOrders();
      const target = allOrders.find((o) => o.orderNumber === order.orderNumber);
      if (target) {
        target.status = 'CANCELLED';
        localStorage.setItem('dk_orders', JSON.stringify(allOrders));
      }
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex items-center justify-center font-sans" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-2xl w-full overflow-hidden">
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-black">درگاه پرداخت اینترنتی شاپرک (شبیه‌ساز تستی)</h2>
              <span className="text-xs text-emerald-100 font-mono">سامانه پرداخت الکترونیک شتاب بانکی</span>
            </div>
          </div>
          <div className="text-left font-mono text-xs text-emerald-200">
            <span className="block font-bold">SHA-PARAK 2.0</span>
            <span>256-bit SSL</span>
          </div>
        </div>

        {/* Payment Meta Info Strip */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4 text-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-gray-500">پذیرنده اینترنتی:</span>
            <span className="font-bold text-dk-dark mr-1">فروشگاه دیجی‌کالا (Digikala E-Commerce)</span>
          </div>
          <div>
            <span className="text-gray-500">شماره سفارش:</span>
            <span className="font-bold text-dk-dark font-mono mr-1">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-500">مبلغ قابل کسر:</span>
            <span className="font-black text-emerald-800 text-sm mr-1">{formatToman(order.finalPrice)}</span>
          </div>
        </div>

        {/* Card Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>شماره کارت بانکی ۱۶ رقمی:</span>
                <span className="text-[11px] text-gray-400">کارت پیش‌فرض تستی درج شده است</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  dir="ltr"
                  className="w-full text-center text-sm md:text-base font-mono font-bold tracking-widest py-3 px-4 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none"
                  required
                />
                <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* CVV2 and Expiration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">کد شناسایی (CVV2):</label>
                <input
                  type="password"
                  value={cvv2}
                  onChange={(e) => setCvv2(e.target.value)}
                  maxLength={4}
                  dir="ltr"
                  className="w-full text-center text-sm font-mono font-bold py-2.5 px-3 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">تاریخ انقضا (ماه / سال):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    maxLength={2}
                    dir="ltr"
                    placeholder="سال"
                    className="w-1/2 text-center text-sm font-mono font-bold py-2.5 px-2 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    maxLength={2}
                    dir="ltr"
                    placeholder="ماه"
                    className="w-1/2 text-center text-sm font-mono font-bold py-2.5 px-2 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dynamic OTP */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">رمز دوم پویا (OTP):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  dir="ltr"
                  placeholder="رمز ۵ رقمی پویا"
                  className="flex-1 text-center text-sm font-mono font-bold tracking-widest py-2.5 px-3 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpTimer > 0}
                  className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>
                    {otpTimer > 0 ? `ارسال مجدد (${toPersianDigits(otpTimer)} ثانیه)` : 'دریافت رمز پویا'}
                  </span>
                </button>
              </div>
            </div>

            {/* Captcha */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">کد امنیتی:</label>
                <input
                  type="text"
                  value={enteredCaptcha}
                  onChange={(e) => setEnteredCaptcha(e.target.value)}
                  dir="ltr"
                  className="w-full text-center text-sm font-mono font-bold py-2.5 px-3 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <div className="flex-1 bg-gray-100 border border-gray-300 text-gray-800 font-mono font-black text-lg text-center tracking-widest py-2 rounded-xl select-none line-through">
                  {captcha}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rnd = Math.floor(1000 + Math.random() * 9000).toString();
                    setCaptcha(rnd);
                    setEnteredCaptcha(rnd);
                  }}
                  className="p-2 text-gray-500 hover:text-emerald-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="تغییر کد امنیتی"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handlePaySuccess}
              disabled={isProcessing}
              className="w-full sm:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>در حال ارتباط با مرکز شاپرک و تایید تراکنش...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>پرداخت و تایید نهایی سفارش</span>
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="w-full sm:w-auto py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
            >
              انصراف و بازگشت
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-center text-[11px] text-gray-500">
          این صفحه یک شبیه‌ساز امن تحت کلاینت است و اطلاعات کارت شما در هیچ سرور یا پایگاه‌داده خارجی ذخیره نمی‌شود.
        </div>
      </div>
    </div>
  );
};
