export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
}

const COUPONS_KEY = "dashboard_admin_coupons";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getCoupons(): Coupon[] {
  if (!hasWindow()) return [];

  try {
    const raw = window.localStorage.getItem(COUPONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Coupon[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCoupon(code: string, discountPercent: number): Coupon[] {
  if (!hasWindow()) return [];

  const normalizedCode = code.trim().toUpperCase();
  const cleanedDiscount = Math.min(Math.max(discountPercent, 1), 100);
  const existing = getCoupons();
  const next: Coupon[] = [];
  let replaced = false;

  for (const coupon of existing) {
    if (coupon.code === normalizedCode) {
      next.push({ code: normalizedCode, discountPercent: cleanedDiscount, active: true });
      replaced = true;
    } else {
      next.push(coupon);
    }
  }

  if (!replaced) {
    next.push({ code: normalizedCode, discountPercent: cleanedDiscount, active: true });
  }

  window.localStorage.setItem(COUPONS_KEY, JSON.stringify(next));
  return next;
}

export function findActiveCoupon(code: string): Coupon | null {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return null;
  const coupon = getCoupons().find((item) => item.code === normalizedCode && item.active);
  return coupon ?? null;
}
