/**
 * Backend API base URL. Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:4000).
 */
export const API_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:4000";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
};

export type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
export type LoginBody = { email: string; password: string };

export type AuthResponse = { user: AuthUser; token: string };
export type MeResponse = { user: AuthUser };

/** Category from backend GET /categories */
export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  parentId: string | null;
  level: number;
  path: string[];
  createdAt: string;
  updatedAt: string;
};

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string })?.error ?? res.statusText;
    throw new Error(message);
  }
  return data as T;
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleRes<AuthResponse>(res);
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleRes<AuthResponse>(res);
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<MeResponse>(res);
}

/**
 * GET /categories. Use roots=1 for top-level categories only.
 */
export async function getCategories(params?: { roots?: boolean }): Promise<ApiCategory[]> {
  const search = params?.roots ? "?roots=1" : "";
  const res = await fetch(`${API_URL}/categories${search}`);
  return handleRes<ApiCategory[]>(res);
}

/** Product/listing from backend GET /products */
export type ApiProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "sell" | "rent";
  category: { name: string; slug: string };
  categoryId?: string;
  price: number;
  currency?: string;
  rentPeriod?: "hour" | "day" | "week" | "month";
  images?: string[];
  thumbnail?: string;
  location?: { region: string; city: string };
  status?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type GetProductsParams = {
  type?: "sell" | "rent";
  status?: string;
  categorySlug?: string;
  limit?: number;
  skip?: number;
};

/**
 * GET /products. List listings with optional filters.
 */
export async function getProducts(params?: GetProductsParams): Promise<ApiProduct[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.type) search.set("type", params.type);
  if (params?.categorySlug) search.set("categorySlug", params.categorySlug);
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.skip != null) search.set("skip", String(params.skip));
  const qs = search.toString();
  const res = await fetch(`${API_URL}/products${qs ? `?${qs}` : ""}`);
  return handleRes<ApiProduct[]>(res);
}
