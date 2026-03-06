const DEFAULT_SYNC_API_URL = "http://localhost:4000";
const envSyncApiUrl = import.meta.env.VITE_SYNC_API_URL;
const API_BASE_URL = typeof envSyncApiUrl === "string" && envSyncApiUrl.trim().length > 0
  ? envSyncApiUrl.trim().replace(/\/+$/, "")
  : DEFAULT_SYNC_API_URL;

export type RemoteStoreProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  originalPrice?: number;
  category: string;
  concerns?: string[];
  image: string;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function createStoreProduct(product: Omit<RemoteStoreProduct, "id"> & { id?: string }) {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "Could not save product");
  }

  return response.json() as Promise<RemoteStoreProduct>;
}

export async function fetchStoreProducts(): Promise<RemoteStoreProduct[]> {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error("Could not load products");
  }
  const payload = await response.json();
  return Array.isArray(payload) ? (payload as RemoteStoreProduct[]) : [];
}

export async function fetchDeletedProductIds(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/products/deleted`);
  if (!response.ok) {
    throw new Error("Could not load deleted products");
  }
  const payload = await response.json();
  return Array.isArray(payload) ? payload.map((value) => String(value)) : [];
}

export async function deleteStoreProduct(productId: string) {
  const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "Could not delete product");
  }

  return response.json() as Promise<{ id: string; name?: string; deleted: boolean }>;
}
