import type {
  Listing,
  ListingType,
  ListingSearchParams,
  CategorySlug,
  EquipmentCategory,
} from "@/types/listing";
import { getProducts, type ApiProduct } from "@/lib/api";

/** Map backend product to frontend Listing for display. */
function mapApiProductToListing(api: ApiProduct): Listing {
  const excerpt =
    api.description.length > 150
      ? api.description.slice(0, 150).trim() + "…"
      : api.description;
  const priceUnit =
    api.type === "rent" && api.rentPeriod
      ? (["day", "week", "month"].includes(api.rentPeriod)
          ? (api.rentPeriod as "day" | "week" | "month")
          : "day")
      : undefined;
  return {
    id: api.id,
    slug: api.slug,
    type: api.type === "sell" ? "buy" : "rent",
    title: api.title,
    description: api.description,
    excerpt,
    price: api.price,
    currency: api.currency || "GEL",
    priceUnit,
    imageUrl: api.thumbnail || api.images?.[0] || "/next.svg",
    imageAlt: api.title,
    category: api.category as unknown as EquipmentCategory,
    categorySlug: api.category?.slug as CategorySlug | undefined,
    location: api.location
      ? `${api.location.city}, ${api.location.region}`
      : undefined,
    createdAt: api.createdAt,
    featured: api.isFeatured,
  };
}

/**
 * Fetch latest buy or rent listings from backend. Returns empty array on error.
 */
export async function getListingsFromApi(
  type: ListingType,
  limit: number = 4
): Promise<Listing[]> {
  try {
    const apiType = type === "buy" ? "sell" : "rent";
    const list = await getProducts({
      type: apiType,
      status: "active",
      limit,
      skip: 0,
    });
    return list.map(mapApiProductToListing);
  } catch {
    return [];
  }
}

/**
 * In production, replace with DB/API/ElasticSearch.
 * Data structure follows types/listing.ts.
 */


export async function getListings(type: ListingType): Promise<Listing[]> {
  try {
    const apiType = type === "buy" ? "sell" : "rent";
    const list = await getProducts({ type: apiType, status: "active", limit: 100 });
    return list.map(mapApiProductToListing);
  } catch {
    return [];
  }
}

export async function getListingBySlug(
  type: ListingType,
  slug: string
): Promise<Listing | null> {
  try {
    const apiType = type === "buy" ? "sell" : "rent";
    const list = await getProducts({ type: apiType, status: "active", limit: 100 });
    const found = list.find((p) => p.slug === slug);
    return found ? mapApiProductToListing(found) : null;
  } catch {
    return null;
  }
}

export async function getAllListingSlugs(): Promise<
  { type: ListingType; slug: string }[]
> {
  try {
    const list = await getProducts({ status: "active", limit: 500 });
    return list.map((p) => ({
      type: (p.type === "sell" ? "buy" : "rent") as ListingType,
      slug: p.slug,
    }));
  } catch {
    return [];
  }
}

/** Latest listings by createdAt; pagination-ready (limit/offset pattern). */
export async function getLatestListings(
  limit: number = 12,
  offset: number = 0
): Promise<{ items: Listing[]; total: number }> {
  try {
    const fetchLimit = Math.min(offset + limit, 100);
    const list = await getProducts({
      status: "active",
      limit: fetchLimit,
      skip: 0,
    });
    const mapped = list.map(mapApiProductToListing);
    const sorted = [...mapped].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const total = sorted.length;
    const items = sorted.slice(offset, offset + limit);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

/** Featured listings for homepage; prepared for monetization. */
export async function getFeaturedListings(limit: number = 6): Promise<Listing[]> {
  try {
    const list = await getProducts({ status: "active", limit: 100 });
    const mapped = list.map(mapApiProductToListing);
    return mapped.filter((l) => l.featured).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Search/filter — uses backend API for type/category; keyword/region filtered in-memory.
 */
export async function searchListings(
  params: ListingSearchParams
): Promise<{ items: Listing[]; total: number }> {
  const {
    keyword,
    categorySlug,
    type,
    regionSlug,
    page = 1,
    limit = 12,
  } = params;

  try {
    const list = await getProducts({
      status: "active",
      limit: 200,
      skip: 0,
      ...(type && { type: type === "buy" ? "sell" : "rent" }),
      ...(categorySlug && { categorySlug }),
    });
    let result = list.map(mapApiProductToListing);

    if (regionSlug) {
      result = result.filter(
        (l) => l.location?.toLowerCase().includes(regionSlug.toLowerCase())
      );
    }
    if (keyword) {
      const q = keyword.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.excerpt.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    const total = result.length;
    const offset = (page - 1) * limit;
    const items = [...result]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(offset, offset + limit);

    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}
