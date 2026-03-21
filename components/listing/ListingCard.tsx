"use client";

import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types/listing";
import { PromotionIcon } from "@/components/listing/PromotionIcon";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart } from "lucide-react";

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

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const href = `/${listing.type}/listing/${listing.slug}`;
  const priceLabel = formatPrice(listing);
  const hasDiscount =
    typeof listing.discountedPrice === "number" &&
    Number.isFinite(listing.discountedPrice) &&
    listing.discountedPrice >= 0 &&
    listing.discountedPrice < listing.price;
  const discountPercentLabel =
    typeof listing.discountedPercent === "number" &&
    Number.isFinite(listing.discountedPercent) &&
    listing.discountedPercent > 0
      ? Number(listing.discountedPercent.toFixed(2)).toString()
      : null;
  const discountedLabel = hasDiscount
    ? formatListingPriceValue(listing.discountedPrice as number, listing)
    : null;
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(listing.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing.id);
  };

  return (
    <article
      className={`group overflow-hidden rounded-lg border hover:border-zinc-300 ${
        listing.promotionType === "homepageTop"
          ? "border-purple-400/60 bg-purple-50/80"
          : listing.promotionType === "highlighted"
            ? "border-yellow-400/60 bg-yellow-50/80"
            : "border-zinc-200 bg-white"
      }`}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[14/11] w-full overflow-hidden  p-3 rounded-md">
          <Image
            src={listing.imageUrl}
            alt={listing.imageAlt}
            width={1200}
            height={943}
            className="h-full w-full rounded-md object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span className="absolute left-5 bottom-5 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-800">
            {listing.type === "buy" ? "იყიდე" : "იქირავე"}
          </span>
          {discountPercentLabel != null ? (
            <span className="absolute left-5 top-5 z-10 inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              -{discountPercentLabel}%
            </span>
          ) : listing.promotionType && listing.promotionType !== "none" ? (
            <span
              className={`absolute left-5 top-5 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white ${
                listing.promotionType === "homepageTop"
                  ? "bg-purple-600"
                  : listing.promotionType === "featured"
                    ? "bg-amber-500"
                    : "bg-yellow-500 text-zinc-900"
              }`}
            >
              <PromotionIcon type={listing.promotionType} />
              {listing.promotionType === "homepageTop" ? "VIP" : null}
            </span>
          ) : null}
          {listing.specifications && listing.specifications?.condition && (
            <span
              className={`absolute right-5 bottom-5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                listing.specifications.condition === "new"
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {listing.specifications?.condition === "new" ? "ახალი" : "მეორადი"}
            </span>
          )}
        </div>
        <div className="flex h-[115px] md:h-[130px] flex-col justify-between px-2 pt-3 pb-2 md:px-3 md:pt-4 md:pb-3">
          {/* {(listing.ownerType === "business" && listing.ownerName) || listing.ownerType === "physical" ? (
            <p className="text-xs text-zinc-500 mb-4">
              {listing.ownerType === "business" ? listing.ownerName : "ფიზიკური პირი"}
            </p>
          ) : listing.ownerName ? (
            <p className="text-xs text-zinc-500 mb-4"> {listing.ownerName}</p>
          ) : null} */}
          <div>
          <h2 className="min-h-[2.3rem] font-medium text-zinc-900 line-clamp-2 text-sm leading-tight">
            {listing.title}
          </h2>

          <p className="mt-1 flex flex-col justify-end text-xs text-zinc-500 line-clamp-1">
            {listing.location || "\u00A0"}
          </p>
          </div>
            <div>
            <div className="mt-2 md:mt-auto border-t border-zinc-200"></div>
         

         <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <p className="text-xs text-zinc-500 line-through">{priceLabel}</p>
            )}
             <p className="text-md font-medium text-zinc-900">
              {discountedLabel ?? priceLabel}
            </p>
          </div>
           <button
             type="button"
             onClick={handleWishlistClick}
             className={`rounded-full cursor-pointer p-1.5 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${inWishlist ? "text-red-500 hover:text-red-600" : "text-zinc-400 hover:text-red-500"}`}
             aria-label={inWishlist ? "სურვილების სიიდან ამოშლა" : "დამატება სურვილების სიაში"}
           >
             <Heart
               className="h-5 w-5"
               strokeWidth={2}
               fill={inWishlist ? "currentColor" : "none"}
             />
           </button>
         </div>
            </div>
        </div>
      </Link>
    </article>
  );
}
