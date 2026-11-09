import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Phone, ArrowLeft, Check, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { toPersianDigits } from '../utils/formatters';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, switchDemoUser } = useAuth();
  const { showToast } = useNotification();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('09121112233');
  const [otpCode, setOtpCode] = useState('');
  const [testCodeHint, setTestCodeHint] = useState('');

  const handleSendPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const res = sendOtp(phone);
    if (res.success) {
      setTestCodeHint(res.testCode);
      setStep('OTP');
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOtp(phone, otpCode)) {
      navigate('/profile');
    }
  };

  const handleQuickDemo = (role: 'customer' | 'admin') => {
    switchDemoUser(role);
    navigate('/profile');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-dk-border shadow-xl space-y-6">
        {/* Digikala Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block bg-dk-red text-white font-black text-2xl px-4 py-1.5 rounded-xl shadow-sm">
            دیجی‌کالا
          </Link>
          <h1 className="text-lg font-black text-dk-dark">ورود | ثبت‌نام بدون رمزعبور (OTP)</h1>
          <p className="text-xs text-gray-400">
            {step === 'PHONE'
              ? 'شماره موبایل خود را جهت دریافت کد تایید پیامکی وارد نمایید.'
              : `کد ۵ رقمی ارسال‌شده به شماره ${phone} را وارد نمایید.`}
          </p>
        </div>

        {step === 'PHONE' ? (
          <form onSubmit={handleSendPhone} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">شماره موبایل:</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09121112233"
                  dir="ltr"
                  maxLength={11}
                  className="w-full text-center text-sm font-mono font-bold tracking-widest py-3 px-4 rounded-xl border border-gray-300 focus:border-dk-red focus:ring-4 focus:ring-red-100 outline-none"
                  required
                />
                <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>دریافت کد تایید ورود</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">کد تایید ۵ رقمی:</label>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-[11px] text-dk-red hover:underline"
                >
                  ویرایش شماره
                </button>
              </div>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="12345"
                dir="ltr"
                maxLength={5}
                className="w-full text-center text-lg font-mono font-black tracking-widest py-3 px-4 rounded-xl border border-gray-300 focus:border-dk-red focus:ring-4 focus:ring-red-100 outline-none"
                required
                autoFocus
              />
              {testCodeHint && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>کد آزمایشی شما: {testCodeHint}</span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(testCodeHint)}
                    className="mr-2 underline text-[11px] text-emerald-900"
                  >
                    (درج خودکار)
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-dk-red hover:bg-dk-red-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>تایید کد و ورود به سیستم</span>
            </button>
          </form>
        )}

        {/* Quick Demo Sign-in Box */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <span className="block text-[11px] text-gray-400 font-bold text-center">
            ورود سریع با حساب‌های آزمایشی آماده:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-dk-dark transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>سارا احمدی (مشتری)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-dk-dark transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>مدیر ارشد (Superuser)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
