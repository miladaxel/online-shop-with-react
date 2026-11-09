import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Search,
  CheckCircle2,
  Package,
  Clock,
  Box,
  MapPin,
  ExternalLink,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import { StorageManager } from '../data/storage';
import { Order, OrderStatus } from '../types';
import { formatToman, toPersianDigits, formatPersianDate } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

const STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'PENDING_PAYMENT', label: 'ثبت سفارش', desc: 'صدور فاکتور و انتظار پرداخت' },
  { key: 'PROCESSING', label: 'تایید پرداخت', desc: 'تایید تراکنش و ارسال به انبار' },
  { key: 'PACKAGING', label: 'بسته‌بندی در انبار', desc: 'تخصیص کالا و بسته‌بندی ایمن' },
  { key: 'SHIPPED', label: 'تحویل به پست/اکسپرس', desc: 'خروج مرسوله از انبار مرکزی' },
  { key: 'DELIVERED', label: 'تحویل به مشتری', desc: 'مرسوله با موفقیت تحویل شد' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [inputCode, setInputCode] = useState(paramOrderNumber || 'DK-77889900');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    const code = paramOrderNumber || inputCode;
    if (code) {
      const found = StorageManager.getOrderByNumber(code);
      if (found) {
        setCurrentOrder(found);
      } else {
        // If searching non-existent code
        if (paramOrderNumber) {
          showToast(`سفارشی با کد «${code}» یافت نشد.`, 'error');
        }
      }
    }
  }, [paramOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const found = StorageManager.getOrderByNumber(inputCode.trim());
    if (found) {
      setCurrentOrder(found);
      navigate(`/orders/track/${found.orderNumber}`, { replace: true });
    } else {
      showToast(`سفارشی با کد «${inputCode}» یافت نشد. می‌توانید کد تستی DK-77889900 را امتحان کنید.`, 'error');
    }
  };

  const handleAdvanceStep = () => {
    if (!currentOrder) return;
    const updated = StorageManager.advanceOrderStatus(currentOrder.orderNumber);
    if (updated) {
      setCurrentOrder({ ...updated });
      showToast(`وضعیت سفارش به مرحله «${getStageLabel(updated.status)}» ارتقا یافت!`, 'success');
    } else {
      showToast('این سفارش در آخرین مرحله (تحویل شده) قرار دارد.', 'info');
    }
  };

  const getStageIndex = (status: OrderStatus) => {
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 1 : idx;
  };

  const getStageLabel = (status: OrderStatus) => {
    return STAGES.find((s) => s.key === status)?.label || status;
  };

  const currentStageIdx = currentOrder ? getStageIndex(currentOrder.status) : 0;
  const progressPercent = (currentStageIdx / (STAGES.length - 1)) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-blue-400">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-xl md:text-2xl font-black">سامانه پیگیری آنلاین مرسوله و سفارشات</h1>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          جهت مشاهده تایم‌لاین ۵ مرحله‌ای ارسال و استعلام آخرین وضعیت پستی، شماره سفارش خود را وارد کنید.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="مثال: DK-77889900"
            dir="ltr"
            className="flex-1 py-3 px-4 rounded-xl bg-white text-gray-900 text-sm font-mono font-bold text-center outline-none focus:ring-4 focus:ring-red-300"
            required
          />
          <button
            type="submit"
            className="py-3 px-6 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>رهگیری</span>
          </button>
        </form>

        {/* Demo Fast Fill Pill */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>کد سفارش تست فعال:</span>
          <button
            onClick={() => {
              setInputCode('DK-77889900');
              const found = StorageManager.getOrderByNumber('DK-77889900');
              if (found) setCurrentOrder(found);
            }}
            className="font-mono text-yellow-300 font-bold bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg transition-colors"
          >
            DK-77889900
          </button>
        </div>
      </div>

      {currentOrder && (
        <div className="space-y-6">
          {/* Main Tracking Result Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-dk-border shadow-sm space-y-8">
            {/* Top Bar with Advance Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">شماره سفارش:</span>
                  <span className="font-mono font-black text-sm text-dk-dark">{currentOrder.orderNumber}</span>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md">
                    {getStageLabel(currentOrder.status)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">
                  تاریخ ثبت: {formatPersianDate(currentOrder.createdAt)}
                </div>
              </div>

              {/* SIMULATE ADVANCE BUTTON FOR EMPLOYER / REVIEWER */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdvanceStep}
                  disabled={currentStageIdx === STAGES.length - 1}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
                  title="تغییر وضعیت برای تست تایم‌لاین"
                >
                  <FastForward className="w-4 h-4" />
                  <span>ارتقای مرحله سفارش (تست شبیه‌ساز)</span>
                </button>
              </div>
            </div>

            {/* Visual 5-Stage Stepper / Timeline */}
            <div className="py-6 px-2">
              <div className="relative">
                {/* Background Line */}
                <div className="absolute top-1/2 -translate-y-1/2 right-6 left-6 h-1.5 bg-gray-200 rounded-full z-0" />
                {/* Green Progress Line */}
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="absolute top-1/2 -translate-y-1/2 right-6 h-1.5 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                />

                {/* Steps Nodes */}
                <div className="relative z-10 flex items-center justify-between">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center max-w-[100px]">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-100 text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-emerald-200 scale-110' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                          ) : (
                            <span className="font-bold text-xs">{toPersianDigits(idx + 1)}</span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-3 font-black ${
                            isCompleted ? 'text-dk-dark' : 'text-gray-400'
                          }`}
                        >
                          {stage.label}
                        </span>
                        <span className="hidden md:inline text-[10px] text-gray-400 mt-0.5 leading-tight">
                          {stage.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Postal Tracking & Delivery Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <span className="font-black text-dk-dark block">اطلاعات پستی و ارسال:</span>
                <div className="flex items-center justify-between text-gray-600">
                  <span>روش ارسال:</span>
                  <span className="font-bold">
                    {currentOrder.shippingMethod === 'EXPRESS' ? 'اکسپرس دیجی‌کالا' : 'پست پیشتاز'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>کد رهگیری پستی مرسوله:</span>
                  <span className="font-mono font-bold text-blue-600">{currentOrder.postalTrackingCode}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>کد پیگیری مالی درگاه:</span>
                  <span className="font-mono font-bold text-emerald-700">{currentOrder.refId || 'REF-14030510'}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <span className="font-black text-dk-dark block">نشانی تحویل گیرنده (Snapshot):</span>
                <div className="text-gray-600">
                  تحویل‌گیرنده: <strong>{currentOrder.addressSnapshot.recipientName}</strong> ({currentOrder.addressSnapshot.recipientPhone})
                </div>
                <div className="text-gray-600 leading-relaxed">
                  آدرس: {currentOrder.addressSnapshot.province}، {currentOrder.addressSnapshot.city}، {currentOrder.addressSnapshot.addressLine}
                </div>
                <div className="text-gray-400 font-mono text-[11px]">
                  کد پستی: {toPersianDigits(currentOrder.addressSnapshot.postalCode)}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <span className="font-black text-sm text-dk-dark block">اقلام این مرسوله:</span>
              <div className="divide-y divide-gray-100">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productTitle}
                        className="w-14 h-14 object-contain rounded-xl border border-gray-100 shrink-0"
                      />
                      <div>
                        <div className="font-black text-dk-dark">{item.productTitle}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>رنگ: {item.colorName}</span>
                          <span>•</span>
                          <span>فروشنده: {item.sellerName}</span>
                          <span>•</span>
                          <span>{item.warranty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="font-mono font-bold text-gray-500">
                        {toPersianDigits(item.quantity)} عدد × {formatToman(item.unitFinalPrice)}
                      </div>
                      <div className="font-black text-dk-dark text-sm mt-0.5">
                        {formatToman(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
