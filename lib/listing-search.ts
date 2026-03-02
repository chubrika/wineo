import type { ListingType, ListingSortOption } from "@/types/listing";
import type { RegionSlug } from "@/types/listing";

/**
 * Parsed search params from URL (string values). Category comes from path, not query.
 */
export interface ListingSearchState {
  type: ListingType;
  /** From route /buy/[categorySlug] or /rent/[categorySlug] */
  categorySlug?: string;
  priceMin?: string;
  priceMax?: string;
  region?: RegionSlug;
  sort?: ListingSortOption;
  page?: string;
  keyword?: string;
  /** Attribute filters from URL (bare keys: country=italy, brand=brand-2). Sent to API for filtering. */
  attributeFilters?: Record<string, string[]>;
}

export const DEFAULT_PAGE_SIZE = 12;

/** Parse only query string; categorySlug is set separately from route params. */
export function parseListingSearchParams(
  type: ListingType,
  searchParams: Record<string, string | string[] | undefined> | null,
  categorySlugFromPath?: string
): ListingSearchState {
  const state: ListingSearchState = { type, categorySlug: categorySlugFromPath };
  if (!searchParams) return state;
  const get = (key: string): string | undefined => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const getAll = (key: string): string[] => {
    const v = searchParams[key];
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
  };
  state.priceMin = get("priceMin") ?? undefined;
  state.priceMax = get("priceMax") ?? undefined;
  state.region = (get("region") as RegionSlug | undefined) ?? undefined;
  state.sort = (get("sort") as ListingSortOption | undefined) ?? undefined;
  state.page = get("page") ?? undefined;
  state.keyword = get("q") ?? undefined;
  // Attribute filters: bare keys (country=italy, brand=brand-2, color=italy,georgia)
  const RESERVED_SEARCH_KEYS = new Set(["priceMin", "priceMax", "region", "sort", "page", "q"]);
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const attrFilters: Record<string, string[]> = {};
  for (const key of Object.keys(searchParams)) {
    const k = key.toLowerCase();
    if (RESERVED_SEARCH_KEYS.has(k)) continue;
    if (!slugPattern.test(k)) continue;
    const raw = getAll(key).map((s) => String(s).trim()).filter(Boolean);
    const values = raw.length ? raw : (get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (values.length) attrFilters[k] = values;
  }
  if (Object.keys(attrFilters).length) state.attributeFilters = attrFilters;
  return state;
}

/**
 * Build URL path for buy/rent (no category or with category).
 */
export function listingBasePath(type: ListingType, categorySlug?: string | null): string {
  const base = type === "buy" ? "/buy" : "/rent";
  if (categorySlug) return `${base}/${categorySlug}`;
  return base;
}

/**
 * Build full URL search string from state (for client-side navigation).
 * Does not include category — that is in the path.
 */
export function buildListingSearchString(params: {
  priceMin?: string | number;
  priceMax?: string | number;
  region?: string;
  sort?: string;
  page?: string | number;
  keyword?: string;
}): string {
  const q = new URLSearchParams();
  if (params.priceMin != null && params.priceMin !== "") q.set("priceMin", String(params.priceMin));
  if (params.priceMax != null && params.priceMax !== "") q.set("priceMax", String(params.priceMax));
  if (params.region) q.set("region", params.region);
  if (params.sort) q.set("sort", params.sort);
  if (params.page != null && params.page !== "" && Number(params.page) > 1) q.set("page", String(params.page));
  if (params.keyword) q.set("q", params.keyword);
  const s = q.toString();
  return s ? `?${s}` : "";
}
