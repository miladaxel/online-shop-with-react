import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  MapPin,
  Package,
  BellRing,
  Check,
  Plus,
  Shield,
  Store,
  ExternalLink,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageManager } from '../data/storage';
import { formatToman, toPersianDigits, formatPersianDate } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { currentUser, addresses, setDefaultAddress, addAddress, switchDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'alerts'>('orders');

  const orders = StorageManager.getOrders().filter(
    (o) => !currentUser || o.userPhone === currentUser.phoneNumber || currentUser.isStaff
  );
  const stockAlerts = StorageManager.getStockAlerts();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-black text-dk-dark mb-2">شما وارد سیستم نشده‌اید</h2>
        <p className="text-xs text-gray-500 mb-4">برای مشاهده پروفایل و سفارشات ابتدا وارد حساب کاربری خود شوید.</p>
        <Link to="/login" className="px-5 py-2.5 bg-dk-red text-white text-xs font-bold rounded-xl inline-block">
          ورود به حساب کاربری
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header Box */}
      <div className="bg-white rounded-3xl p-6 border border-dk-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-dk-red flex items-center justify-center font-black text-2xl shadow-inner">
            {currentUser.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-dk-dark">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              {currentUser.isStaff && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Shield className="w-3 h-3" /> مدیر ارشد
                </span>
              )}
              {currentUser.isSeller && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Store className="w-3 h-3" /> فروشنده دیجی‌کالا
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-3 mt-1 font-mono">
              <span>{currentUser.phoneNumber}</span>
              <span>•</span>
              <span>{currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Quick actions & switch */}
        <div className="flex items-center gap-2">
          {currentUser.isSeller && (
            <Link
              to="/seller"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>داشبورد فروشندگان</span>
            </Link>
          )}

          <button
            onClick={() => switchDemoUser(currentUser.phoneNumber === '09120000000' ? 'customer' : 'admin')}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
          >
            سوئیچ به {currentUser.phoneNumber === '09120000000' ? 'سارا احمدی' : 'مدیر سیستم'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-dk-border shadow-sm space-y-6">
        {/* Tab Headers */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`text-xs md:text-sm font-black pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'text-dk-red' : 'text-gray-500 hover:text-dk-dark'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>سفارشات من ({toPersianDigits(orders.length)})</span>
            {activeTab === 'orders' && <span className="absolute bottom-0 right-0 left-0 h-1 bg-dk-red rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`text-xs md:text-sm font-black pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'addresses' ? 'text-dk-red' : 'text-gray-500 hover:text-dk-dark'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>نشانی‌های ثبت‌شده ({toPersianDigits(addresses.length)})</span>
            {activeTab === 'addresses' && <span className="absolute bottom-0 right-0 left-0 h-1 bg-dk-red rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`text-xs md:text-sm font-black pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'alerts' ? 'text-dk-red' : 'text-gray-500 hover:text-dk-dark'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>اعلان‌های موجودی ({toPersianDigits(stockAlerts.length)})</span>
            {activeTab === 'alerts' && <span className="absolute bottom-0 right-0 left-0 h-1 bg-dk-red rounded-full" />}
          </button>
        </div>

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-dk-dark">{ord.orderNumber}</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {ord.status === 'PROCESSING' && 'در حال پردازش در انبار'}
                        {ord.status === 'PACKAGING' && 'در حال بسته‌بندی'}
                        {ord.status === 'SHIPPED' && 'تحویل داده شده به پست'}
                        {ord.status === 'DELIVERED' && 'تحویل به مشتری'}
                        {ord.status === 'CANCELLED' && 'لغو شده'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500">
                      <span>{formatPersianDate(ord.createdAt)}</span>
                      <span className="font-black text-dk-dark">{formatToman(ord.finalPrice)}</span>
                      <Link
                        to={`/orders/track/${ord.orderNumber}`}
                        className="text-xs font-bold text-dk-red hover:underline flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>رهگیری مرسوله</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items miniature */}
                  <div className="flex flex-wrap items-center gap-3">
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 text-xs">
                        <img src={item.image} alt={item.productTitle} className="w-10 h-10 object-contain rounded" />
                        <div>
                          <div className="font-bold text-dk-dark line-clamp-1 max-w-[200px]">{item.productTitle}</div>
                          <span className="text-[10px] text-gray-400">
                            {toPersianDigits(item.quantity)} عدد × {item.colorName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">سفارشی در تاریخچه شما ثبت نشده است.</p>
            )}
          </div>
        )}

        {/* Tab Content: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-dk-dark">{addr.recipientName}</span>
                    {addr.isDefault ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        پیش‌فرض
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-xs font-bold text-dk-red hover:underline"
                      >
                        انتخاب به عنوان پیش‌فرض
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {addr.province}، {addr.city}، {addr.addressLine}
                    {addr.buildingNumber ? `، پلاک ${addr.buildingNumber}` : ''}
                    {addr.unit ? `، واحد ${addr.unit}` : ''}
                  </p>
                  <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-200">
                    <span>کد پستی: {toPersianDigits(addr.postalCode)}</span>
                    <span>شماره تماس: {addr.recipientPhone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Stock Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {stockAlerts.map((alt) => (
              <div key={alt.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-dk-red flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-dk-dark block">{alt.productTitle}</span>
                    <span className="text-[11px] text-gray-400">پیامک اطلاع‌رسانی به شماره {alt.phone}</span>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-1 rounded-md">
                  در انتظار شارژ انبار
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
