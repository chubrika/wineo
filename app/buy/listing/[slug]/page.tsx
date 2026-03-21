import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getListingBySlug, getListings } from "@/lib/listings";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import {
  listingToProductJsonLd,
  buildMetadata,
  buildListingMetaDescription,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ListingImageGallery } from "@/components/listing/ListingImageGallery";
import { RichTextContent } from "@/components/listing/RichTextContent";
import { AddToWishlistButton } from "@/components/listing/AddToWishlistButton";
import { Phone } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug("buy", slug);
  if (!listing) {
    return { title: "Not Found" };
  }
  const title = listing.title;
  const description = buildListingMetaDescription(listing);
  const path = `/buy/listing/${listing.slug}`;
  const image = listing.images?.[0] || listing.imageUrl;
  return buildMetadata({
    title: `${title} | ${SITE_NAME}`,
    description,
    path,
    image: image || undefined,
  });
}

export async function generateStaticParams() {
  const listings = await getListings("buy");
  return listings.map((l) => ({ slug: l.slug }));
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ka-GE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function BuyListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug("buy", slug);
  if (!listing) notFound();
  if (listing.type === "rent" && listing.slug)
    redirect(`/rent/listing/${listing.slug}`);
  if (listing.type === "rent") notFound();

  const productJsonLd = listingToProductJsonLd(listing, SITE_URL);

  const priceNum = Number(listing.price);
  const safePrice = Number.isFinite(priceNum) ? priceNum : 0;
  const discountedPriceNum = Number(listing.discountedPrice);
  const hasDiscount =
    Number.isFinite(discountedPriceNum) &&
    discountedPriceNum >= 0 &&
    discountedPriceNum < safePrice;
  const isGEL = (listing.currency || "USD").toUpperCase() === "GEL";
  const price = isGEL
    ? `${safePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })} ₾`
    : `$${safePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const discountedPrice = hasDiscount
    ? isGEL
      ? `${discountedPriceNum.toLocaleString("en-US", { maximumFractionDigits: 2 })} ₾`
      : `$${discountedPriceNum.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
    : null;

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : [listing.imageUrl];
  const ownerLabel =
    listing.ownerType === "physical"
      ? "ფიზიკური პირი"
      : (listing.ownerName ?? "—");
  const specEntries =
    listing.specifications && typeof listing.specifications === "object"
      ? Object.entries(listing.specifications).filter(
          ([k, v]) =>
            v !== undefined && v !== null && v !== "" && k !== "condition",
        )
      : [];
  const condition = listing.specifications?.condition;
  const attributeEntries =
    Array.isArray(listing.attributes) && listing.attributes.length > 0
      ? listing.attributes.filter(
          (a) =>
            a &&
            a.name != null &&
            a.slug != null &&
            Array.isArray(a.values) &&
            a.values.length > 0,
        )
      : [];

  return (
    <div className="mx-auto max-w-6xl bg-white px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={productJsonLd} />
      <nav className="mb-6 text-sm text-zinc-500" aria-label="Breadcrumb">
        <Link href="/buy" className="hover:text-zinc-700">
          ყიდვა
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{listing.title}</span>
      </nav>

      {/* Three columns: left gallery, center info, right price */}
      <div className="grid grid-cols-1 gap-8 pb-24 md:pb-0 lg:grid-cols-12">
        {/* Left: image + gallery */}
        <div className="lg:col-span-4">
          <ListingImageGallery
            images={images}
            alt={listing.imageAlt}
            condition={condition}
            promotionType={listing.promotionType}
          />
        </div>

        {/* Center: product info */}
        <div className="lg:col-span-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
              <span>ID: {listing.itemId}</span>
              {/* {listing.views != null && <span>{listing.views} ნახვა</span>} */}
              <span>{formatDate(listing.createdAt)}</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 sm:text-xl">
              {listing.title}
            </h1>
            <div className="border-t border-zinc-200" />
            <div className="space-y-1 text-xs">
              <div className="text-zinc-700">
                <span className="rounded-[4px] bg-zinc-200 p-[5px] text-[10px] font-medium text-zinc-900">
                  {ownerLabel}{" "}
                </span>
              </div>
              <p className="text-zinc-700">{listing.ownerName}</p>
              {listing.ownerProductCount != null && (
                <p className="text-zinc-500">
                  {listing.ownerProductCount} განცხადება
                </p>
              )}
              {listing.location && (
                <p className="text-zinc-600">{listing.location}</p>
              )}
            </div>

            <div className="border-t border-zinc-200 pt-4" />
            <RichTextContent content={listing.description ?? ""} />
          </div>
        </div>

        {/* Right: price + add to favorites */}
        <div className="hidden lg:col-span-3 lg:block">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:sticky md:top-[72px]">
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{discountedPrice ?? price}</p>
              {hasDiscount && <p className="text-sm text-zinc-500 line-through">{price}</p>}
            </div>

            {listing.ownerPhone && (
              <>
                <div className="border-t border-zinc-200 pt-4" />
                <p className="text-zinc-700">
                  <a
                    href={`tel:${listing.ownerPhone}`}
                    className="flex items-center justify-center gap-2 rounded-[4px] border border-blue-500 p-[10px] text-zinc-900 hover:no-underline"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-green-500" />
                    (+995){listing.ownerPhone}
                  </a>
                </p>
              </>
            )}
            <AddToWishlistButton productId={listing.id} />
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom bar with price, call, wishlist */}
      <div className="fixed bottom-[58px] left-0 right-0 z-40 flex justify-between items-center gap-3 border-t border-zinc-200 bg-white px-4 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
        <div>
          <p className="text-lg font-semibold text-zinc-900">{discountedPrice ?? price}</p>
          {hasDiscount && <p className="text-xs text-zinc-500 line-through">{price}</p>}
        </div>
        <div className="flex items-center gap-2">
          {listing.ownerPhone && (
            <a
              href={`tel:${listing.ownerPhone}`}
              className="flex items-center justify-center gap-2 rounded-full border border-blue-500 bg-blue-50 px-2.5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              <Phone className="h-5 w-5 shrink-0 text-green-600" />
            </a>
          )}
          <AddToWishlistButton productId={listing.id} iconOnly />
        </div>
      </div>

      {/* Bottom: specifications */}
      {(condition || specEntries.length > 0 || attributeEntries.length > 0) && (
        <section className="mt-10 border-t border-zinc-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            მახასიათებლები
          </h2>
          <dl className="flex flex-col gap-3 w-full md:w-[50%]">
            {condition && (
              <div className="flex items-center gap-2">
                <dt className="shrink-0 text-sm font-medium text-zinc-500">
                  მდგომარეობა
                </dt>
                <span
                  className="min-w-[20px] flex-1 border-b border-dashed border-zinc-300"
                  aria-hidden
                />
                <dd className="shrink-0 text-sm capitalize text-zinc-900">
                  {condition === "new" ? "ახალი" : "მეორადი"}
                </dd>
              </div>
            )}
            {specEntries.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <dt className="shrink-0 text-sm font-medium capitalize text-zinc-500">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </dt>
                <span
                  className="min-w-[20px] flex-1 border-b border-dashed border-zinc-300"
                  aria-hidden
                />
                <dd className="shrink-0 text-sm text-zinc-900">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </dd>
              </div>
            ))}
            {attributeEntries.map((attr) => (
              <div key={attr.slug} className="flex items-center gap-2">
                <dt className="shrink-0 text-sm font-medium text-zinc-500">
                  {attr.name}
                </dt>
                <span
                  className="min-w-[20px] flex-1 border-b border-dashed border-zinc-300"
                  aria-hidden
                />
                <dd className="shrink-0 text-sm text-zinc-900">
                  {attr.values.join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
