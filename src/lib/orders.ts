export type OrderStatus = "Pending payment" | "Processing" | "Completed" | "Cancelled";

export interface AdminOrder {
  id: string;
  customer: string;
  date: string;
  status: OrderStatus;
  total: string;
  origin: string;
  invoice: string;
}

const STORAGE_KEY = "infusion_orders";

const defaultOrders: AdminOrder[] = [
  { id: "5939", customer: "Aina Kiyani", date: "2 hours ago", status: "Pending payment", total: "Rs 1,600.00", origin: "Web admin", invoice: "" },
  { id: "5938", customer: "sadiq rizwan khan", date: "24 hours ago", status: "Completed", total: "Rs 1,500.00", origin: "Web admin", invoice: "INF_5938_i020326" },
  { id: "5933", customer: "Attock Pump", date: "Feb 21, 2026", status: "Pending payment", total: "Rs 32,950.00", origin: "Web admin", invoice: "INF_5933_210226" },
  { id: "5931", customer: "Muhammad Rasheed", date: "Feb 18, 2026", status: "Completed", total: "Rs 21,800.00", origin: "Web admin", invoice: "INF_5931_250226" },
  { id: "5929", customer: "Dr. S. Manan", date: "Feb 17, 2026", status: "Completed", total: "Rs 35,000.00", origin: "Web admin", invoice: "INF_5929_260226" },
  { id: "5928", customer: "Dagi c/o saqib", date: "Feb 14, 2026", status: "Pending payment", total: "Rs 6,100.00", origin: "Web admin", invoice: "" },
  { id: "5927", customer: "sorn c/o saqib", date: "Feb 14, 2026", status: "Completed", total: "Rs 9,000.00", origin: "Web admin", invoice: "INF_5927_260226" },
  { id: "5926", customer: "Madi c/o saqib", date: "Feb 14, 2026", status: "Pending payment", total: "Rs 5,500.00", origin: "Web admin", invoice: "" },
  { id: "5925", customer: "Ghulam Shabbir", date: "Feb 14, 2026", status: "Completed", total: "Rs 8,000.00", origin: "Organic Google", invoice: "INF_5925_130226" },
  { id: "5924", customer: "mujtaba c/o Saqi", date: "Feb 13, 2026", status: "Pending payment", total: "Rs 18,000.00", origin: "Web admin", invoice: "" },
];

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAllOrders(): AdminOrder[] {
  if (!isBrowser()) return defaultOrders;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders));
    return defaultOrders;
  }

  try {
    const parsed = JSON.parse(stored) as AdminOrder[];
    if (!Array.isArray(parsed)) throw new Error("Invalid storage format");
    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders));
    return defaultOrders;
  }
}

export function saveOrders(orders: AdminOrder[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function updateOrderById(id: string, patch: Partial<AdminOrder>): AdminOrder | null {
  const orders = getAllOrders();
  const index = orders.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: AdminOrder = { ...orders[index], ...patch, id: orders[index].id };
  const nextOrders = [...orders];
  nextOrders[index] = updated;
  saveOrders(nextOrders);
  return updated;
}

export function updateOrderStatus(id: string, status: OrderStatus): AdminOrder | null {
  return updateOrderById(id, { status });
}

export function createOrder(input: Omit<AdminOrder, "id">): AdminOrder {
  const orders = getAllOrders();
  const maxOrderId = orders.reduce((max, item) => {
    const current = Number(item.id);
    if (Number.isNaN(current)) return max;
    return Math.max(max, current);
  }, 5939);

  const created: AdminOrder = {
    id: String(maxOrderId + 1),
    ...input,
  };

  saveOrders([created, ...orders]);
  return created;
}

export function findOrderById(id: string): AdminOrder | undefined {
  return getAllOrders().find((item) => item.id === id);
}

export function listKnownCustomers(): string[] {
  const base = ["Aina Kiyani", "Saqib Rasheed", "sadiq rizwan khan", "Muhammad Rasheed"];
  const fromOrders = getAllOrders().map((item) => item.customer);
  return Array.from(new Set([...base, ...fromOrders]));
}
