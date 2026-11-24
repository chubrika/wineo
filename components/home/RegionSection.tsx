"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { ApiRegion } from "@/lib/api";
import type { ListingType } from "@/types/listing";
import { ChevronRightIcon } from "lucide-react";

export function RegionSection({ regions }: { regions: ApiRegion[] }) {
  const [listingType, setListingType] = useState<ListingType>("buy");
  const featuredRegions = useMemo(
    () =>
      [...regions]
        .sort(
          (a, b) =>
            (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER),
        )
        .slice(0, 5),
    [regions],
  );
  const initialSlug = featuredRegions[0]?.slug ?? "";
  const [selectedRegionSlug, setSelectedRegionSlug] = useState(initialSlug);
  const [visiblePhotoSlug, setVisiblePhotoSlug] = useState(initialSlug);
  const [risingPhotoSlug, setRisingPhotoSlug] = useState<string | null>(null);
  const [animateDescription, setAnimateDescription] = useState(false);
  const risingPhotoSlugRef = useRef<string | null>(null);
  risingPhotoSlugRef.current = risingPhotoSlug;

  const baseHref = listingType === "buy" ? "/buy" : "/rent";
  const selectedRegion =
    featuredRegions.find((region) => region.slug === selectedRegionSlug) ?? featuredRegions[0];
  const visiblePhoto =
    featuredRegions.find((region) => region.slug === visiblePhotoSlug) ?? selectedRegion;
  const risingPhoto = risingPhotoSlug
    ? (featuredRegions.find((region) => region.slug === risingPhotoSlug) ?? null)
    : null;

  function selectRegion(slug: string) {
    if (slug === selectedRegionSlug) return;
    setSelectedRegionSlug(slug);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisiblePhotoSlug(slug);
      setRisingPhotoSlug(null);
      return;
    }
    setAnimateDescription(true);
    setRisingPhotoSlug(slug);
  }

  function handlePhotoRiseEnd(slug: string) {
    if (risingPhotoSlugRef.current !== slug) return;
    setVisiblePhotoSlug(slug);
    setRisingPhotoSlug(null);
  }

  return (
    <section
      className="border-b border-zinc-200 py-8 md:py-14 sm:py-18 px-4 md:px-0"
      aria-labelledby="regions-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h2
            id="regions-heading"
            className="text-md tracking-widest md:text-2xl nav-font-caps font-bold tracking-tight wineo-red sm:text-3xl"
          >
            რეგიონებით ძებნა
          </h2>

          <div
            className="relative mt-4 inline-grid grid-cols-2 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_rgba(24,24,27,0.08)] md:mt-0"
            role="radiogroup"
            aria-label="განცხადების ტიპი"
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              const next = listingType === "buy" ? "rent" : "buy";
              setListingType(next);
              const target = event.currentTarget.querySelector<HTMLButtonElement>(
                `[data-type="${next}"]`,
              );
              target?.focus();
            }}
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#8a052d] shadow-[0_1px_2px_rgba(138,5,45,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none ${
                listingType === "rent" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button
              type="button"
              role="radio"
              data-type="buy"
              aria-checked={listingType === "buy"}
              tabIndex={listingType === "buy" ? 0 : -1}
              onClick={() => setListingType("buy")}
              className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a052d]/35 ${
                listingType === "buy" ? "text-white" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              იყიდე
            </button>
            <button
              type="button"
              role="radio"
              data-type="rent"
              aria-checked={listingType === "rent"}
              tabIndex={listingType === "rent" ? 0 : -1}
              onClick={() => setListingType("rent")}
              className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a052d]/35 ${
                listingType === "rent" ? "text-white" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              იქირავე
            </button>
          </div>
        </div>

        {featuredRegions.length > 0 && selectedRegion && (
          <div className="mt-6 md:mt-8 grid gap-6 md:gap-8 lg:grid-cols-2 lg:items-start">
            <div className="relative bg-white rounded-lg border border-zinc-200 shadow-lg">
              <div
                className="relative min-h-[360px] w-full overflow-hidden sm:min-h-[420px]"
                role="img"
                aria-label={selectedRegion.label}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={
                    visiblePhoto?.image
                      ? { backgroundImage: `url("${visiblePhoto.image}")` }
                      : undefined
                  }
                />
                {risingPhoto ? (
                  <div
                    key={risingPhoto.slug}
                    className="region-photo-rise absolute inset-0 bg-cover bg-center"
                    style={
                      risingPhoto.image
                        ? { backgroundImage: `url("${risingPhoto.image}")` }
                        : undefined
                    }
                    onAnimationEnd={() => handlePhotoRiseEnd(risingPhoto.slug)}
                  />
                ) : null}
              </div>
              <div
                key={selectedRegion.slug}
                className={`absolute bottom-[-20px] right-0 max-w-full md:right-[-20px] max-w-[100%] md:max-w-[50%] rounded-sm bg-white/95 p-4 shadow-lg backdrop-blur sm:p-5 ${
                  animateDescription ? "region-text-fade" : ""
                }`}
              >
                <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">
                  {selectedRegion.label}
                </h3>
                {selectedRegion.shortDesc ? (
                  <p className="mt-2 text-xs italic text-zinc-600">
                    &quot;{selectedRegion.shortDesc}&quot;
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <p
                key={selectedRegion.slug}
                className={`text-zinc-700 text-sm whitespace-pre-line ${
                  animateDescription ? "region-text-fade" : ""
                }`}
              >
                {selectedRegion.description ||
                  "აღწერა დროებით არ არის ხელმისაწვდომი."}
              </p>

              <ul className="mt-6 space-y-3">
                {featuredRegions.map((region) => {
                  const isActive = region.slug === selectedRegion.slug;
                  return (
                    <li key={region.slug}>
                      <button
                        type="button"
                        onClick={() => selectRegion(region.slug)}
                        aria-pressed={isActive}
                        className={`group relative w-full cursor-pointer overflow-hidden rounded-md flex items-center justify-between border-l-3 px-4 py-3 text-left text-sm font-medium transition-colors duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] sm:text-base ${
                          isActive
                            ? "border-l-[#8a052d] bg-white text-zinc-900"
                            : "border-l-transparent bg-[#fbfcff] text-zinc-700"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute inset-0 origin-left bg-[#f0d4dc] transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                        <span
                          className={`relative z-10 transition-[translate,color] duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-1 group-hover:text-[var(--wineo-red)] ${
                            isActive ? "text-[var(--wineo-red)]" : ""
                          }`}
                        >
                          {region.largeTitle || region.label}
                        </span>
                        <ChevronRightIcon
                          className="relative z-10 h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-1"
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`${baseHref}?region=${encodeURIComponent(selectedRegion.slug)}`}
                className="mt-6 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#8a052d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#740426] active:bg-[#5f031f] float-right"
              >
                განცხადებების ნახვა
              </Link>
            </div>
          </div>
        )}
        {featuredRegions.length === 0 && (
          <p className="mt-8 text-zinc-500">რეგიონები ვერ მოიძებნა.</p>
        )}
      </div>
    </section>
  );
}
