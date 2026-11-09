import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Trash2, Plus, ShoppingCart, X, Check, ArrowRight } from 'lucide-react';
import { StorageManager } from '../data/storage';
import { Product } from '../types';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { formatToman, toPersianDigits, getDiscountedPrice } from '../utils/formatters';

export const ComparePage: React.FC = () => {
  const { compareIds, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const { addToCart } = useCart();
  const allProducts = StorageManager.getProducts();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Hydrate compared products
  const comparedProducts: Product[] = compareIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  // Available products to add
  const availableToAdd = allProducts.filter((p) => !compareIds.includes(p.id));

  // Extract common specification attributes across compared products
  const allSpecAttributeNames = Array.from(
    new Set(
      comparedProducts.flatMap((p) =>
        (p.specs || []).flatMap((group) => group.attributes.map((a) => a.name))
      )
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Box */}
      <div className="bg-white rounded-3xl p-6 border border-dk-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dk-dark flex items-center gap-2">
            <Scale className="w-6 h-6 text-dk-red" />
            <span>ماتریس مقایسه تخصصی کالاها</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            مقایسه فنی و ستونی ۲ تا ۴ محصول در کنار هم با بررسی مشخصات، قیمت و دکمه افزودن مستقیم به سبد خرید
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add product dropdown */}
          {compareIds.length < 4 && availableToAdd.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="py-2.5 px-4 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن کالا به مقایسه</span>
              </button>

              {isAddMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-dk-border py-2 z-50 animate-fadeIn divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400">کالای مورد نظر را انتخاب کنید:</div>
                  {availableToAdd.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        addToCompare(p.id);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full text-right p-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 transition-colors"
                    >
                      <img src={p.mainImage} alt={p.titleFa} className="w-10 h-10 object-contain rounded border shrink-0" />
                      <span className="font-bold line-clamp-1">{p.titleFa}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {compareIds.length > 0 && (
            <button
              onClick={clearCompare}
              className="py-2.5 px-4 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-dk-red text-xs font-bold rounded-xl border border-gray-200 transition-all flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>پاک‌کردن لیست</span>
            </button>
          )}
        </div>
      </div>

      {comparedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dk-border">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-black text-dk-dark mb-1">کالایی برای مقایسه انتخاب نشده است</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            برای بررسی تفاوت‌ها حداقل دو محصول را به این بخش اضافه کنید. برای شروع روی یکی از محصولات پیشنهادی زیر کلیک کنید:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {allProducts.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => addToCompare(p.id)}
                className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 text-xs font-bold text-dk-dark hover:text-dk-red transition-all"
              >
                + {p.titleFa.slice(0, 35)}...
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dk-border shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px] text-right">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="p-4 w-44 text-xs font-black text-gray-500">کالاهای انتخابی</th>
                {comparedProducts.map((p) => {
                  const defaultVar = p.variants[0];
                  const finalP = defaultVar ? getDiscountedPrice(defaultVar.price, defaultVar.discountPercent) : 0;
                  const isOut = !defaultVar || defaultVar.stock <= 0;

                  return (
                    <th key={p.id} className="p-4 align-top border-r border-gray-200 min-w-[240px] relative">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute top-3 left-3 p-1 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-dk-red transition-colors"
                        title="حذف از مقایسه"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex flex-col items-center text-center">
                        <Link to={`/product/${p.slug}`} className="block mb-2 group">
                          <img
                            src={p.mainImage}
                            alt={p.titleFa}
                            className="w-32 h-32 object-contain mx-auto group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        <Link
                          to={`/product/${p.slug}`}
                          className="text-xs font-black text-dk-dark line-clamp-2 hover:text-dk-red transition-colors mb-2"
                        >
                          {p.titleFa}
                        </Link>

                        <div className="text-sm font-black text-dk-red mb-3">
                          {defaultVar ? formatToman(finalP) : 'ناموجود'}
                        </div>

                        {!isOut && defaultVar ? (
                          <button
                            onClick={() => addToCart(defaultVar.id, p.id, 1)}
                            className="w-full py-2 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>افزودن به سبد</span>
                          </button>
                        ) : (
                          <span className="w-full py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl text-center block">
                            ناموجود
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {/* Row: Brand */}
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-500 bg-gray-50/70">برند</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-dk-dark border-r border-gray-100">
                    {p.brand?.nameFa} ({p.brand?.nameEn})
                  </td>
                ))}
              </tr>

              {/* Row: Category */}
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-500 bg-gray-50/70">دسته‌بندی</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-gray-700 border-r border-gray-100">
                    {p.category?.titleFa}
                  </td>
                ))}
              </tr>

              {/* Row: Variants & Colors */}
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-500 bg-gray-50/70">رنگ‌های عرضه شده</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 border-r border-gray-100">
                    <div className="flex flex-wrap gap-1.5">
                      {p.variants.map((v) => (
                        <span
                          key={v.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px]"
                        >
                          <span
                            style={{ backgroundColor: v.colorHex }}
                            className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block"
                          />
                          <span>{v.colorName}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Rating */}
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-500 bg-gray-50/70">امتیاز خریداران</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-amber-600 border-r border-gray-100">
                    {toPersianDigits(p.rating)} از ۵ ({toPersianDigits(p.reviewCount)} دیدگاه)
                  </td>
                ))}
              </tr>

              {/* Dynamic Technical Specs */}
              {allSpecAttributeNames.map((attrName, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-500 bg-gray-50/70">{attrName}</td>
                  {comparedProducts.map((p) => {
                    const matchVal = (p.specs || [])
                      .flatMap((g) => g.attributes)
                      .find((a) => a.name === attrName)?.value;

                    return (
                      <td key={p.id} className="p-4 text-dk-dark font-medium border-r border-gray-100">
                        {matchVal ? (
                          <span>{matchVal}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
