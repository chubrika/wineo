import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/api";
import { searchListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing";
import type { CategorySlug } from "@/types/listing";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const list = await getCategories({ roots: true });
  return list.filter((c) => c.active).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const list = await getCategories({ roots: true });
  const category = list.find((c) => c.active && c.slug === slug);
  if (!category) return { title: "Category" };
  return {
    title: `${category.name} — Winemaking Equipment`,
    description: `Browse ${category.name.toLowerCase()} listings. Buy or rent winemaking equipment in Georgia.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const list = await getCategories({ roots: true });
  const category = list.find((c) => c.active && c.slug === slug);
  if (!category) notFound();

  const { items, total } = await searchListings({
    categorySlug: slug as CategorySlug,
    limit: 24,
    page: 1,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {category.name}
        </h1>
        <p className="mt-2 text-zinc-600">
          {total} listing{total !== 1 ? "s" : ""} in this category.
        </p>
      </header>
      <section aria-label={`${category.name} listings`} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="col-span-full text-zinc-500">
            No listings in this category yet.
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
