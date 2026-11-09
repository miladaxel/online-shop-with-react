// Persian Digit Translation
export const toPersianDigits = (n: number | string): string => {
  if (n === null || n === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
};

// Format currency with separator and 'تومان'
export const formatToman = (amount: number, withSuffix: boolean = true): string => {
  if (isNaN(amount)) return '۰' + (withSuffix ? ' تومان' : '');
  const formatted = Math.round(amount).toLocaleString('fa-IR');
  return withSuffix ? `${formatted} تومان` : formatted;
};

// Calculate final discounted price
export const getDiscountedPrice = (price: number, discountPercent: number): number => {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100));
};

// Persian Date Helper
export const formatPersianDate = (dateString?: string): string => {
  if (!dateString) return 'همین لحظه';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Simple relative time in Persian
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'دقایقی پیش';
  try {
    const diffHours = Math.round((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'چند دقیقه پیش';
    if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
    const diffDays = Math.round(diffHours / 24);
    return `${toPersianDigits(diffDays)} روز پیش`;
  } catch {
    return 'به‌تازگی';
  }
};
