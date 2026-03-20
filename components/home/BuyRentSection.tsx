import Link from "next/link";
import { getListingsFromApi } from "@/lib/listings";
import { ListingCard } from "@/components/listing";

export async function BuyRentSection() {
  const [buyListings, rentListings] = await Promise.all([
    getListingsFromApi("buy", 4),
    getListingsFromApi("rent", 4),
  ]);

  const buyLatest = buyListings;
  const rentLatest = rentListings;

  return (
    <section
      className="border-b border-zinc-200 bg-zinc-50/50 py-14 sm:py-18"
      aria-labelledby="buy-rent-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {/* Buy */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold wineo-red flex items-center gap-2">
                <svg className="h-5 w-5 wine-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                იყიდე
              </h4>
              <Link
                href="/buy"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                ყველა →
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-2 md:gap-4">
              {buyLatest.length === 0 ? (
                <li className="col-span-full text-zinc-500">
                  განცხადებები ჯერ არ გაქვთ.
                </li>
              ) : (
                buyLatest.map((listing) => (
                  <li key={listing.id}>
                    <ListingCard listing={listing} />
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Rent */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold wineo-red flex items-center gap-2">
                <svg className="h-5 w-5 wine-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg> იქირავე
              </h4>
              <Link
                href="/rent"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                ყველა →
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-2 md:gap-4">
              {rentLatest.length === 0 ? (
                <li className="col-span-full text-zinc-500">
                  განცხადებები ჯერ არ გაქვთ.
                </li>
              ) : (
                rentLatest.map((listing) => (
                  <li key={listing.id}>
                    <ListingCard listing={listing} />
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
