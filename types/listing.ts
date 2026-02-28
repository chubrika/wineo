/**
 * Listing type: Buy or Rent
 */
export type ListingType = "buy" | "rent";

export type PromotionType = "none" | "highlighted" | "featured" | "homepageTop";

/**
 * Category for winemaking equipment (extensible for future filters)
 */
export type EquipmentCategory = { name: string; slug: string };

/**
 * URL slug for /category/[slug] — aligns with homepage categories grid.
 * Extended at runtime from API categories.
 */
export type CategorySlug = string;

/**
 * URL slug for /location/[slug] — Georgian wine regions
 */
export type RegionSlug =
  | "kakheti"
  | "imereti"
  | "racha"
  | "kartli"
  | "adjara";

export interface Listing {
  id: string;
  slug: string;
  type: ListingType;
  title: string;
  description: string;
  /** Short excerpt for cards and meta description */
  excerpt: string;
  price: number;
  currency: string;
  /** For rent: price per day/week/month */
  priceUnit?: "day" | "week" | "month";
  imageUrl: string;
  imageAlt: string;
  category: EquipmentCategory;
  /** For /category/[slug] routing and filters */
  categorySlug?: CategorySlug;
  location?: string;
  /** For /location/[slug] routing; ISO region slug */
  regionSlug?: RegionSlug;
  /** Display name of who added the listing (e.g. "First Last") */
  ownerName?: string;
  /** business = show ownerName; physical = show "ფიზიკური პირი" */
  ownerType?: "physical" | "business";
  /** Owner contact phone (detail page only) */
  ownerPhone?: string;
  /** Number of active listings by this owner (detail page only) */
  ownerProductCount?: number;
  /** ISO date string */
  createdAt: string;
  /** View count (detail page) */
  views?: number;
  /** Optional for future filtering; full key-value from API on detail */
  specifications?: {
    condition?: "new" | "used";
    [key: string]: unknown;
  };
  promotionType: PromotionType;
  /** ISO string or null */
  promotionExpiresAt: string | null;
  /** All image URLs for gallery (detail); first is imageUrl */
  images?: string[];
}

export interface ListingCardProps {
  listing: Listing;
}

/** Search/filter params — prepared for ElasticSearch and URL query */
export type ListingSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "featured";

export interface ListingSearchParams {
  keyword?: string;
  categorySlug?: string;
  type?: ListingType;
  regionSlug?: RegionSlug;
  priceMin?: number;
  priceMax?: number;
  sort?: ListingSortOption;
  page?: number;
  limit?: number;
}
