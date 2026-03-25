/**
 * API base: relative "/api" in the browser (same-origin, middleware proxies);
 * absolute BACKEND_URL + "/api" on the server (Node fetch requires absolute URL).
 */
export const API_BASE =
  typeof window === "undefined"
    ? `${(process.env.BACKEND_URL || "http://localhost:4000").replace(/\/$/, "")}/api`
    : "/api";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  role: 'customer' | 'admin';
  phone?: string;
  userType?: 'physical' | 'business';
  avatar?: string;
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

export type AuthResponse = { user: AuthUser; token?: string };
export type MeResponse = { user: AuthUser };
export type RegisterResponse = { message: string; emailSent?: boolean };
export type VerifyEmailResponse = { message: string; user: AuthUser; token?: string };

/** Category from backend GET /categories */
export type ApiCategory = {
  id: string;
  types: Array<'buy' | 'rent'>;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  active: boolean;
  /** Manual ordering within same parent (lower first). */
  index: number;
  parentId: string | null;
  level: number;
  path: string[];
  createdAt: string;
  updatedAt: string;
};

const AUTH_OPTS: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

/**
 * Example: PATCH/DELETE with cookie-based auth (same-origin via Next.js proxy).
 *
 * await fetch(`${API_BASE}/auth/me`, {
 *   method: "PATCH",
 *   credentials: "include",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ firstName: "New" }),
 * });
 *
 * await fetch(`${API_BASE}/products/${id}`, {
 *   method: "DELETE",
 *   credentials: "include",
 * });
 */

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string })?.error ?? res.statusText;
    throw new Error(message);
  }
  return data as T;
}

export async function register(body: RegisterBody): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    ...AUTH_OPTS,
    method: "POST",
    body: JSON.stringify(body),
  });
  return handleRes<RegisterResponse>(res);
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    ...AUTH_OPTS,
    method: "POST",
    body: JSON.stringify(body),
  });
  return handleRes<AuthResponse>(res);
}

export async function getMe(token?: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
  return handleRes<MeResponse>(res);
}

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const res = await fetch(
    `${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`,
    { credentials: "include" }
  );
  return handleRes<VerifyEmailResponse>(res);
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    ...AUTH_OPTS,
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return handleRes<{ message: string }>(res);
}

/** POST /auth/forgot-password — request reset link to email. */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    ...AUTH_OPTS,
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  });
  return handleRes<{ message: string }>(res);
}

/** POST /auth/reset-password — set new password using token from email link. */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    ...AUTH_OPTS,
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
  return handleRes<{ message: string }>(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    credentials: "include",
    method: "POST",
  });
  if (!res.ok) return;
  await res.json().catch(() => ({}));
}

/** Body for PATCH /auth/me */
export type UpdateMeBody = {
  phone?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
};

/**
 * PATCH /auth/me — update current user profile.
 * Uses cookie (credentials: 'include') or optional Bearer token.
 * Backend accepts token from httpOnly cookie or Authorization header.
 */
export async function updateMe(
  body: UpdateMeBody,
  token?: string | null
): Promise<MeResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PATCH",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });
  return handleRes<MeResponse>(res);
}

/**
 * GET /categories. Use roots=1 for top-level categories only.
 */
export async function getCategories(params?: {
  roots?: boolean;
  /** Single type filter (matches categories whose types include this value). */
  type?: 'buy' | 'rent';
  /** Require categories to include all of these types (e.g. ['buy','rent'] for "both"). */
  types?: Array<'buy' | 'rent'>;
}): Promise<ApiCategory[]> {
  const qs = new URLSearchParams();
  if (params?.roots) qs.set("roots", "1");
  if (params?.type) qs.set("type", params.type);
  if (params?.types && params.types.length > 0) qs.set("types", params.types.join(","));
  const search = qs.toString() ? `?${qs.toString()}` : "";
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
  description?: string;
  largeTitle?: string;
  shortDesc?: string;
  image?: string;
  index?: number;
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
  itemId?: number;
  title: string;
  slug: string;
  description: string;
  type: "sell" | "rent";
  category: { name: string; slug: string };
  categoryId?: string;
  /** Attribute values: API single-product response is array [{ name, slug, values }]; create payload uses array with filterId. */
  attributes?:
    | { filterId: string; value: string | number | boolean | string[] }[]
    | Record<string, string | string[]>
    | { name: string; slug: string; values: string[] }[];
  price: number;
  discountedPrice?: number;
  discountedPercent?: number;
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
  /** Dynamic attribute filters (slug -> value or values). Sent as query params for backend filtering. */
  attributeFilters?: Record<string, string | string[]>;
};

/**
 * GET /products or GET /products/by-category/:categorySlug.
 * List listings with optional filters. When categorySlug is set, uses by-category endpoint.
 * attributeFilters are sent as query params (e.g. country=italy,georgia) for backend dynamic filtering.
 */
export async function getProducts(params?: GetProductsParams): Promise<ApiProduct[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.type) search.set("type", params.type);
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.skip != null) search.set("skip", String(params.skip));
  if (params?.priceMin != null) search.set("priceMin", String(params.priceMin));
  if (params?.priceMax != null) search.set("priceMax", String(params.priceMax));
  if (params?.regionSlug) search.set("region", params.regionSlug);
  if (params?.attributeFilters && typeof params.attributeFilters === "object") {
    for (const [key, value] of Object.entries(params.attributeFilters)) {
      if (!key || value === undefined) continue;
      const v = Array.isArray(value) ? value.filter(Boolean).join(",") : value;
      if (v !== "") search.set(key, v);
    }
  }
  const qs = search.toString();
  const categorySlug = params?.categorySlug?.trim().toLowerCase();
  const baseUrl =
    categorySlug
      ? `${API_BASE}/products/by-category/${encodeURIComponent(categorySlug)}`
      : `${API_BASE}/products`;
  const res = await fetch(`${baseUrl}${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return handleRes<ApiProduct[]>(res);
}

/**
 * GET /products/mine — list current user's products. Uses Bearer token if provided, otherwise cookie (credentials).
 */
export async function getMyProducts(token?: string | null): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/products/mine`, {
    cache: "no-store",
    credentials: "include",
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
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
  discountedPrice?: number;
  discountedPercent?: number;
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
    credentials: "include",
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleRes<ApiProduct>(res);
}

/**
 * DELETE /products/:id — delete a product. Uses Bearer token if provided, otherwise cookie (credentials).
 */
export async function deleteProduct(token: string | null | undefined, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string })?.error ?? res.statusText);
  }
}

/** Wishlist API (auth required). */

export async function getWishlist(token: string): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/wishlist`, {
    cache: "no-store",
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<ApiProduct[]>(res);
}

/** Add product to wishlist. Returns { count }. */
export async function addToWishlist(
  token: string,
  productId: string
): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/wishlist/${encodeURIComponent(productId)}`, {
    method: "POST",
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<{ count: number }>(res);
}

/** Remove product from wishlist. Returns { count }. */
export async function removeFromWishlist(
  token: string,
  productId: string
): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/wishlist/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<{ count: number }>(res);
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ count: Math.min(20, Math.max(1, count)) }),
  });
  return handleRes<PresignUploadResponse>(res);
}

/** News item from GET /news */
export type ApiNewsItem = {
  id: string;
  _id?: string;
  slug?: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string | null;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Response from GET /news */
export type ApiNewsListResponse = {
  items: ApiNewsItem[];
  total: number;
};

/**
 * GET /news — list news (newest first). Optional limit, skip for pagination.
 */
export async function getNewsList(params?: {
  limit?: number;
  skip?: number;
}): Promise<ApiNewsListResponse> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.skip != null) qs.set("skip", String(params.skip));
  const search = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetch(`${API_BASE}/news${search}`, { cache: "no-store" });
  return handleRes<ApiNewsListResponse>(res);
}

/**
 * GET /news/slug/:slug — one news item by URL slug.
 */
export async function getNewsBySlug(slug: string): Promise<ApiNewsItem | null> {
  try {
    const normalizedSlug =
      typeof slug === "string" ? slug.trim().toLowerCase() : "";
    if (!normalizedSlug) return null;
    const res = await fetch(
      `${API_BASE}/news/slug/${encodeURIComponent(normalizedSlug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await handleRes<ApiNewsItem>(res);
  } catch {
    return null;
  }
}

/**
 * GET /news/:id — one news item by id.
 */
export async function getNewsById(id: string): Promise<ApiNewsItem | null> {
  try {
    const res = await fetch(`${API_BASE}/news/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await handleRes<ApiNewsItem>(res);
  } catch {
    return null;
  }
}

/** Hero slide from GET /hero-slides/active */
export type ApiHeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  mobileImage: string;
  order: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** Response from GET /hero-slides/active */
export type ApiHeroSlidesResponse = {
  items: ApiHeroSlide[];
};

/**
 * GET /hero-slides/active — list active hero slides (sorted by order).
 */
export async function getActiveHeroSlides(): Promise<ApiHeroSlide[]> {
  try {
    const res = await fetch(`${API_BASE}/hero-slides/active`, { cache: "no-store" });
    const data = await handleRes<ApiHeroSlidesResponse>(res);
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return [];
  }
}

/** CMS page from GET /pages */
export type ApiPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Response from GET /pages */
export type ApiPagesListResponse = {
  items: ApiPage[];
  total: number;
};

/**
 * GET /pages — list all CMS pages (for footer, sitemap).
 */
export async function getPages(): Promise<ApiPage[]> {
  try {
    const res = await fetch(`${API_BASE}/pages`, { cache: "no-store" });
    const data = await handleRes<ApiPagesListResponse>(res);
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

/**
 * GET /pages/slug/:slug — one page by slug (for dynamic /pages/[slug]).
 */
export async function getPageBySlug(slug: string): Promise<ApiPage | null> {
  try {
    const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
    if (!normalizedSlug) return null;
    const res = await fetch(
      `${API_BASE}/pages/slug/${encodeURIComponent(normalizedSlug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await handleRes<ApiPage>(res);
  } catch {
    return null;
  }
}
