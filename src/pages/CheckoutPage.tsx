import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  Plus,
  Check,
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  Building,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { StorageManager } from '../data/storage';
import { Order, OrderItem, Address } from '../types';
import { formatToman, toPersianDigits, getDiscountedPrice } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, addresses, addAddress, setDefaultAddress, switchDemoUser } = useAuth();
  const { items, totalRawPrice, totalProductsDiscount, couponDiscount, appliedCoupon, shippingCost, finalPrice, clearCart } = useCart();
  const { showToast } = useNotification();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const def = addresses.find((a) => a.isDefault);
    return def ? def.id : addresses[0]?.id || '';
  });

  const [shippingMethod, setShippingMethod] = useState<'EXPRESS' | 'REGULAR'>('EXPRESS');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address Form State
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState(currentUser?.phoneNumber || '');
  const [newProvince, setNewProvince] = useState('تهران');
  const [newCity, setNewCity] = useState('تهران');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newBuildingNumber, setNewBuildingNumber] = useState('');
  const [newUnit, setNewUnit] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-black text-dk-dark mb-2">سبد خرید شما خالی است</h2>
        <p className="text-xs text-gray-500 mb-4">برای ادامه فرایند پرداخت ابتدا محصولی به سبد خود اضافه کنید.</p>
        <Link to="/catalog" className="px-5 py-2.5 bg-dk-red text-white text-xs font-bold rounded-xl inline-block">
          مشاهده کاتالوگ محصولات
        </Link>
      </div>
    );
  }

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientName || !newAddressLine || !newPostalCode) {
      showToast('لطفاً اطلاعات ضروری آدرس را تکمیل کنید.', 'error');
      return;
    }

    const created = addAddress({
      recipientName: newRecipientName,
      recipientPhone: newRecipientPhone,
      province: newProvince,
      city: newCity,
      postalCode: newPostalCode,
      addressLine: newAddressLine,
      buildingNumber: newBuildingNumber,
      unit: newUnit,
      isDefault: false,
    });

    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      showToast('لطفاً یک آدرس تحویل سفارش انتخاب نمایید.', 'error');
      return;
    }

    // Atomic Snapshot creation (Address snapshot + Item variant snapshots)
    const orderItems: OrderItem[] = items.map((item) => {
      const v = item.variant!;
      const p = item.product!;
      const unitFinal = getDiscountedPrice(v.price, v.discountPercent);

      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        variantId: v.id,
        productSlug: p.slug,
        productTitle: p.titleFa,
        sellerName: v.seller?.storeName || 'دیجی‌کالا',
        colorName: v.colorName,
        colorHex: v.colorHex,
        warranty: v.warranty,
        unitRawPrice: v.price,
        unitFinalPrice: unitFinal,
        quantity: item.quantity,
        totalPrice: unitFinal * item.quantity,
        image: p.mainImage,
      };
    });

    // Generate readable random order number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `DK-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userPhone: currentUser?.phoneNumber || '09121112233',
      status: 'PENDING_PAYMENT',
      shippingMethod,
      shippingCost,
      totalRawPrice,
      totalProductsDiscount,
      couponDiscount,
      couponCode: appliedCoupon?.code,
      finalPrice,
      postalTrackingCode: `IRP${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      createdAt: new Date().toISOString(),
      addressSnapshot: {
        recipientName: selectedAddress.recipientName,
        recipientPhone: selectedAddress.recipientPhone,
        province: selectedAddress.province,
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode,
        addressLine: selectedAddress.addressLine,
        buildingNumber: selectedAddress.buildingNumber,
        unit: selectedAddress.unit,
      },
      items: orderItems,
    };

    StorageManager.addOrder(newOrder);

    if (appliedCoupon) {
      StorageManager.useCoupon(appliedCoupon.code);
    }

    // Redirect to mock bank gateway
    navigate(`/payment/gateway/${orderNumber}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Checkout Steps Bar */}
      <div className="bg-white rounded-3xl p-6 border border-dk-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-dk-dark">نهایی‌سازی سفارش و اطلاعات تحویل</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            ثبت اتمیک سفارش با فریز نشانی خریدار (Address Snapshot) و جزئیات قیمت اقلام
          </p>
        </div>

        {/* Demo User Fast Switch Reminder */}
        {!isAuthenticated && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-2xl text-xs">
            <span>برای تجربه بهتر:</span>
            <button
              onClick={() => switchDemoUser('customer')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-xl transition-colors"
            >
              ورود سریع با سارا احمدی (مشتری دمو)
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Addresses & Shipping (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Address Selection */}
          <div className="bg-white rounded-3xl p-6 border border-dk-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-dk-dark flex items-center gap-2">
                <MapPin className="w-4 h-4 text-dk-red" />
                <span>۱. نشانی تحویل سفارش</span>
              </h3>
              <button
                onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                className="text-xs font-bold text-dk-red hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن نشانی جدید</span>
              </button>
            </div>

            {/* Address Radios */}
            <div className="space-y-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-dk-red bg-red-50/40 ring-1 ring-red-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-dk-red bg-dk-red text-white' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-dk-dark">{addr.recipientName}</span>
                        <span className="text-gray-400">({addr.recipientPhone})</span>
                        {addr.isDefault && (
                          <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded text-[10px]">
                            پیش‌فرض
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {addr.province}، {addr.city}، {addr.addressLine}
                        {addr.buildingNumber ? `، پلاک ${addr.buildingNumber}` : ''}
                        {addr.unit ? `، واحد ${addr.unit}` : ''}
                      </p>
                      <div className="text-[11px] text-gray-400 font-mono">
                        کد پستی: {toPersianDigits(addr.postalCode)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Address Form */}
            {isAddingNewAddress && (
              <form onSubmit={handleSaveAddress} className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-fadeIn">
                <h4 className="text-xs font-black text-dk-dark">ثبت نشانی گیرنده جدید</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">نام و نام خانوادگی گیرنده:</label>
                    <input
                      type="text"
                      value={newRecipientName}
                      onChange={(e) => setNewRecipientName(e.target.value)}
                      placeholder="مثال: رضا محمدی"
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">شماره تماس گیرنده:</label>
                    <input
                      type="text"
                      value={newRecipientPhone}
                      onChange={(e) => setNewRecipientPhone(e.target.value)}
                      placeholder="09121112233"
                      dir="ltr"
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">استان:</label>
                    <input
                      type="text"
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">شهر:</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">نشانی پستی دقیق:</label>
                    <textarea
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      placeholder="خیابان، کوچه، پلاک، واحد..."
                      rows={2}
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">کد پستی (۱۰ رقمی):</label>
                    <input
                      type="text"
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      placeholder="1458963214"
                      dir="ltr"
                      maxLength={10}
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">واحد / پلاک:</label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="واحد ۴"
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-dk-red outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2 px-5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    ثبت این آدرس
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Shipping Method Selection */}
          <div className="bg-white rounded-3xl p-6 border border-dk-border shadow-xs space-y-4">
            <h3 className="text-sm font-black text-dk-dark flex items-center gap-2 pb-3 border-b border-gray-100">
              <Truck className="w-4 h-4 text-blue-500" />
              <span>۲. نحوه و زمان ارسال سفارش</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setShippingMethod('EXPRESS')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  shippingMethod === 'EXPRESS'
                    ? 'border-dk-red bg-red-50/40 ring-1 ring-red-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    shippingMethod === 'EXPRESS' ? 'border-dk-red bg-dk-red text-white' : 'border-gray-300'
                  }`}
                >
                  {shippingMethod === 'EXPRESS' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-black text-dk-dark block">ارسال اکسپرس دیجی‌کالا</span>
                  <p className="text-gray-500">تحویل سریع با ناوگان اختصاصی دیجی‌کالا در شیفت صبح یا عصر</p>
                  <span className="text-[11px] font-bold text-emerald-600 block">
                    {shippingCost === 0 ? 'رایگان' : formatToman(shippingCost)}
                  </span>
                </div>
              </div>

              <div
                onClick={() => setShippingMethod('REGULAR')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  shippingMethod === 'REGULAR'
                    ? 'border-dk-red bg-red-50/40 ring-1 ring-red-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    shippingMethod === 'REGULAR' ? 'border-dk-red bg-dk-red text-white' : 'border-gray-300'
                  }`}
                >
                  {shippingMethod === 'REGULAR' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-black text-dk-dark block">پست پیشتاز سراسری</span>
                  <p className="text-gray-500">ارسال توسط شرکت ملی پست جمهوری اسلامی ایران (۲ تا ۴ روز کاری)</p>
                  <span className="text-[11px] font-bold text-emerald-600 block">
                    {shippingCost === 0 ? 'رایگان' : formatToman(shippingCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Order Items Snapshot & Payment Action (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-dk-border shadow-sm space-y-4">
            <h3 className="text-sm font-black text-dk-dark pb-3 border-b border-gray-100">
              اقلام سفارش (Snapshot)
            </h3>

            {/* Miniature items list */}
            <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 text-xs">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.product?.mainImage}
                    alt={item.product?.titleFa}
                    className="w-12 h-12 object-contain rounded-xl border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-dk-dark line-clamp-1">{item.product?.titleFa}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {toPersianDigits(item.quantity)} عدد × {item.variant?.colorName}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span>قیمت کالاها:</span>
                <span>{formatToman(totalRawPrice)}</span>
              </div>
              {totalProductsDiscount > 0 && (
                <div className="flex items-center justify-between text-dk-red">
                  <span>تخفیف شگفت‌انگیز:</span>
                  <span>({formatToman(totalProductsDiscount)}) -</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>تخفیف کوپن:</span>
                  <span>({formatToman(couponDiscount)}) -</span>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-500">
                <span>هزینه حمل و ارسال:</span>
                <span>{shippingCost === 0 ? 'رایگان' : formatToman(shippingCost)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">مبلغ نهایی پرداختی:</span>
              <span className="text-lg font-black text-dk-red">{formatToman(finalPrice)}</span>
            </div>

            {/* Payment Button */}
            <button
              onClick={handleProceedToPayment}
              className="w-full py-3.5 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>پرداخت و ثبت نهایی سفارش</span>
            </button>

            <div className="text-center">
              <span className="text-[10px] text-gray-400">
                انتقال به درگاه شبیه‌سازی شده پرداخت اینترنتی شاپرک
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
