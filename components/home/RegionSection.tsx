"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRegions } from "@/lib/api";
import type { ListingType } from "@/types/listing";

export function RegionSection() {
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [regions, setRegions] = useState<{ slug: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRegions()
      .then((list) => {
        if (cancelled) return;
        setRegions(list.map((r) => ({ slug: r.slug, label: r.label })));
      })
      .catch(() => {
        if (!cancelled) setRegions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const baseHref = listingType === "buy" ? "/buy" : "/rent";

  return (
    <section
      className="border-b border-zinc-200 bg-white py-14 sm:py-18"
      aria-labelledby="regions-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="regions-heading" className="text-2xl font-bold tracking-tight wineo-red sm:text-3xl">
          რეგიონებით ძებნა
        </h2>
        <p className="mt-2 text-zinc-600">
          მოიძიეთ პროდუქტები საქართველოს რეგიონებში.
        </p>

        {/* იყიდე / იქირავე toggle */}
        <div className="mt-6 flex items-center gap-2" role="group" aria-label="Listing type">
          <button
            type="button"
            onClick={() => setListingType("buy")}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              listingType === "buy"
                ? "bg-[#8a052d] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            იყიდე
          </button>
          <button
            type="button"
            onClick={() => setListingType("rent")}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              listingType === "rent"
                ? "bg-[#8a052d] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            იქირავე
          </button>
        </div>

        {loading && (
          <p className="mt-8 text-zinc-500" aria-live="polite">
            რეგიონები იტვირთება...
          </p>
        )}
        {!loading && regions.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-3">
            {regions.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`${baseHref}?region=${encodeURIComponent(slug)}`}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100 active:border-zinc-400"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!loading && regions.length === 0 && (
          <p className="mt-8 text-zinc-500">რეგიონები ვერ მოიძებნა.</p>
        )}
      </div>
    </section>
  );
}
