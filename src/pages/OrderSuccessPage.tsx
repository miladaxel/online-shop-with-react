import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, ArrowLeft, PackageCheck, Copy, Home } from 'lucide-react';
import { StorageManager } from '../data/storage';
import { Order } from '../types';
import { formatToman, toPersianDigits, formatPersianDate } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { showToast } = useNotification();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderNumber) {
      const found = StorageManager.getOrderByNumber(orderNumber);
      if (found) {
        setOrder(found);
      }
    }
  }, [orderNumber]);

  const copyTracking = () => {
    if (order?.orderNumber && navigator.clipboard) {
      navigator.clipboard.writeText(order.orderNumber);
      showToast('شماره سفارش در حافظه موقت کپی شد.', 'info');
    }
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-black text-dk-dark mb-2">اطلاعات سفارش در دسترس نیست</h2>
        <Link to="/" className="px-5 py-2.5 bg-dk-red text-white text-xs font-bold rounded-xl inline-block">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-dk-border shadow-md text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
            پرداخت با موفقیت انجام شد
          </span>
          <h1 className="text-xl md:text-2xl font-black text-dk-dark">
            سفارش شما با موفقیت ثبت و تایید شد!
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            سفارش شما وارد مرحله پردازش و آماده‌سازی انبار دیجی‌کالا گردید.
          </p>
        </div>

        {/* Order Details Highlight Box */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block mb-1">شماره اختصاصی سفارش:</span>
            <div className="flex items-center justify-center gap-1.5 font-mono font-black text-sm text-dk-dark">
              <span>{order.orderNumber}</span>
              <button onClick={copyTracking} className="text-gray-400 hover:text-dk-red" title="کپی">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">کد رهگیری تراکنش مالی:</span>
            <span className="font-mono font-bold text-emerald-700">{order.refId || 'REF-14030510'}</span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">مبلغ کل پرداخت شده:</span>
            <span className="font-black text-dk-dark text-sm">{formatToman(order.finalPrice)}</span>
          </div>
        </div>

        {/* Recipient Snapshot Box */}
        <div className="text-right bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-xs text-gray-700 space-y-1">
          <span className="font-bold text-emerald-900 block mb-1">اطلاعات تحویل‌گیرنده ثبت شده:</span>
          <div>تحویل به: <strong>{order.addressSnapshot.recipientName}</strong> ({order.addressSnapshot.recipientPhone})</div>
          <div>نشانی: {order.addressSnapshot.province}، {order.addressSnapshot.city}، {order.addressSnapshot.addressLine}</div>
          <div className="text-gray-400 font-mono text-[11px]">کد رهگیری پستی مرسوله: {order.postalTrackingCode}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={`/orders/track/${order.orderNumber}`}
            className="w-full sm:w-auto px-6 py-3 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>پیگیری وضعیت مرسوله در سامانه رهگیری</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی فروشگاه</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
