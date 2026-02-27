import type { Listing } from "@/types/listing";
import { ListingCard } from "./ListingCard";

interface ListingGridProps {
  listings: Listing[];
  /** Optional: custom empty message */
  emptyMessage?: string;
}

export function ListingGrid({ listings, emptyMessage }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-sm">
        <p className="text-zinc-500">
          {emptyMessage ?? "No listings match your filters. Try adjusting your search."}
        </p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="list"
      aria-label="Listing results"
    >
      {listings.map((listing) => (
        <li key={listing.id}>
          <ListingCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}
