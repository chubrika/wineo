"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ApiGrape, ApiRegion, GrapeColor, GrapeType } from "@/lib/api";
import { GRAPE_COLOR_LABELS, GRAPE_TYPE_LABELS, MAP_LABELS, mapSlugForRegion } from "@/lib/encyclopedia";
import { GeorgiaMap } from "./GeorgiaMap";
import { GrapeCard } from "./GrapeCard";

type Props = {
  regions: ApiRegion[];
  grapes: ApiGrape[];
  initialRegionSlug?: string;
};

function initialSelection(regions: ApiRegion[], initialRegionSlug?: string) {
  if (!initialRegionSlug) return { mapSlug: null as string | null, regionId: "" };
  const region = regions.find(
    (item) => item.slug === initialRegionSlug || mapSlugForRegion(item) === initialRegionSlug
  );
  if (!region) return { mapSlug: MAP_LABELS[initialRegionSlug] ? initialRegionSlug : null, regionId: "" };
  return { mapSlug: mapSlugForRegion(region), regionId: region.id };
}

export function EncyclopediaView({ regions, grapes, initialRegionSlug }: Props) {
  const start = initialSelection(regions, initialRegionSlug);
  const [mapSlug, setMapSlug] = useState<string | null>(start.mapSlug);
  const [regionId, setRegionId] = useState(start.regionId);
  const [color, setColor] = useState<"" | GrapeColor>("");
  const [type, setType] = useState<"" | GrapeType>("");
  const [search, setSearch] = useState("");

  const sortedRegions = useMemo(
    () => [...regions].sort((a, b) => (a.index ?? 0) - (b.index ?? 0) || a.label.localeCompare(b.label, "ka")),
    [regions]
  );

  const matchedRegions = mapSlug
    ? sortedRegions.filter((region) => mapSlugForRegion(region) === mapSlug)
    : [];
  const panelRegion = matchedRegions[0] ?? null;
  const microzones = [...new Set(matchedRegions.flatMap((region) => region.microzones ?? []).map((zone) => zone.trim()).filter(Boolean))];
  const panelGrapes = mapSlug
    ? grapes.filter((grape) =>
        (grape.regions ?? []).some((region) => {
          const slug = mapSlugForRegion({ slug: region.slug, label: region.label });
          return slug === mapSlug || matchedRegions.some((match) => match.id === region.id);
        })
      )
    : [];

  const filtered = grapes.filter((grape) => {
    if (regionId && !(grape.regions ?? []).some((region) => region.id === regionId)) return false;
    if (color && grape.color !== color) return false;
    if (type && grape.type !== type) return false;
    const query = search.trim().toLowerCase();
    if (query && !grape.name.toLowerCase().includes(query) && !grape.slug.includes(query)) return false;
    return true;
  });

  function selectMap(slug: string) {
    setMapSlug(slug);
    const match = sortedRegions.find((region) => mapSlugForRegion(region) === slug);
    setRegionId(match?.id ?? "");
  }

  function selectRegion(id: string) {
    setRegionId(id);
    const region = sortedRegions.find((item) => item.id === id);
    setMapSlug(region ? mapSlugForRegion(region) : null);
  }

  const panelTitle = panelRegion?.label || (mapSlug ? MAP_LABELS[mapSlug] : "") || "აირჩიეთ რეგიონი";
  const panelDescription =
    panelRegion?.description?.trim() ||
    panelRegion?.shortDesc?.trim() ||
    (mapSlug ? "აღწერა დროებით არ არის ხელმისაწვდომი." : "რუკაზე დააჭირეთ რეგიონს, რომ ნახოთ აღწერა, მიკროზონები და ჯიშები.");

  return (
    <div className="space-y-12">
      <section>
        <h1 className="nav-font-caps text-3xl text-[#8a052d]">ენციკლოპედია</h1>
        <p className="mt-2 max-w-2xl text-zinc-600">
          საქართველოს ღვინის რეგიონები და ყურძნის ჯიშები.
        </p>
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
          <GeorgiaMap regions={sortedRegions} selectedSlug={mapSlug} onSelect={selectMap} />
          <aside className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-zinc-900">{panelTitle}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-600">{panelDescription}</p>
            {microzones.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-zinc-900">მიკროზონები</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {microzones.map((zone) => (
                    <li key={zone} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700">
                      {zone}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mapSlug && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-zinc-900">ყურძნის ჯიშები</h3>
                {panelGrapes.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">ამ რეგიონზე ჯიში ჯერ არ არის მიბმული.</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {panelGrapes.map((grape) => (
                      <li key={grape.id}>
                        <Link href={`/encyclopedia/${grape.slug}`} className="text-sm text-[#8a052d] hover:underline">
                          {grape.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </aside>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">ყურძნის ჯიშები</h2>
              <span className="rounded-full bg-[#f8e4ea] px-2.5 py-1 text-xs font-medium text-[#c45b78]">
                {filtered.length} ჯიში
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              საქართველოს უნიკალური ვაზის გენოფონდი და მათი მევენახეობითი პოტენციალი
            </p>
          </div>
          <div className="inline-flex max-w-full flex-wrap rounded-full bg-white p-1 shadow-sm" role="group" aria-label="ფერის სწრაფი ფილტრი">
            <button
              type="button"
              onClick={() => setColor("")}
              className={`rounded-full px-4 py-2 text-sm ${color === "" ? "bg-[#f4f1ee] font-medium text-zinc-900 shadow-sm" : "text-zinc-600"}`}
            >
              ყველა
            </button>
            {(Object.keys(GRAPE_COLOR_LABELS) as GrapeColor[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setColor(value)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${color === value ? "bg-[#f4f1ee] font-medium text-zinc-900 shadow-sm" : "text-zinc-600"}`}
              >
                <span className={`h-2 w-2 rounded-full ${value === "white" ? "bg-[#e2b340]" : value === "red" ? "bg-[#c83b45]" : "bg-[#e07aa0]"}`} />
                {GRAPE_COLOR_LABELS[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr]">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ძებნა"
              aria-label="ჯიშის ძებნა"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-4 pr-11 text-sm shadow-sm outline-none focus:border-zinc-300"
            />
            <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </div>
          <select
            value={regionId}
            onChange={(event) => selectRegion(event.target.value)}
            aria-label="რეგიონი"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
          >
            <option value="">ყველა რეგიონი</option>
            {sortedRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.id === regionId ? `${region.label} (არჩეული)` : region.label}
              </option>
            ))}
          </select>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value as "" | GrapeColor)}
            aria-label="ფერი"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
          >
            <option value="">ყველა ფერი</option>
            {(Object.keys(GRAPE_COLOR_LABELS) as GrapeColor[]).map((value) => (
              <option key={value} value={value}>
                {GRAPE_COLOR_LABELS[value]}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "" | GrapeType)}
            aria-label="დანიშნულება"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
          >
            <option value="">ყველა დანიშნულება</option>
            {(Object.keys(GRAPE_TYPE_LABELS) as GrapeType[]).map((value) => (
              <option key={value} value={value}>
                {GRAPE_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-500">ჯიშები ვერ მოიძებნა</p>
        ) : (
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filtered.map((grape) => (
              <li key={grape.id}>
                <GrapeCard grape={grape} onSelectRegion={selectRegion} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
