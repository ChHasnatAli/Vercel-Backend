const API_BASE_URL = import.meta.env.VITE_SYNC_API_URL ?? "http://localhost:4000";

export type SharedCoupon = {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  value: number;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchCoupons(): Promise<SharedCoupon[]> {
  const response = await fetch(`${API_BASE_URL}/api/coupons`);
  if (!response.ok) {
    throw new Error("Could not load coupons");
  }
  const data = await response.json();
  return Array.isArray(data) ? (data as SharedCoupon[]) : [];
}

export async function createOrUpdateCoupon(input: {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number | null;
  maxOrderAmount?: number | null;
  usageLimit?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/api/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "Could not save coupon");
  }

  return (await response.json()) as SharedCoupon;
}