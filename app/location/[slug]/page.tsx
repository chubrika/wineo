import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { searchListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing";
import { getRegions } from "@/lib/api";
import type { RegionSlug } from "@/types/listing";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const regions = await getRegions();
  return regions.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const regions = await getRegions();
  const region = regions.find((r) => r.slug === slug);
  if (!region) return { title: "Region" };
  return {
    title: `Winemaking Equipment in ${region.label}`,
    description: `Buy and rent winemaking equipment in ${region.label}, Georgia.`,
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const regions = await getRegions();
  const region = regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const { items, total } = await searchListings({
    regionSlug: slug as RegionSlug,
    limit: 24,
    page: 1,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {region.label}
        </h1>
        <p className="mt-2 text-zinc-600">
          {total} listing{total !== 1 ? "s" : ""} in this region.
        </p>
      </header>
      <section aria-label={`Listings in ${region.label}`} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="col-span-full text-zinc-500">
            No listings in this region yet.
          </p>
        ) : (
          items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        )}
      </section>
    </div>
  );
}
