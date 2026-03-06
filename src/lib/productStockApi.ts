const DEFAULT_SYNC_API_URL = "http://localhost:4000";
const envSyncApiUrl = import.meta.env.VITE_SYNC_API_URL;
const API_BASE_URL = typeof envSyncApiUrl === "string" && envSyncApiUrl.trim().length > 0
  ? envSyncApiUrl.trim().replace(/\/+$/, "")
  : DEFAULT_SYNC_API_URL;

export type ProductStockMap = Record<string, boolean>;

export async function fetchProductStockMap(): Promise<ProductStockMap> {
  const response = await fetch(`${API_BASE_URL}/api/products/stock`);
  if (!response.ok) {
    throw new Error("Could not load product stock map");
  }

  const payload = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return payload as ProductStockMap;
}

export async function updateProductOutOfStock(productId: string, isOutOfStock: boolean) {
  const response = await fetch(`${API_BASE_URL}/api/products/stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, isOutOfStock }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "Could not save product stock state");
  }

  return response.json() as Promise<{ productId: string; isOutOfStock: boolean }>;
}
