import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getListingBySlug, getListings } from "@/lib/listings";
import { SITE_NAME, SITE_URL } from "@/constants/site";

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
  const description = listing.excerpt;
  const url = `${SITE_URL}/buy/${listing.slug}`;
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  const listings = await getListings("buy");
  return listings.map((l) => ({ slug: l.slug }));
}

export default async function BuyListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug("buy", slug);
  if (!listing) notFound();

  const price = listing.price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-zinc-500" aria-label="Breadcrumb">
        <Link href="/buy" className="hover:text-zinc-700">
          Buy
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{listing.title}</span>
      </nav>

      <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="relative aspect-[16/10] w-full bg-zinc-100">
          <Image
            src={listing.imageUrl}
            alt={listing.imageAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
        <div className="p-6 sm:p-8">
          <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
            For sale
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-zinc-900">
            {price}
          </p>
          {listing.location && (
            <p className="mt-1 text-sm text-zinc-500">
              Location: {listing.location}
            </p>
          )}
          <div className="mt-6 prose prose-zinc max-w-none">
            <p className="text-zinc-600">{listing.description}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
