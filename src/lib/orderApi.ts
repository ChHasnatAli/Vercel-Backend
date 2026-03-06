import type { OrderStatus } from "@/lib/orders";

const API_BASE_URL = import.meta.env.VITE_SYNC_API_URL ?? "http://localhost:4000";

export type SharedOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  paymentMethod: string;
  paymentStatus?: "pending" | "pending_verification" | "paid" | "cash_on_delivery";
  merchantWalletNumber?: string;
  paymentProof?: {
    transactionId: string;
    payerPhone: string;
    paidAmount: number;
    paidAt: string;
    screenshotDataUrl: string;
  } | null;
  transactionId?: string;
  payerPhone?: string;
  paidAmount?: number;
  paidAt?: string;
  screenshotDataUrl?: string;
  paymentVerifiedAt?: string | null;
  paymentVerifiedBy?: string | null;
  status: OrderStatus;
  subtotalAmount?: number;
  couponCode?: string | null;
  discountAmount?: number;
  feeAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  currency: string;
  origin: string;
  createdAt: string;
  items: Array<{
    productId: string;
    name: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export type CustomerSummary = {
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastOrderAt: string;
  status: "active" | "inactive";
};

function formatCurrency(amount: number, currency = "PKR") {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatOrderTotal(amount: number, currency = "PKR") {
  return `${currency === "PKR" ? "Rs" : currency} ${amount.toLocaleString()}.00`;
}

export function formatOrderDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleString();
}

export async function fetchSharedOrders(): Promise<SharedOrder[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders`);
  if (!response.ok) {
    throw new Error("Could not fetch shared orders");
  }
  const data = await response.json();
  return Array.isArray(data) ? (data as SharedOrder[]) : [];
}

export async function fetchSharedOrderById(id: string): Promise<SharedOrder | null> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Could not fetch order details");
  }
  return response.json();
}

export async function patchSharedOrderStatus(id: string, status: OrderStatus): Promise<SharedOrder> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    let message = "Could not update order status";
    try {
      const data = await response.json();
      if (data?.message) {
        message = String(data.message);
      }
    } catch {
      // ignore body parse errors and keep fallback message
    }
    throw new Error(message);
  }

  return response.json();
}

export async function patchSharedOrder(id: string, patch: {
  status?: OrderStatus;
  paymentMethod?: "cod" | "easypaisa_jazzcash";
  paymentStatus?: "pending" | "pending_verification" | "paid" | "cash_on_delivery";
  paymentProof?: {
    transactionId?: string;
    payerPhone?: string;
    paidAmount?: number;
    paidAt?: string;
    screenshotDataUrl?: string;
  };
  paymentVerifiedAt?: string | null;
  paymentVerifiedBy?: string | null;
  feeAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
}): Promise<SharedOrder> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    let message = "Could not update order details";
    try {
      const data = await response.json();
      if (data?.message) {
        message = String(data.message);
      }
    } catch {
      // ignore body parse errors and keep fallback message
    }
    throw new Error(message);
  }

  return response.json();
}

export async function createSharedOrder(input: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  paymentMethod?: string;
  status: OrderStatus;
  totalAmount: number;
  currency?: string;
  origin?: string;
  items?: Array<{
    productId?: string;
    name?: string;
    quantity?: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
}): Promise<SharedOrder> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Could not create order");
  }

  return response.json();
}

export function buildCustomerSummaries(orders: SharedOrder[]): CustomerSummary[] {
  const grouped = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const key = order.customerName.trim().toLowerCase() || "guest";
    const existing = grouped.get(key);
    const orderDate = new Date(order.createdAt);
    const safeDate = Number.isNaN(orderDate.getTime()) ? new Date(0) : orderDate;

    if (!existing) {
      grouped.set(key, {
        name: order.customerName || "Guest",
        email: order.customerEmail || "-",
        orders: 1,
        spent: order.totalAmount,
        lastOrderAt: order.createdAt,
        status: "active",
      });
      continue;
    }

    const prevDate = new Date(existing.lastOrderAt);
    existing.orders += 1;
    existing.spent += order.totalAmount;
    if (!Number.isNaN(safeDate.getTime()) && safeDate.getTime() > prevDate.getTime()) {
      existing.lastOrderAt = order.createdAt;
      if (order.customerEmail) {
        existing.email = order.customerEmail;
      }
    }
  }

  return Array.from(grouped.values())
    .map((customer) => ({
      ...customer,
      status: customer.orders > 0 ? "active" : "inactive",
      spent: Number(customer.spent.toFixed(2)),
    }))
    .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
}

export function formatCustomerSpend(amount: number) {
  return formatCurrency(amount, "PKR");
}