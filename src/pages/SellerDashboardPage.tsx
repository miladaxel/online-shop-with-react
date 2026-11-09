import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Edit3,
  Check,
  Plus,
  Save,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { StorageManager } from '../data/storage';
import { Product, ProductVariant, Seller } from '../types';
import { formatToman, toPersianDigits, getDiscountedPrice } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const SellerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  // Edit fields
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // New variant modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetProductId, setTargetProductId] = useState('');
  const [newColorName, setNewColorName] = useState('مشکی مات');
  const [newColorHex, setNewColorHex] = useState('#222222');
  const [newWarranty, setNewWarranty] = useState('۱۸ ماه گارانتی طلایی شرکتی');
  const [newPrice, setNewPrice] = useState(50000000);
  const [newDiscount, setNewDiscount] = useState(5);
  const [newStock, setNewStock] = useState(10);

  useEffect(() => {
    setProducts(StorageManager.getProducts());
  }, []);

  // Collect all variants
  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productTitle: p.titleFa, productSlug: p.slug, productImage: p.mainImage }))
  );

  const startEdit = (v: any) => {
    setEditingVariantId(v.id);
    setEditPrice(v.price);
    setEditDiscount(v.discountPercent);
    setEditStock(v.stock);
  };

  const saveEdit = (variantId: string) => {
    StorageManager.updateVariant(variantId, {
      price: editPrice,
      discountPercent: editDiscount,
      stock: editStock,
    });
    setProducts(StorageManager.getProducts());
    setEditingVariantId(null);
    showToast('قیمت و موجودی انبار با موفقیت به‌روزرسانی شد.', 'success');
  };

  const handleCreateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductId) {
      showToast('لطفاً یک محصول را از کاتالوگ انتخاب نمایید.', 'error');
      return;
    }

    try {
      StorageManager.addVariantToProduct(targetProductId, {
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        productId: targetProductId,
        sellerId: 'seller-official',
        colorName: newColorName,
        colorHex: newColorHex,
        warranty: newWarranty,
        price: newPrice,
        discountPercent: newDiscount,
        stock: newStock,
        isSpecialOffer: false,
      });

      setProducts(StorageManager.getProducts());
      setIsAddModalOpen(false);
      showToast('تنوع جدید کالا با موفقیت به انبار شما اضافه شد.', 'success');
    } catch (err) {
      showToast('خطا در ثبت تنوع کالا.', 'error');
    }
  };

  // KPIs
  const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
  const outOfStockCount = allVariants.filter((v) => v.stock === 0).length;
  const totalInventoryValue = allVariants.reduce((sum, v) => sum + v.price * v.stock, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 backdrop-blur-sm border border-white/20">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black">مرکز مدیریت فروشندگان دیجی‌کالا (Seller Center)</h1>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-bold">
                فعال
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              مدیریت لحظه‌ای موجودی انبار، به‌روزرسانی قیمت تنوع‌ها و عرضه کالا در مارکت‌پلیس
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setTargetProductId(products[0]?.id || '');
            setIsAddModalOpen(true);
          }}
          className="py-3 px-5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-700" />
          <span>افزودن تنوع و قیمت‌گذاری کالا</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-dk-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold block">ارزش کالاهای موجود در انبار:</span>
            <span className="text-base font-black text-dk-dark">{formatToman(totalInventoryValue)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-dk-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold block">مجموع موجودی اقلام فیزیکی:</span>
            <span className="text-base font-black text-dk-dark">{toPersianDigits(totalStock)} عدد</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-dk-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold block">کالاهای ناموجود (هشدار شارژ):</span>
            <span className="text-base font-black text-red-600">{toPersianDigits(outOfStockCount)} تنوع</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-dk-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold block">شاخص رضایت خریداران:</span>
            <span className="text-base font-black text-dk-dark">۴.۹ از ۵ (عالی)</span>
          </div>
        </div>
      </div>

      {/* Inventory Management Table */}
      <div className="bg-white rounded-3xl border border-dk-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-dk-dark">مدیریت انبار و تنوع‌های فروشنده</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              امکان ویرایش آنی قیمت، درصد تخفیف شگفت‌انگیز و تعداد موجودی در انبار
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                <th className="p-4">کالا و تنوع</th>
                <th className="p-4">فروشنده</th>
                <th className="p-4">گارانتی</th>
                <th className="p-4">قیمت خام (تومان)</th>
                <th className="p-4">تخفیف (%)</th>
                <th className="p-4">موجودی انبار</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allVariants.map((v) => {
                const isEditing = editingVariantId === v.id;

                return (
                  <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Product & Variant */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.productImage}
                          alt={v.productTitle}
                          className="w-12 h-12 object-contain rounded-xl border border-gray-100 shrink-0"
                        />
                        <div>
                          <Link
                            to={`/product/${v.productSlug}`}
                            className="font-bold text-dk-dark hover:text-dk-red line-clamp-1 max-w-xs"
                          >
                            {v.productTitle}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                            <span
                              style={{ backgroundColor: v.colorHex }}
                              className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block"
                            />
                            <span>{v.colorName}</span>
                            <span>•</span>
                            <span className="font-mono">{v.sku}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="p-4 font-bold text-gray-700">{v.seller?.storeName || 'دیجی‌کالا'}</td>

                    {/* Warranty */}
                    <td className="p-4 text-gray-500">{v.warranty}</td>

                    {/* Price */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-32 py-1.5 px-2.5 rounded-lg border border-dk-red font-mono text-xs font-bold outline-none"
                        />
                      ) : (
                        <span className="font-black font-mono text-dk-dark">{formatToman(v.price)}</span>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editDiscount}
                          onChange={(e) => setEditDiscount(Number(e.target.value))}
                          className="w-16 py-1.5 px-2 rounded-lg border border-dk-red font-mono text-xs font-bold text-center outline-none"
                        />
                      ) : (
                        <span className="font-bold font-mono text-dk-red">
                          {v.discountPercent > 0 ? `${toPersianDigits(v.discountPercent)}٪` : '—'}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-20 py-1.5 px-2 rounded-lg border border-dk-red font-mono text-xs font-bold text-center outline-none"
                        />
                      ) : (
                        <span
                          className={`font-black font-mono px-2 py-0.5 rounded-md ${
                            v.stock > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-600 font-bold'
                          }`}
                        >
                          {toPersianDigits(v.stock)} عدد
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => saveEdit(v.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            title="ذخیره تغییرات"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingVariantId(null)}
                            className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                            title="انصراف"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(v)}
                          className="p-1.5 bg-gray-100 hover:bg-dk-red hover:text-white rounded-lg text-gray-600 transition-colors"
                          title="ویرایش قیمت و موجودی"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Variant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <h3 className="text-base font-black text-dk-dark mb-1">افزودن تنوع جدید به کاتالوگ دیجی‌کالا</h3>
            <p className="text-xs text-gray-500 mb-4">
              انتخاب محصول موجود و تعریف رنگ، گارانتی، قیمت و موجودی انبار
            </p>

            <form onSubmit={handleCreateVariant} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">انتخاب کالا از کاتالوگ:</label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titleFa.slice(0, 60)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">نام رنگ:</label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">کد رنگ (HEX):</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-10 h-8 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="flex-1 py-1.5 px-2 rounded-xl border border-gray-200 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">شرکت و شرایط گارانتی:</label>
                <input
                  type="text"
                  value={newWarranty}
                  onChange={(e) => setNewWarranty(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">قیمت (تومان):</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">تخفیف (%):</label>
                  <input
                    type="number"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">موجودی انبار:</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 font-mono text-center font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all"
                >
                  ثبت تنوع در فروشگاه
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
