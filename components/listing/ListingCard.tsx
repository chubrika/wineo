"use client";

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
    return `${value} ${currencySymbol} - ${unitLabel}`;
  }
  return `${value} ${currencySymbol}`;
}

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const href = `/${listing.type}/listing/${listing.slug}`;
  const priceLabel = formatPrice(listing);

  return (
    <article className="group overflow-hidden rounded-xl border border-zinc-200 bg-white  hover:border-zinc-300">
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
          <Image
            src={listing.imageUrl}
            alt={listing.imageAlt}
            fill
            className="object-cover"
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
          {(listing.ownerType === "business" && listing.ownerName) || listing.ownerType === "physical" ? (
            <p className="text-xs text-zinc-500 mb-4">
              {listing.ownerType === "business" ? listing.ownerName : "ფიზიკური პირი"}
            </p>
          ) : listing.ownerName ? (
            <p className="text-xs text-zinc-500 mb-4"> {listing.ownerName}</p>
          ) : null}
          <h2 className="font-medium text-zinc-900 line-clamp-2 text-sm">
            {listing.title}
          </h2>

          {listing.location && (
            <p className="mt-1 text-xs text-zinc-500">{listing.location}</p>
          )}
          <div className="border-t border-zinc-200 mt-4"></div>
         

          <div className="mt-3 flex justify-between">
          <p className="text-md font-medium text-zinc-900">
            {priceLabel}
          </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: toggle favorite (e.g. save to backend or local state)
              }}
              className="rounded-full cursor-pointer p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              aria-label="დამატება ფავორიტებში"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
