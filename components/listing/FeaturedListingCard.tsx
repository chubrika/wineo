import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types/listing";

function formatPrice(listing: Listing): string {
  const currencySymbol = listing.currency === "GEL" ? "₾" : "$";
  const value = listing.price.toLocaleString("en-US", { maximumFractionDigits:  2});
  if (listing.type === "rent" && listing.priceUnit) {
    const unitLabel =
      listing.priceUnit === "day"
        ? "დღე"
        : listing.priceUnit === "week"
          ? "კვირა"
          : listing.priceUnit === "month"
            ? "თვე"
            : listing.priceUnit;
    return `${value} ${currencySymbol} - ${unitLabel}`;
  }
  return `${value} ${currencySymbol}`;
}

function formatListingPriceValue(value: number, listing: Listing): string {
  const currencySymbol = listing.currency === "GEL" ? "₾" : "$";
  const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (listing.type === "rent" && listing.priceUnit) {
    const unitLabel =
      listing.priceUnit === "day"
        ? "დღე"
        : listing.priceUnit === "week"
          ? "კვირა"
          : listing.priceUnit === "month"
            ? "თვე"
            : listing.priceUnit;
    return `${formatted} ${currencySymbol} - ${unitLabel}`;
  }
  return `${formatted} ${currencySymbol}`;
}

interface FeaturedListingCardProps {
  listing: Listing;
}

export function FeaturedListingCard({ listing }: FeaturedListingCardProps) {
  const href = `/${listing.type}/listing/${listing.slug}`;
  const priceLabel = formatPrice(listing);
  const hasDiscount =
    typeof listing.discountedPrice === "number" &&
    Number.isFinite(listing.discountedPrice) &&
    listing.discountedPrice >= 0 &&
    listing.discountedPrice < listing.price;
  const discountedLabel = hasDiscount
    ? formatListingPriceValue(listing.discountedPrice as number, listing)
    : null;
  const discountPercentLabel =
    typeof listing.discountedPercent === "number" &&
    Number.isFinite(listing.discountedPercent) &&
    listing.discountedPercent > 0
      ? Number(listing.discountedPercent.toFixed(2)).toString()
      : null; 
  return (
    <article className="group relative overflow-hidden bg-white">
      <div className="absolute right-5 top-5 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </span>
      </div>
      <Link href={href} className="block">
        <div className="relative aspect-[14/11] w-full overflow-hidden">
          <Image
            src={listing.imageUrl}
            alt={listing.imageAlt}
            width={1200}
            height={943}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          <span className="absolute left-5 top-5 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-800">
            {listing.type === "buy" ? "იყიდე" : "იქირავე"}
          </span>
        </div>
        <div className="px-0 py-2">
          <div className="flex items-center gap-2 mt-2 mb-2">
            <p className="text-md font-semibold text-zinc-900">
              {discountedLabel ?? priceLabel}
            </p>
            {hasDiscount && (
              <p className="text-md text-zinc-500 line-through">{priceLabel}</p>
            )}
            {discountPercentLabel && <p className="text-xs bg-red-500 text-white rounded-full px-2 py-1">{discountPercentLabel}%</p>}
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 line-clamp-2">
            {listing.title}
          </h2>
        </div>
      </Link>
    </article>
  );
}
