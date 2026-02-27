/**
 * Listing type: Buy or Rent
 */
export type ListingType = "buy" | "rent";

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
  /** ISO date string */
  createdAt: string;
  /** Optional for future filtering */
  specifications?: {
    condition?: "new" | "used";
  };
  /** Highlighted on homepage; prepared for monetization */
  featured?: boolean;
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
