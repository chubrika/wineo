/**
 * Listing type: Buy or Rent
 */
export type ListingType = "buy" | "rent";

/**
 * Category for winemaking equipment (extensible for future filters)
 */
export type EquipmentCategory =
{ name: string; slug: string };

/**
 * URL slug for /category/[slug] — aligns with homepage categories grid
 */
export type CategorySlug =
  | "wine-bottles"
  | "winery-machinery"
  | "vineyard-land"
  | "barrels"
  | "wine-press-crusher"
  | "agricultural-equipment";

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
  /** ISO date string */
  createdAt: string;
  /** Optional for future filtering */
  condition?: "new" | "like-new" | "good" | "fair";
  /** Highlighted on homepage; prepared for monetization */
  featured?: boolean;
}

export interface ListingCardProps {
  listing: Listing;
}

/** Search/filter params — prepared for ElasticSearch and URL query */
export interface ListingSearchParams {
  keyword?: string;
  categorySlug?: CategorySlug;
  type?: ListingType;
  regionSlug?: RegionSlug;
  page?: number;
  limit?: number;
}
