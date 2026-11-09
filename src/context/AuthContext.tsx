import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address } from '../types';
import { StorageManager } from '../data/storage';
import { demoUserCustomer, demoUserAdmin } from '../data/mockData';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  addresses: Address[];
  sendOtp: (phone: string) => { success: boolean; testCode: string; message: string };
  verifyOtp: (phone: string, code: string) => boolean;
  logout: () => void;
  switchDemoUser: (role: 'customer' | 'admin' | 'guest') => void;
  addAddress: (addr: Omit<Address, 'id'>) => Address;
  setDefaultAddress: (id: string) => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageManager.getCurrentUser());
  const [addresses, setAddresses] = useState<Address[]>(() => StorageManager.getAddresses());
  const { showToast } = useNotification();

  const refreshUserData = () => {
    setCurrentUser(StorageManager.getCurrentUser());
    setAddresses(StorageManager.getAddresses());
  };

  const sendOtp = (phone: string) => {
    // Iranian mobile regex
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return { success: false, testCode: '', message: 'لطفاً شماره موبایل ۱۱ رقمی معتبر وارد کنید (مثال: 09121112233).' };
    }

    // Deterministic mock test code for ease of demonstration
    const testCode = '12345';
    return {
      success: true,
      testCode,
      message: `کد تایید ۵ رقمی پیامک شد. (کد تستی شما: ${testCode})`,
    };
  };

  const verifyOtp = (phone: string, code: string): boolean => {
    if (code.trim() !== '12345') {
      showToast('کد تایید وارد شده نامعتبر است (کد آزمایشی: ۱۲۳۴۵)', 'error');
      return false;
    }

    // Check if phone matches known demo users
    let user: User;
    if (phone === '09120000000') {
      user = demoUserAdmin;
    } else if (phone === '09121112233') {
      user = demoUserCustomer;
    } else {
      user = {
        id: `usr-${Date.now()}`,
        phoneNumber: phone,
        username: `user_${phone.slice(-4)}`,
        firstName: 'کاربر',
        lastName: 'جدید',
        email: `${phone}@digikala.local`,
        isSeller: false,
        isStaff: false,
      };
    }

    StorageManager.setCurrentUser(user);
    setCurrentUser(user);
    showToast(`خوش آمدید، ${user.firstName} ${user.lastName}`, 'success');
    return true;
  };

  const logout = () => {
    StorageManager.setCurrentUser(null);
    setCurrentUser(null);
    showToast('با موفقیت از حساب کاربری خارج شدید.', 'info');
  };

  const switchDemoUser = (role: 'customer' | 'admin' | 'guest') => {
    StorageManager.switchUser(role);
    const updated = StorageManager.getCurrentUser();
    setCurrentUser(updated);
    if (role === 'customer') {
      showToast('ورود با حساب کاربری نمونه (سارا احمدی)', 'success');
    } else if (role === 'admin') {
      showToast('ورود با حساب مدیر ارشد سیستم و فروشنده رسمی', 'success');
    } else {
      showToast('حالت کاربر مهمان فعال شد', 'info');
    }
  };

  const addAddress = (addr: Omit<Address, 'id'>): Address => {
    const created = StorageManager.addAddress(addr);
    setAddresses(StorageManager.getAddresses());
    showToast('نشانی جدید با موفقیت ثبت شد.', 'success');
    return created;
  };

  const setDefaultAddress = (id: string) => {
    StorageManager.setDefaultAddress(id);
    setAddresses(StorageManager.getAddresses());
    showToast('نشانی پیش‌فرض تحویل تغییر کرد.', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: !!currentUser?.isStaff,
        isSeller: !!currentUser?.isSeller,
        addresses,
        sendOtp,
        verifyOtp,
        logout,
        switchDemoUser,
        addAddress,
        setDefaultAddress,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
