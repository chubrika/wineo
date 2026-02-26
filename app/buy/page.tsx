import type { Metadata } from "next";
import { getListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing";
import { SITE_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: "Buy Winemaking Equipment",
  description:
    "Browse winemaking equipment for sale: crushers, presses, fermentation tanks, barrels, and more. Find quality gear for your wineo or home winery.",
  openGraph: {
    title: "Buy Winemaking Equipment",
    description:
      "Browse winemaking equipment for sale. Crushers, presses, tanks, barrels.",
  },
};

export default async function BuyPage() {
  const listings = await getListings("buy");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Buy Winemaking Equipment
        </h1>
        <p className="mt-2 text-zinc-600">
          Quality equipment for sale. Crushers, presses, fermentation, barrels, and more.
        </p>
      </div>

      {/* Placeholder: filters will be added here (components/filters or app-level) */}
      <section aria-label="Buy listings" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {listings.length === 0 ? (
          <p className="col-span-full text-zinc-500">
            No equipment for sale at the moment. Check back soon.
          </p>
        ) : (
          listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
        )}
      </section>
    </div>
  );
}
