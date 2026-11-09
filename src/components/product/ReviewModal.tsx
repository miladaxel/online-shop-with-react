import React, { useState } from 'react';
import { Star, X, Plus, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { StorageManager } from '../../data/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface ReviewModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ product, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [posInput, setPosInput] = useState('');
  const [positivePoints, setPositivePoints] = useState<string[]>([]);
  const [negInput, setNegInput] = useState('');
  const [negativePoints, setNegativePoints] = useState<string[]>([]);

  const handleAddPositive = () => {
    if (posInput.trim()) {
      setPositivePoints([...positivePoints, posInput.trim()]);
      setPosInput('');
    }
  };

  const handleAddNegative = () => {
    if (negInput.trim()) {
      setNegativePoints([...negativePoints, negInput.trim()]);
      setNegInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      showToast('لطفاً عنوان و متن نظر خود را تکمیل نمایید.', 'error');
      return;
    }

    StorageManager.addReview({
      productId: product.id,
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'کاربر مهمان دیجی‌کالا',
      userPhone: currentUser?.phoneNumber || '09120000000',
      title: title.trim(),
      rating,
      comment: comment.trim(),
      positivePoints,
      negativePoints,
      isBuyer: true,
    });

    showToast('دیدگاه شما با موفقیت ثبت شد و به لیست نظرات افزوده گردید.', 'success');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-black text-dk-dark mb-1">ثبت دیدگاه و امتیاز خرید</h3>
        <p className="text-xs text-gray-400 mb-4 line-clamp-1">{product.titleFa}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">امتیاز شما به این محصول:</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-gray-600 mr-2">
                {rating === 5 && 'عالی و بی‌نقص'}
                {rating === 4 && 'خیلی خوب'}
                {rating === 3 && 'متوسط'}
                {rating === 2 && 'ضعیف'}
                {rating === 1 && 'خیلی ضعیف'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">عنوان دیدگاه:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: کیفیت ساخت بالا، فراتر از انتظار"
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 focus:border-dk-red focus:ring-4 focus:ring-red-100 outline-none"
              required
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">متن دیدگاه شما:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="نکات مثبت و منفی، تجربه کاربری و عملکرد واقعی محصول را با سایر خریداران در میان بگذارید..."
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 focus:border-dk-red focus:ring-4 focus:ring-red-100 outline-none"
              required
            />
          </div>

          {/* Positive Points */}
          <div>
            <label className="block text-xs font-bold text-emerald-700 mb-1">نکات مثبت (اختیاری):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={posInput}
                onChange={(e) => setPosInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPositive())}
                placeholder="مثال: باتری قدرتمند"
                className="flex-1 text-xs py-2 px-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddPositive}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> افزودن
              </button>
            </div>
            {positivePoints.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {positivePoints.map((pt, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-50 text-emerald-800 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <span>+ {pt}</span>
                    <button
                      type="button"
                      onClick={() => setPositivePoints(positivePoints.filter((_, i) => i !== idx))}
                      className="text-emerald-500 hover:text-emerald-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Negative Points */}
          <div>
            <label className="block text-xs font-bold text-red-700 mb-1">نکات منفی (اختیاری):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={negInput}
                onChange={(e) => setNegInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNegative())}
                placeholder="مثال: قیمت بالا در بازار"
                className="flex-1 text-xs py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
              />
              <button
                type="button"
                onClick={handleAddNegative}
                className="bg-red-50 text-dk-red hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> افزودن
              </button>
            </div>
            {negativePoints.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {negativePoints.map((pt, idx) => (
                  <span
                    key={idx}
                    className="bg-red-50 text-red-800 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <span>- {pt}</span>
                    <button
                      type="button"
                      onClick={() => setNegativePoints(negativePoints.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              ثبت نهایی دیدگاه
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
    </div>
  );
};
