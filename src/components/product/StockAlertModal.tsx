import React, { useState } from 'react';
import { BellRing, X, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';
import { StorageManager } from '../../data/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface StockAlertModalProps {
  product: Product | null;
  onClose: () => void;
}

export const StockAlertModal: React.FC<StockAlertModalProps> = ({ product, onClose }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      showToast('لطفاً شماره موبایل ۱۱ رقمی معتبر وارد نمایید.', 'error');
      return;
    }

    StorageManager.addStockAlert(product.id, product.titleFa, phone.trim());
    setIsSubmitted(true);
    showToast('درخواست اطلاع‌رسانی موجودی کالا با موفقیت ثبت شد.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-dk-red flex items-center justify-center mb-4">
              <BellRing className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-dk-dark mb-1">موجود شد به من خبر بده!</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              به محض شارژ مجدد و موجود شدن کالای <strong className="text-dk-dark">«{product.titleFa}»</strong> در انبار، از طریق پیامک به شما اطلاع داده خواهد شد.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  شماره موبایل جهت دریافت پیامک:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09121112233"
                  dir="ltr"
                  maxLength={11}
                  className="w-full text-center tracking-widest text-sm font-mono py-2.5 px-4 rounded-xl border border-gray-200 focus:border-dk-red focus:ring-4 focus:ring-red-100 outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  ثبت اطلاع‌رسانی پیامکی
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-black text-dk-dark mb-1">درخواست شما با موفقیت ثبت شد</h3>
            <p className="text-xs text-gray-500 mb-6">
              به شماره {phone} به محض موجود شدن این کالا پیامک ارسال خواهد شد.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl transition-all"
            >
              متوجه شدم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
