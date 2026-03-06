const DEFAULT_SYNC_API_URL = "http://localhost:4000";
const envSyncApiUrl = import.meta.env.VITE_SYNC_API_URL;
const API_BASE_URL = typeof envSyncApiUrl === "string" && envSyncApiUrl.trim().length > 0
  ? envSyncApiUrl.trim().replace(/\/+$/, "")
  : DEFAULT_SYNC_API_URL;

export type StoreUser = {
  id: string;
  googleId: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  emailVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
};

export async function fetchStoreUsers(): Promise<StoreUser[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/users`);
  } catch {
    throw new Error("Could not load users from local sync server");
  }

  if (!response.ok) {
    throw new Error("Could not load users from local sync server");
  }
  const data = await response.json();
  return Array.isArray(data) ? (data as StoreUser[]) : [];
}

export function formatUserDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString();
}