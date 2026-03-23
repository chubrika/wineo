import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/constants/site";
import type { Listing } from "@/types/listing";
import type { ApiNewsItem } from "@/lib/api";

/** Default keywords for the site (homepage and fallback). */
export const DEFAULT_KEYWORDS = [
  "ყველაფერი მეღვინეობაზე",
  "ღვინის მოწყობილობები",
  "იყიდე ღვინის მოწყობილობები",
  "იქირავე ღვინის მოწყობილობები",
  "გააქირავე ღვინის მოწყობილობები",
  "საქართველო",
  "ვენახი",
  "საწნახელი",
  "წნეხები",
  "კასრები",
  "ფერმენტაციის მოწყობილობები",
];

export interface BaseMetaInput {
  title: string;
  description: string;
  path?: string;
  /** Absolute image URL for OG/Twitter. */
  image?: string | null;
  /** Optional keywords (array or string). */
  keywords?: string | string[];
  /** Override type for OG (default "website"). */
  openGraphType?: "website" | "article";
  /** For article: publishedTime, modifiedTime, authors. */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
}

/**
 * Build full Next.js Metadata with title, description, keywords,
 * Open Graph, Twitter Card, and canonical URL.
 */
export function buildMetadata(input: BaseMetaInput): Metadata {
  const {
    title,
    description,
    path = "",
    image,
    keywords,
    openGraphType = "website",
    article,
  } = input;

  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`.replace(/\/$/, "") || SITE_URL;
  const imageUrl =
    image && image.startsWith("http")
      ? image
      : image
        ? `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`
        : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  const keywordsValue =
    typeof keywords === "string"
      ? keywords
      : Array.isArray(keywords)
        ? keywords.join(", ")
        : undefined;

  const metadata: Metadata = {
    title,
    description,
    ...(keywordsValue && { keywords: keywordsValue }),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: openGraphType,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: "en_US",
      ...(article &&
        openGraphType === "article" && {
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime,
          authors: article.authors,
          section: article.section,
          tags: article.tags,
        }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };

  return metadata;
}

/**
 * Build canonical URL for a path (no trailing slash).
 */
export function buildCanonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`.replace(/\/$/, "") || SITE_URL;
}

/**
 * Build prev/next pagination links for category listing pages.
 */
export function buildPaginationAlternates(params: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | string[] | undefined>;
}): { prev?: string; next?: string; canonical: string } {
  const { basePath, currentPage, totalPages, searchParams } = params;
  const base = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const qs = (searchParams && Object.keys(searchParams).length > 0)
    ? new URLSearchParams()
    : null;
  if (qs && searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page") continue;
      const val = Array.isArray(v) ? v[0] : v;
      if (val != null) qs.set(k, val);
    }
  }
  const queryPrefix = qs && qs.toString() ? `${qs.toString()}&` : "";
  const canonical =
    currentPage <= 1
      ? buildCanonicalUrl(base)
      : `${SITE_URL}${base}?${queryPrefix}page=${currentPage}`;
  const prev =
    currentPage > 1
      ? currentPage === 2
        ? `${SITE_URL}${base}${qs && qs.toString() ? `?${qs.toString()}` : ""}`
        : `${SITE_URL}${base}?${queryPrefix}page=${currentPage - 1}`
      : undefined;
  const next =
    currentPage < totalPages
      ? `${SITE_URL}${base}?${queryPrefix}page=${currentPage + 1}`
      : undefined;
  return { canonical, prev, next };
}

/** schema.org Product — for category and product detail pages. */
export interface ProductStructuredData {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string | string[];
  url: string;
  sku?: string;
  offers: {
    "@type": "Offer";
    price: number;
    priceCurrency: string;
    availability: "https://schema.org/InStock";
    url?: string;
    priceValidUntil?: string;
    /** For rent: unit text like "day", "week", "month". */
    priceSpecification?: {
      "@type": "UnitPriceSpecification";
      price: number;
      priceCurrency: string;
      unitText: string;
    };
  };
  /** Optional: condition (new/used). */
  condition?: "https://schema.org/NewCondition" | "https://schema.org/UsedCondition";
}

/**
 * Map a Listing to schema.org Product JSON-LD.
 */
export function listingToProductJsonLd(
  listing: Listing,
  baseUrl: string
): ProductStructuredData {
  const url = `${baseUrl}/${listing.type}/listing/${listing.slug}`;
  const image =
    listing.images && listing.images.length > 0
      ? listing.images
      : [listing.imageUrl];
  const imageUrls = image.map((src) =>
    src.startsWith("http") ? src : `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`
  );
  const condition =
    listing.specifications?.condition === "new"
      ? "https://schema.org/NewCondition"
      : listing.specifications?.condition === "used"
        ? "https://schema.org/UsedCondition"
        : undefined;

  const offers: ProductStructuredData["offers"] = {
    "@type": "Offer",
    price: listing.price,
    priceCurrency: listing.currency || "GEL",
    availability: "https://schema.org/InStock",
    url,
  };

  if (listing.type === "rent" && listing.priceUnit) {
    offers.priceSpecification = {
      "@type": "UnitPriceSpecification",
      price: listing.price,
      priceCurrency: listing.currency || "GEL",
      unitText: listing.priceUnit,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || listing.excerpt,
    image: imageUrls.length === 1 ? imageUrls[0] : imageUrls,
    url,
    sku: listing.id,
    offers,
    ...(condition && { condition }),
  };
}

/**
 * Build a JSON-LD ItemList of Products for a category page.
 */
export function buildProductListJsonLd(params: {
  listings: Listing[];
  listName: string;
  listUrl: string;
  baseUrl: string;
  page?: number;
  totalItems?: number;
}): object {
  const { listings, listName, listUrl, baseUrl, page = 1, totalItems } = params;
  const itemListElement = listings.map((listing, index) => ({
    "@type": "ListItem",
    position: (page - 1) * listings.length + index + 1,
    item: listingToProductJsonLd(listing, baseUrl),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    url: listUrl,
    numberOfItems: totalItems ?? listings.length,
    itemListElement,
  };
}

/** schema.org Article — for news detail. */
export interface ArticleStructuredData {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  image: string | string[];
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: { "@type": "Organization"; name: string };
  publisher?: { "@type": "Organization"; name: string; logo?: { "@type": "ImageObject"; url: string } };
}

/**
 * Map ApiNewsItem to schema.org Article JSON-LD.
 */
export function newsToArticleJsonLd(
  item: ApiNewsItem,
  canonicalUrl: string
): ArticleStructuredData {
  const image =
    item.imageUrl && item.imageUrl.trim()
      ? item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `${SITE_URL}${item.imageUrl.startsWith("/") ? "" : "/"}${item.imageUrl}`
      : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description:
      item.shortDescription ||
      (item.fullDescription
        ? item.fullDescription.replace(/<[^>]*>/g, "").slice(0, 160)
        : ""),
    image,
    url: canonicalUrl,
    datePublished: item.date,
    dateModified: item.updatedAt || item.date,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-default.png` },
    },
  };
}

/**
 * Truncate HTML or plain text to ~maxLength chars for meta description.
 */
export function truncateForMeta(text: string, maxLength: number = 160): string {
  const plain = typeof text === "string" ? text.replace(/<[^>]*>/g, "").trim() : "";
  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const end = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;
  return cut.slice(0, end).trim() + "…";
}

/** Format listing price for meta/snippet (buy: "1,500 ₾", rent: "1,500 ₾ - დღე"). */
export function formatListingPriceForMeta(listing: Listing): string {
  const hasDiscountedPrice =
    typeof listing.discountedPrice === "number" &&
    Number.isFinite(listing.discountedPrice) &&
    listing.discountedPrice >= 0 &&
    listing.discountedPrice < listing.price;
  const value = hasDiscountedPrice ? Number(listing.discountedPrice) : Number(listing.price);
  const num = Number.isFinite(value) ? value : 0;
  const formatted = num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const currencySymbol = (listing.currency || "GEL").toUpperCase() === "GEL" ? "₾" : "$";
  if (listing.type === "rent" && listing.priceUnit) {
    const unitLabel =
      listing.priceUnit === "day" ? "დღე" : listing.priceUnit === "week" ? "კვირა" : listing.priceUnit === "month" ? "თვე" : listing.priceUnit;
    return `${formatted} ${currencySymbol} - ${unitLabel}`;
  }
  return `${formatted} ${currencySymbol}`;
}

/**
 * Build meta description for a listing: price + truncated description (for SEO / OG).
 */
export function buildListingMetaDescription(listing: Listing, maxLength: number = 160): string {
  const priceStr = formatListingPriceForMeta(listing);
  const rawDesc = (listing.description || listing.excerpt || "").trim();
  const plain = rawDesc.replace(/<[^>]*>/g, "").trim();
  if (!plain) return priceStr;
  const allowed = Math.max(60, maxLength - priceStr.length - 3);
  const truncated = truncateForMeta(plain, allowed);
  return `${priceStr} · ${truncated}`;
}
