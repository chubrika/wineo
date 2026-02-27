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
  const res = await fetch(`${API_URL}/categories${search}`, { cache: "no-store" });
  return handleRes<ApiCategory[]>(res);
}

/**
 * GET /categories/slug/:slug — one category by URL slug (active only).
 * Slug is normalized to lowercase to match backend/DB.
 */
export async function getCategoryBySlug(slug: string): Promise<ApiCategory | null> {
  try {
    const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
    if (!normalizedSlug) return null;
    const res = await fetch(`${API_URL}/categories/slug/${encodeURIComponent(normalizedSlug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await handleRes<ApiCategory>(res);
  } catch {
    return null;
  }
}

/** Region from backend GET /regions */
export type ApiRegion = {
  id: string;
  slug: string;
  label: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * GET /regions — list all regions (for filters, location pages).
 */
export async function getRegions(): Promise<ApiRegion[]> {
  try {
    const res = await fetch(`${API_URL}/regions`, { cache: "no-store" });
    return handleRes<ApiRegion[]>(res);
  } catch {
    return [];
  }
}

/** City from backend GET /cities?regionId= */
export type ApiCity = {
  id: string;
  slug: string;
  label: string;
  regionId: string;
  region?: { id: string; slug: string; label: string };
  createdAt?: string;
  updatedAt?: string;
};

/**
 * GET /cities?regionId= — list cities (optionally by region).
 */
export async function getCities(regionId?: string): Promise<ApiCity[]> {
  try {
    const qs = regionId ? `?regionId=${encodeURIComponent(regionId)}` : "";
    const res = await fetch(`${API_URL}/cities${qs}`, { cache: "no-store" });
    return handleRes<ApiCity[]>(res);
  } catch {
    return [];
  }
}

/** Filter from backend GET /filters/by-category/:categoryId */
export type ApiFilter = {
  id: string;
  name: string;
  slug: string;
  type: "select" | "range" | "checkbox" | "number" | "text";
  options?: string[];
  unit: string;
  categoryId: string;
  applyToChildren: boolean;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
};

/**
 * GET /filters/by-category/:categoryId — filters applicable to the category (own + inherited).
 */
export async function getFiltersByCategoryId(categoryId: string): Promise<ApiFilter[]> {
  try {
    const res = await fetch(`${API_URL}/filters/by-category/${encodeURIComponent(categoryId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await handleRes<ApiFilter[]>(res);
  } catch {
    return [];
  }
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
  /** From DB: flexible key-value (e.g. { condition: "new" | "used", brand, model, ... }) */
  specifications?: { condition?: string; [key: string]: unknown };
  createdAt: string;
  updatedAt?: string;
};

export type GetProductsParams = {
  type?: "sell" | "rent";
  status?: string;
  categorySlug?: string;
  limit?: number;
  skip?: number;
  /** Prepared for backend/ElasticSearch; filter applied in-memory if not supported */
  priceMin?: number;
  priceMax?: number;
  regionSlug?: string;
};

/**
 * GET /products. List listings with optional filters.
 * categorySlug is normalized to lowercase to match backend/DB.
 */
export async function getProducts(params?: GetProductsParams): Promise<ApiProduct[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.type) search.set("type", params.type);
  if (params?.categorySlug) {
    const slug = params.categorySlug.trim().toLowerCase();
    if (slug) search.set("categorySlug", slug);
  }
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.skip != null) search.set("skip", String(params.skip));
  if (params?.priceMin != null) search.set("priceMin", String(params.priceMin));
  if (params?.priceMax != null) search.set("priceMax", String(params.priceMax));
  if (params?.regionSlug) search.set("regionSlug", params.regionSlug);
  const qs = search.toString();
  const res = await fetch(`${API_URL}/products${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return handleRes<ApiProduct[]>(res);
}

/**
 * GET /products/slug/:slug — one product (listing) by URL slug (active only).
 * Pass type to ensure product matches listing type (buy=sell, rent=rent).
 * Slug is normalized to lowercase to match backend/DB.
 */
export async function getProductBySlug(
  slug: string,
  type?: "sell" | "rent"
): Promise<ApiProduct | null> {
  try {
    const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
    if (!normalizedSlug) return null;
    const qs = type ? `?type=${type}` : "";
    const res = await fetch(
      `${API_URL}/products/slug/${encodeURIComponent(normalizedSlug)}${qs}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await handleRes<ApiProduct>(res);
  } catch {
    return null;
  }
}

/** Payload for POST /products (create listing). Matches backend expectations. */
export type CreateProductPayload = {
  title: string;
  slug?: string;
  description: string;
  type: "sell" | "rent";
  category: { name: string; slug: string };
  categoryId?: string;
  price: number;
  currency: "GEL" | "USD";
  priceType: "fixed" | "negotiable";
  rentPeriod?: "hour" | "day" | "week" | "month";
  location: { region: string; city: string };
  attributes?: { filterId: string; value: string | number | boolean | string[] }[];
  images?: string[];
  thumbnail?: string;
  specifications?: { condition?: "new" | "used"; [key: string]: unknown };
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
};

/**
 * POST /products — create a product (listing). Requires auth token.
 */
export async function createProduct(
  token: string,
  payload: CreateProductPayload
): Promise<ApiProduct> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleRes<ApiProduct>(res);
}
