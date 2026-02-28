/**
 * Backend API base URL. Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:4000).
 */
export const API_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:4000";

/** Base URL for API routes (backend uses /api prefix, vivi-style). */
export const API_BASE = `${API_URL}/api`;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  role: 'customer' | 'admin';
  phone?: string;
  userType?: 'physical' | 'business';
};

export type RegisterBody = {
  email: string;
  password: string;
  userType: 'physical' | 'business';
  firstName?: string;
  lastName?: string;
  businessName?: string;
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
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleRes<AuthResponse>(res);
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleRes<AuthResponse>(res);
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<MeResponse>(res);
}

/** Body for PATCH /auth/me */
export type UpdateMeBody = {
  phone?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
};

/**
 * PATCH /auth/me — update current user profile. Returns updated user.
 */
export async function updateMe(token: string, body: UpdateMeBody): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return handleRes<MeResponse>(res);
}

/**
 * GET /categories. Use roots=1 for top-level categories only.
 */
export async function getCategories(params?: { roots?: boolean }): Promise<ApiCategory[]> {
  const search = params?.roots ? "?roots=1" : "";
  const res = await fetch(`${API_BASE}/categories${search}`, { cache: "no-store" });
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
    const res = await fetch(`${API_BASE}/categories/slug/${encodeURIComponent(normalizedSlug)}`, { cache: "no-store" });
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
    const res = await fetch(`${API_BASE}/regions`, { cache: "no-store" });
    return await handleRes<ApiRegion[]>(res);
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
    const res = await fetch(`${API_BASE}/cities${qs}`, { cache: "no-store" });
    return handleRes<ApiCity[]>(res);
  } catch {
    return [];
  }
}

export type PromotionType = "none" | "highlighted" | "featured" | "homepageTop";

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
    const res = await fetch(`${API_BASE}/filters/by-category/${encodeURIComponent(categoryId)}`, {
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
  /** Attribute values from category filters (filterId as string, value as stored) */
  attributes?: { filterId: string; value: string | number | boolean | string[] }[];
  price: number;
  currency?: string;
  rentPeriod?: "hour" | "day" | "week" | "month";
  images?: string[];
  thumbnail?: string;
  location?: { region: string; city: string };
  /** Owner display name (when API populates ownerId) */
  ownerName?: string;
  /** business = show ownerName; physical = show "ფიზიკური პირი" */
  ownerType?: "physical" | "business";
  /** Owner contact phone (when API populates ownerId with phone) */
  ownerPhone?: string;
  /** Number of active listings by this owner (single-product endpoints only) */
  ownerProductCount?: number;
  status?: string;
  promotionType?: PromotionType;
  /** ISO string or null */
  promotionExpiresAt?: string | null;
  /** From DB: flexible key-value (e.g. { condition: "new" | "used", brand, model, ... }) */
  specifications?: { condition?: string; [key: string]: unknown };
  createdAt: string;
  updatedAt?: string;
  views?: number;
  saves?: number;
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
  const res = await fetch(`${API_BASE}/products${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return handleRes<ApiProduct[]>(res);
}

/**
 * GET /products/mine — list current user's products. Requires auth token.
 */
export async function getMyProducts(token: string): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/products/mine`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
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
      `${API_BASE}/products/slug/${encodeURIComponent(normalizedSlug)}${qs}`,
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
  /** Public image URLs (when not using temp uploads) */
  images?: string[];
  thumbnail?: string;
  /** R2 temp object keys from presigned upload; first = thumbnail. Processed on create. */
  tempImageKeys?: string[];
  specifications?: { condition?: "new" | "used"; [key: string]: unknown };
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  promotionType?: PromotionType;
  /** ISO string or null */
  promotionExpiresAt?: string | null;
};

/**
 * POST /products — create a product (listing). Requires auth token.
 */
export async function createProduct(
  token: string,
  payload: CreateProductPayload
): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleRes<ApiProduct>(res);
}

/**
 * GET /products/:id — one product by id.
 */
export async function getProductById(id: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await handleRes<ApiProduct>(res);
  } catch {
    return null;
  }
}

/**
 * PUT /products/:id — update a product. Requires auth token.
 */
export async function updateProduct(
  token: string,
  id: string,
  payload: Partial<CreateProductPayload>
): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleRes<ApiProduct>(res);
}

/**
 * DELETE /products/:id — delete a product. Requires auth token.
 */
export async function deleteProduct(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string })?.error ?? res.statusText);
  }
}

/** Response from POST /products/upload/presign */
export type PresignUploadResponse = {
  uploads: { key: string; uploadUrl: string }[];
};

/**
 * POST /products/upload/presign — get presigned PUT URLs for product image uploads to R2.
 * count: 1–20. Returns uploads array (key + uploadUrl). First image = thumbnail.
 */
export async function getPresignedUploadUrls(
  token: string,
  count: number
): Promise<PresignUploadResponse> {
  const res = await fetch(`${API_BASE}/products/upload/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ count: Math.min(20, Math.max(1, count)) }),
  });
  return handleRes<PresignUploadResponse>(res);
}
