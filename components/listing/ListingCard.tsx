import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types/listing";

function formatPrice(listing: Listing): string {
  const currencySymbol = listing.currency === "GEL" ? "₾" : "$";
  const value = listing.price.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  if (listing.type === "rent" && listing.priceUnit) {
    const unitLabel =
      listing.priceUnit === "day"
        ? "დღე"
        : listing.priceUnit === "week"
          ? "კვირა"
          : listing.priceUnit === "month"
            ? "თვე"
            : listing.priceUnit;
    return `${currencySymbol}${value}/${unitLabel}`;
  }
  return `${currencySymbol}${value}`;
}

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const href = `/${listing.type}/listing/${listing.slug}`;
  const priceLabel = formatPrice(listing);

  return (
    <article className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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
            {listing.type === "buy" ? "იყიდე" : "იქირავე"}
          </span>
          {listing.specifications && listing.specifications?.condition && (
            <span
              className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                listing.specifications.condition === "new"
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {listing.specifications?.condition === "new" ? "ახალი" : "მეორადი"}
            </span>
          )}
        </div>
        <div className="p-4">
          <h2 className="font-medium text-zinc-900 line-clamp-2">
            {listing.title}
          </h2>

          {listing.location && (
            <p className="mt-1 text-xs text-zinc-500">{listing.location}</p>
          )}
          <p className="mt-3 text-lg font-medium text-zinc-900">
            {priceLabel}
          </p>
        </div>
      </Link>
    </article>
  );
}
