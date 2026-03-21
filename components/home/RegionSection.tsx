"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRegions } from "@/lib/api";
import type { ListingType } from "@/types/listing";
import { ChevronRightIcon } from "lucide-react";

type RegionCardItem = {
  id: string;
  slug: string;
  label: string;
  description?: string;
  largeTitle?: string;
  shortDesc?: string;
  image?: string;
  index?: number;
};

export function RegionSection() {
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [regions, setRegions] = useState<RegionCardItem[]>([]);
  const [selectedRegionSlug, setSelectedRegionSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRegions()
      .then((list) => {
        if (cancelled) return;
        const ordered = [...(list as RegionCardItem[])];
        const firstSix = ordered.sort((a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER)).slice(0, 5);
        setRegions(firstSix);
        if (firstSix[0]?.slug) setSelectedRegionSlug(firstSix[0].slug);
      })
      .catch(() => {
        if (!cancelled) {
          setRegions([]);
          setSelectedRegionSlug("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const baseHref = listingType === "buy" ? "/buy" : "/rent";
  const featuredRegions = regions;
  const selectedRegion =
    featuredRegions.find((region) => region.slug === selectedRegionSlug) ?? featuredRegions[0];

  return (
    <section
      className="border-b border-zinc-200 py-8 md:py-14 sm:py-18 bg-[#f5f6f8]"
      aria-labelledby="regions-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="regions-heading" className="text-md md:text-2xl font-bold tracking-tight wineo-red sm:text-3xl">
          რეგიონებით ძებნა
        </h2>

        {/* იყიდე / იქირავე toggle */}
        <div className="mt-4 md:mt-6 flex items-center gap-2" role="group" aria-label="Listing type">
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
        {!loading && regions.length > 0 && selectedRegion && (
          <div className="mt-6 md:mt-8 grid gap-6 md:gap-8 lg:grid-cols-2 lg:items-start">
            <div className="relative bg-white p-3 rounded-lg border border-zinc-200 shadow-lg">
              <div
                className="min-h-[360px] w-full bg-cover bg-center sm:min-h-[420px]"
                style={selectedRegion.image ? { backgroundImage: `url("${selectedRegion.image}")` } : undefined}
                aria-label={selectedRegion.label}
                role="img"
              />
              <div className="absolute bottom-[-20px] right-[-20px] max-w-[50%] rounded-sm bg-white/95 p-4 shadow-lg backdrop-blur sm:p-5">
                <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">
                  {selectedRegion.label}
                </h3>
                {selectedRegion.shortDesc ? (
                  <p className="mt-2 text-xs italic text-zinc-600">&quot;{selectedRegion.shortDesc}&quot;</p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-zinc-700 text-sm whitespace-pre-line">
                {selectedRegion.description || "აღწერა დროებით არ არის ხელმისაწვდომი."}
              </p>

              <ul className="mt-6 space-y-3">
                {featuredRegions.map((region) => {
                  const isActive = region.slug === selectedRegion.slug;
                  return (
                    <li key={region.slug}>
                      <button
                        type="button"
                        onClick={() => setSelectedRegionSlug(region.slug)}
                        className={`w-full cursor-pointer rounded-md flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition sm:text-base ${
                          isActive
                            ? " border-l-3 border-l-[#8a052d]  bg-white"
                            : "border-zinc-200 bg-[#fbfcff]  text-zinc-700 hover:border-white hover:bg-white"
                        }`}
                      >
                        {region.largeTitle || region.label}
                        <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`${baseHref}?region=${encodeURIComponent(selectedRegion.slug)}`}
                className="mt-6 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-[#8a052d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#740426] active:bg-[#5f031f]"
              >
                განცხადებების ნახვა
              </Link>
            </div>
          </div>
        )}
        {!loading && regions.length === 0 && (
          <p className="mt-8 text-zinc-500">რეგიონები ვერ მოიძებნა.</p>
        )}
      </div>
    </section>
  );
}
