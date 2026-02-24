import type { Metadata } from "next";
import { getLatestListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing";
export const metadata: Metadata = {
  title: "All Listings",
  description: "Browse all winemaking equipment and vineyard listings. Buy or rent.",
};

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const { page: pageParam, sort } = await searchParams;
  const page = Math.max(1, parseInt(String(pageParam ?? "1"), 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { items, total } = await getLatestListings(PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          All Listings
        </h1>
        <p className="mt-2 text-zinc-600">
          {total} listing{total !== 1 ? "s" : ""} — sorted by latest.
        </p>
      </header>
      <section aria-label="Listings" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="col-span-full text-zinc-500">
            No listings yet.
          </p>
        ) : (
          items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        )}
      </section>
      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          {page > 1 && (
            <a
              href={page === 2 ? "/listings" : `/listings?page=${page - 1}`}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm text-zinc-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/listings?page=${page + 1}`}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Next
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
