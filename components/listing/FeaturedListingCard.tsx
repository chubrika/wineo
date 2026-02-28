import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types/listing";

function formatPrice(listing: Listing): string {
  const currencySymbol = listing.currency === "GEL" ? "₾" : "$";
  const value = listing.price.toLocaleString("en-US", { maximumFractionDigits: 0 });
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

interface FeaturedListingCardProps {
  listing: Listing;
}

export function FeaturedListingCard({ listing }: FeaturedListingCardProps) {
  const href = `/${listing.type}/listing/${listing.slug}`;
  const priceLabel = formatPrice(listing);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white hover:border-zinc-300">
      <div className="absolute right-3 top-3 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </span>
      </div>
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
          <Image
            src={listing.imageUrl}
            alt={listing.imageAlt}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-800">
            {listing.type}
          </span>
        </div>
        <div className="p-4">
          <h2 className="text-sm font-semibold text-zinc-900 line-clamp-2">
            {listing.title}
          </h2>
          {listing.location && (
            <p className="mt-1 text-xs text-zinc-500">{listing.location}</p>
          )}
          <div className="border-t border-zinc-200 mt-4"></div>
          <p className="mt-4 text-md font-semibold text-zinc-900">
            {priceLabel}
          </p>
        </div>
      </Link>
    </article>
  );
}
