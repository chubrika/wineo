import type {
  Listing,
  ListingType,
  ListingSearchParams,
} from "@/types/listing";

/**
 * In production, replace with DB/API/ElasticSearch.
 * Data structure follows types/listing.ts.
 */

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    slug: "destemmer-crusher-professional",
    type: "buy",
    title: "Professional Destemmer-Crusher 2 Ton/hr",
    description:
      "Stainless steel destemmer-crusher for commercial use. Gentle on grapes, easy to clean. Includes stand and motor.",
    excerpt: "Stainless steel destemmer-crusher, 2 ton/hr. Commercial grade.",
    price: 4500,
    imageUrl: "/next.svg",
    imageAlt: "Destemmer crusher machine",
    category: "crushers-destemmers",
    categorySlug: "wine-press-crusher",
    regionSlug: "kakheti",
    location: "Kakheti",
    createdAt: "2025-02-22T10:00:00Z",
    condition: "like-new",
    featured: true,
  },
  {
    id: "2",
    slug: "hydraulic-wine-press-40l",
    type: "buy",
    title: "Hydraulic Wine Press 40L",
    description:
      "Hydraulic basket press, 40 liter capacity. Ideal for small wineries and serious home winemakers.",
    excerpt: "40L hydraulic basket press. Perfect for small batches.",
    price: 1200,
    imageUrl: "/next.svg",
    imageAlt: "Hydraulic wine press",
    category: "presses",
    categorySlug: "wine-press-crusher",
    regionSlug: "imereti",
    location: "Imereti",
    createdAt: "2025-02-21T14:00:00Z",
    condition: "good",
    featured: true,
  },
  {
    id: "3",
    slug: "fermentation-tank-500l-rental",
    type: "rent",
    title: "Stainless Fermentation Tank 500L (Rental)",
    description:
      "Rent our 500L stainless steel fermentation tank for harvest season. Temperature control, included delivery within 50 km.",
    excerpt: "500L stainless tank with temp control. Seasonal rental.",
    price: 350,
    priceUnit: "month",
    imageUrl: "/next.svg",
    imageAlt: "Fermentation tank",
    category: "fermentation",
    categorySlug: "winery-machinery",
    regionSlug: "kakheti",
    location: "Kakheti",
    createdAt: "2025-02-20T09:00:00Z",
    condition: "new",
    featured: true,
  },
  {
    id: "4",
    slug: "barrel-racking-system",
    type: "rent",
    title: "Barrel Racking System (6 barrels)",
    description:
      "Rack for 6 standard 59-gallon barrels. Heavy-duty steel, easy to move. Monthly rental.",
    excerpt: "6-barrel rack. Heavy-duty, monthly rental.",
    price: 120,
    priceUnit: "month",
    imageUrl: "/next.svg",
    imageAlt: "Barrel racking",
    category: "barrels-storage",
    categorySlug: "barrels",
    regionSlug: "kartli",
    location: "Kartli",
    createdAt: "2025-02-19T11:00:00Z",
  },
  {
    id: "5",
    slug: "oak-barrels-set-225l",
    type: "buy",
    title: "French Oak Barrels (225L) — Set of 4",
    description:
      "Medium toast French oak, 225L each. Used two vintages. Ready for aging.",
    excerpt: "Set of 4 French oak 225L barrels. Medium toast.",
    price: 2800,
    imageUrl: "/next.svg",
    imageAlt: "Oak barrels",
    category: "barrels-storage",
    categorySlug: "barrels",
    regionSlug: "kakheti",
    location: "Kakheti",
    createdAt: "2025-02-18T08:00:00Z",
    condition: "good",
  },
  {
    id: "6",
    slug: "vineyard-parcel-2ha-kakheti",
    type: "buy",
    title: "Vineyard Parcel 2 ha — Kakheti",
    description:
      "Established vineyard, Rkatsiteli and Saperavi. Irrigation, road access.",
    excerpt: "2 ha vineyard in Kakheti. Rkatsiteli, Saperavi.",
    price: 85000,
    imageUrl: "/next.svg",
    imageAlt: "Vineyard land",
    category: "other",
    categorySlug: "vineyard-land",
    regionSlug: "kakheti",
    location: "Kakheti",
    createdAt: "2025-02-17T12:00:00Z",
  },
  {
    id: "7",
    slug: "bottling-line-semi-auto",
    type: "rent",
    title: "Semi-Automatic Bottling Line (Rental)",
    description:
      "3-head filler, capper, labeler. Daily or weekly rental for harvest bottling.",
    excerpt: "Semi-auto bottling: filler, capper, labeler. Daily/weekly.",
    price: 200,
    priceUnit: "day",
    imageUrl: "/next.svg",
    imageAlt: "Bottling line",
    category: "bottling",
    categorySlug: "winery-machinery",
    regionSlug: "imereti",
    location: "Imereti",
    createdAt: "2025-02-16T10:00:00Z",
  },
  {
    id: "8",
    slug: "wine-bottles-bordeaux-500",
    type: "buy",
    title: "Bordeaux Bottles (500 pcs) — New",
    description:
      "Standard 750 ml green Bordeaux. New, food-grade. Palletized.",
    excerpt: "500 new 750 ml Bordeaux bottles. Palletized.",
    price: 450,
    imageUrl: "/next.svg",
    imageAlt: "Wine bottles",
    category: "bottling",
    categorySlug: "wine-bottles",
    regionSlug: "racha",
    location: "Racha",
    createdAt: "2025-02-15T16:00:00Z",
    condition: "new",
  },
  {
    id: "9",
    slug: "tractor-vineyard-narrow",
    type: "rent",
    title: "Narrow Vineyard Tractor (Monthly Rental)",
    description:
      "Low-profile tractor for row work. Includes basic implements.",
    excerpt: "Narrow tractor for vineyard rows. Monthly rental.",
    price: 800,
    priceUnit: "month",
    imageUrl: "/next.svg",
    imageAlt: "Vineyard tractor",
    category: "other",
    categorySlug: "agricultural-equipment",
    regionSlug: "adjara",
    location: "Adjara",
    createdAt: "2025-02-14T09:00:00Z",
  },
  {
    id: "10",
    slug: "crusher-destemmer-small",
    type: "buy",
    title: "Small Destemmer-Crusher 500 kg/hr",
    description:
      "Compact unit for home or nano winery. Stainless hopper and cage.",
    excerpt: "500 kg/hr destemmer-crusher. Home/nano use.",
    price: 1800,
    imageUrl: "/next.svg",
    imageAlt: "Small crusher",
    category: "crushers-destemmers",
    categorySlug: "wine-press-crusher",
    regionSlug: "kartli",
    location: "Kartli",
    createdAt: "2025-02-13T11:00:00Z",
    condition: "like-new",
  },
];

export async function getListings(type: ListingType): Promise<Listing[]> {
  return MOCK_LISTINGS.filter((l) => l.type === type);
}

export async function getListingBySlug(
  type: ListingType,
  slug: string
): Promise<Listing | null> {
  const listing =
    MOCK_LISTINGS.find((l) => l.type === type && l.slug === slug) ?? null;
  return listing;
}

export async function getAllListingSlugs(): Promise<
  { type: ListingType; slug: string }[]
> {
  return MOCK_LISTINGS.map((l) => ({ type: l.type, slug: l.slug }));
}

/** Latest listings by createdAt; pagination-ready (limit/offset pattern). */
export async function getLatestListings(
  limit: number = 12,
  offset: number = 0
): Promise<{ items: Listing[]; total: number }> {
  const sorted = [...MOCK_LISTINGS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const total = sorted.length;
  const items = sorted.slice(offset, offset + limit);
  return { items, total };
}

/** Featured listings for homepage; prepared for monetization. */
export async function getFeaturedListings(limit: number = 6): Promise<Listing[]> {
  return MOCK_LISTINGS.filter((l) => l.featured === true).slice(0, limit);
}

/**
 * Search/filter — prepared for ElasticSearch and URL query params.
 * For now filters in-memory; replace with DB/API when ready.
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

  let result = [...MOCK_LISTINGS];

  if (type) result = result.filter((l) => l.type === type);
  if (categorySlug)
    result = result.filter((l) => l.categorySlug === categorySlug);
  if (regionSlug) result = result.filter((l) => l.regionSlug === regionSlug);
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
  const items = result
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(offset, offset + limit);

  return { items, total };
}
