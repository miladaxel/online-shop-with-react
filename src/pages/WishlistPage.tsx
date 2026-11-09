import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { StorageManager } from '../data/storage';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { formatToman, toPersianDigits, getDiscountedPrice } from '../utils/formatters';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const allProducts = StorageManager.getProducts();

  const favoriteProducts: Product[] = wishlistIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-dk-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-dk-red flex items-center justify-center">
            <Heart className="w-5 h-5 fill-dk-red" />
          </div>
          <div>
            <h1 className="text-xl font-black text-dk-dark">لیست علاقه‌مندی‌های من</h1>
            <span className="text-xs text-gray-400">
              {toPersianDigits(favoriteProducts.length)} کالا برای خرید بعدی نشانه‌گذاری شده است
            </span>
          </div>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dk-border shadow-sm">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-base font-black text-dk-dark mb-1">لیست علاقه‌مندی‌های شما خالی است</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            با کلیک روی آیکون قلب روی هر کالا، می‌توانید آن را به این لیست اضافه کنید تا بعداً راحت‌تر بیابید.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl transition-all"
          >
            <span>مشاهده کاتالوگ محصولات</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {favoriteProducts.map((product) => {
            const defaultVar = product.variants[0];
            const finalP = defaultVar ? getDiscountedPrice(defaultVar.price, defaultVar.discountPercent) : 0;
            const isOut = !defaultVar || defaultVar.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-4 border border-dk-border hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="text-gray-400 hover:text-dk-red p-1 rounded-lg transition-colors"
                      title="حذف از علاقه‌مندی‌ها"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link to={`/product/${product.slug}`} className="block mb-3">
                    <img
                      src={product.mainImage}
                      alt={product.titleFa}
                      className="w-full h-40 object-contain hover:scale-105 transition-transform"
                    />
                  </Link>

                  <Link
                    to={`/product/${product.slug}`}
                    className="text-xs font-black text-dk-dark line-clamp-2 hover:text-dk-red transition-colors mb-2"
                  >
                    {product.titleFa}
                  </Link>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-2 space-y-3">
                  <div className="text-left font-black text-sm text-dk-dark">
                    {defaultVar ? formatToman(finalP) : 'ناموجود'}
                  </div>

                  {!isOut && defaultVar ? (
                    <button
                      onClick={() => addToCart(defaultVar.id, product.id, 1)}
                      className="w-full py-2.5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>افزودن به سبد خرید</span>
                    </button>
                  ) : (
                    <span className="w-full py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl text-center block">
                      ناموجود در انبار
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
