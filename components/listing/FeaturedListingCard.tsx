import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types/listing";

function formatPrice(listing: Listing): string {
  const value = listing.price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  if (listing.type === "rent" && listing.priceUnit) {
    return `${value}/${listing.priceUnit}`;
  }
  return value;
}

interface FeaturedListingCardProps {
  listing: Listing;
}

export function FeaturedListingCard({ listing }: FeaturedListingCardProps) {
  const href = `/${listing.type}/${listing.slug}`;
  const priceLabel = formatPrice(listing);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="absolute left-4 top-4 z-10">
        <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Featured
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
        <div className="p-5">
          <h2 className="text-lg font-semibold text-zinc-900 line-clamp-2">
            {listing.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
            {listing.excerpt}
          </p>
          <p className="mt-4 text-xl font-semibold text-zinc-900">
            {priceLabel}
          </p>
          {listing.location && (
            <p className="mt-1 text-xs text-zinc-500">{listing.location}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
