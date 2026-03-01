import type {
  Listing,
  ListingType,
  ListingSearchParams,
  ListingSortOption,
  EquipmentCategory,
} from "@/types/listing";
import { getProducts, getProductBySlug, type ApiProduct } from "@/lib/api";
import { compareByPromotionThenCreatedAtDesc, getPromotionRank, normalizeApiProductPromotion } from "@/lib/promotion";

/** Map backend product to frontend Listing for display. */
function mapApiProductToListing(api: ApiProduct): Listing {
  const description = typeof api.description === "string" ? api.description : "";
  const excerpt =
    description.length > 150
      ? description.slice(0, 150).trim() + "…"
      : description;
  const priceUnit =
    api.type === "rent" && api.rentPeriod
      ? (["day", "week", "month"].includes(api.rentPeriod)
          ? (api.rentPeriod as "day" | "week" | "month")
          : "day")
      : undefined;
  const title = typeof api.title === "string" ? api.title : "";
  const price = typeof api.price === "number" && Number.isFinite(api.price) ? api.price : 0;
  const createdAt = typeof api.createdAt === "string" ? api.createdAt : new Date().toISOString();
  return {
    id: api.id ?? "",
    slug: api.slug ?? "",
    type: api.type === "sell" ? "buy" : "rent",
    title,
    description,
    excerpt,
    price,
    currency: api.currency || "GEL",
    priceUnit,
    imageUrl: api.thumbnail || api.images?.[0] || "/next.svg",
    imageAlt: title,
    category: api.category as unknown as EquipmentCategory,
    categorySlug: api.category?.slug,
    location: api.location
      ? `${api.location.city}, ${api.location.region}`
      : undefined,
    ownerName: api.ownerName,
    ownerType: api.ownerType,
    ownerPhone: api.ownerPhone,
    ownerProductCount: api.ownerProductCount,
    createdAt,
    views: api.views,
    ...normalizeApiProductPromotion(api),
    specifications:
      api.specifications && typeof api.specifications === "object"
        ? ({
            ...api.specifications,
            ...(api.specifications.condition === "new" || api.specifications.condition === "used"
              ? { condition: api.specifications.condition as "new" | "used" }
              : {}),
          } as Listing["specifications"])
        : undefined,
    images:
      Array.isArray(api.images) && api.images.length > 0
        ? api.images
        : api.thumbnail
          ? [api.thumbnail]
          : undefined,
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
    let product = await getProductBySlug(slug, apiType);
    if (!product) product = await getProductBySlug(slug);
    return product ? mapApiProductToListing(product) : null;
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
    const sorted = [...mapped].sort(compareByPromotionThenCreatedAtDesc);
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
    const featured = mapped.filter((l) => l.promotionType === "featured" || l.promotionType === "homepageTop");
    return featured.sort(compareByPromotionThenCreatedAtDesc).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Search/filter — uses backend API for type/category; keyword/region/price filtered in-memory.
 * Sort applied in-memory. Prepared for ElasticSearch: move filter/sort to API when ready.
 */
export async function searchListings(
  params: ListingSearchParams
): Promise<{ items: Listing[]; total: number }> {
  const {
    keyword,
    categorySlug,
    type,
    regionSlug,
    priceMin,
    priceMax,
    sort = "newest",
    page = 1,
    limit = 12,
  } = params;

  try {
    const list = await getProducts({
      status: "active",
      limit: 500,
      skip: 0,
      ...(type && { type: type === "buy" ? "sell" : "rent" }),
      ...(categorySlug && { categorySlug }),
    });
    let result = list.map(mapApiProductToListing);

    if (categorySlug) {
      const slugLower = categorySlug.toLowerCase();
      result = result.filter(
        (l) => l.categorySlug?.toLowerCase() === slugLower
      );
    }
    if (regionSlug) {
      const slugLower = regionSlug.toLowerCase();
      result = result.filter((l) =>
        l.location?.toLowerCase().includes(slugLower)
      );
    }
    if (priceMin != null) {
      result = result.filter((l) => l.price >= priceMin);
    }
    if (priceMax != null) {
      result = result.filter((l) => l.price <= priceMax);
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

    const sorted = [...result].sort(sortListings(sort));
    const total = sorted.length;
    const offset = (page - 1) * limit;
    const items = sorted.slice(offset, offset + limit);

    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

function sortListings(sort: ListingSortOption): (a: Listing, b: Listing) => number {
  return (a, b) => {
    // Requirement: active promotions first (homepageTop > featured > highlighted > none), then createdAt DESC.
    const ra = getPromotionRank(a);
    const rb = getPromotionRank(b);
    if (ra !== rb) return ra - rb;

    // Within same promotion rank, honor selected sort where possible.
    if (sort === "price_asc") {
      if (a.price !== b.price) return a.price - b.price;
    } else if (sort === "price_desc") {
      if (a.price !== b.price) return b.price - a.price;
    } else if (sort === "featured") {
      // "featured" behaves as "promoted": keep promotion ordering, then newest.
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };
}
