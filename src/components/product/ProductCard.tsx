import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, ShoppingCart, Star, BellRing } from 'lucide-react';
import { Product } from '../../types';
import { formatToman, toPersianDigits, getDiscountedPrice } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

interface ProductCardProps {
  product: Product;
  onOpenStockAlert?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenStockAlert }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();

  const isFavorite = isInWishlist(product.id);
  const isComparing = isInCompare(product.id);

  // Default variant is usually the first variant or the one with lowest price / in stock
  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const defaultVariant = inStockVariants[0] || product.variants[0];
  const isOutOfStock = !inStockVariants.length || (defaultVariant && defaultVariant.stock <= 0);

  const discountPercent = defaultVariant?.discountPercent || 0;
  const rawPrice = defaultVariant?.price || 0;
  const finalPrice = getDiscountedPrice(rawPrice, discountPercent);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant && !isOutOfStock) {
      addToCart(defaultVariant.id, product.id, 1);
    }
  };

  const handleStockAlertClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenStockAlert) {
      onOpenStockAlert(product);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-dk-border hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4 relative overflow-hidden">
      {/* Top badges & quick actions */}
      <div className="flex items-start justify-between gap-2 mb-2 z-10">
        <div className="flex flex-col gap-1 items-start">
          {product.isOriginal && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
              ضمانت اصل بودن
            </span>
          )}
          {defaultVariant?.isSpecialOffer && (
            <span className="text-[10px] font-bold bg-rose-50 text-dk-red px-2 py-0.5 rounded-md">
              شگفت‌انگیز
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 rounded-full border transition-colors ${
              isFavorite
                ? 'bg-red-50 border-red-200 text-dk-red'
                : 'bg-white border-gray-200 text-gray-400 hover:text-dk-red hover:border-red-200'
            }`}
            title="افزودن به علاقه‌مندی‌ها"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-dk-red' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCompare(product.id);
            }}
            className={`p-1.5 rounded-full border transition-colors ${
              isComparing
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200'
            }`}
            title="مقایسه این کالا"
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} className="flex flex-col items-center mb-4">
        <div className="w-full h-48 flex items-center justify-center p-2 overflow-hidden">
          <img
            src={product.mainImage}
            alt={product.titleFa}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Color swatches */}
        {product.variants.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.variants.slice(0, 4).map((v) => (
              <span
                key={v.id}
                style={{ backgroundColor: v.colorHex }}
                className="w-3 h-3 rounded-full border border-gray-300 inline-block shadow-xs"
                title={v.colorName}
              />
            ))}
            {product.variants.length > 4 && (
              <span className="text-[10px] text-gray-400 font-bold">
                +{toPersianDigits(product.variants.length - 4)}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Product Meta */}
      <div className="flex flex-col gap-2">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-xs font-bold text-dk-dark line-clamp-2 leading-relaxed hover:text-dk-red transition-colors min-h-[38px]">
            {product.titleFa}
          </h3>
        </Link>

        {/* Rating and seller count */}
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-700">{toPersianDigits(product.rating)}</span>
            <span>({toPersianDigits(product.reviewCount)})</span>
          </div>
          <span className="text-[10px] text-gray-500">
            {product.variants.length > 1 ? `${toPersianDigits(product.variants.length)} فروشنده` : 'فروشنده رسمی'}
          </span>
        </div>

        {/* Price & Buy Button Row */}
        <div className="pt-2 border-t border-gray-100 mt-1 flex items-end justify-between">
          {isOutOfStock ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                ناموجود
              </span>
              <button
                onClick={handleStockAlertClick}
                className="flex items-center gap-1 text-xs font-bold text-dk-red hover:bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-200 transition-colors"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>خبرم کن</span>
              </button>
            </div>
          ) : (
            <>
              {/* Add to Cart icon */}
              <button
                onClick={handleQuickAdd}
                className="p-2 rounded-xl bg-red-50 hover:bg-dk-red text-dk-red hover:text-white transition-all shadow-xs"
                title="افزودن سریع به سبد خرید"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>

              {/* Price display */}
              <div className="text-left">
                {discountPercent > 0 && (
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <span className="bg-dk-red text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {toPersianDigits(discountPercent)}٪
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatToman(rawPrice, false)}
                    </span>
                  </div>
                )}
                <div className="text-sm font-black text-dk-dark">
                  {formatToman(finalPrice)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
