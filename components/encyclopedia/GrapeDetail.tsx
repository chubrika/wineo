import Link from "next/link";
import type { ApiGrape, ApiGrapeRegion, ApiWinery } from "@/lib/api";
import { WineryCard } from "@/components/wineries/WineryCard";
import type { Listing } from "@/types/listing";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { GRAPE_COLOR_LABELS, GRAPE_TYPE_LABELS, latinNameFromSlug, mapSlugForRegion } from "@/lib/encyclopedia";

const COLOR_DOT: Record<string, string> = {
  white: "bg-[#e2b340]",
  red: "bg-[#c83b45]",
  rose: "bg-[#e07aa0]",
};

const CENTRAL = new Set([
  "shida-kartli",
  "kvemo-kartli",
  "mtskheta-mtianeti",
  "samtskhe-javakheti",
]);

function zoneLabel(region: ApiGrapeRegion) {
  const mapSlug = mapSlugForRegion({ slug: region.slug, label: region.label });
  if (!mapSlug) return null;
  if (mapSlug === "kakheti") return "აღმოსავლეთ საქართველო";
  if (CENTRAL.has(mapSlug)) return "შუა და სამხრეთ საქართველო";
  return "დასავლეთ საქართველო";
}

function excerpt(value?: string, max = 160) {
  const text = value?.replace(/\s+/g, " ").trim() || "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4f1] px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}

function FactList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl>
      {rows.map((row) => (
        <div key={row.label} className="border-b border-zinc-100 py-4 last:border-0">
          <dt className="text-xs tracking-wide text-zinc-400">{row.label}</dt>
          <dd className="mt-1 text-sm leading-6 text-zinc-800">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GrapeDetail({
  grape,
  listings,
  wineries = [],
}: {
  grape: ApiGrape;
  listings: Listing[];
  wineries?: ApiWinery[];
}) {
  const latin = latinNameFromSlug(grape.slug);
  const regions = grape.regions ?? [];
  const primary = regions[0];
  const zone = primary ? zoneLabel(primary) : null;
  const agronomy = grape.agronomy;
  const wine = grape.wineProfile;
  const stats = [
    agronomy?.ripeningPeriod?.trim() ? { label: "სიმწიფე", value: agronomy.ripeningPeriod.trim() } : null,
    agronomy?.sugarContent?.trim() ? { label: "შაქრიანობა", value: agronomy.sugarContent.trim() } : null,
    agronomy?.acidity?.trim() ? { label: "მჟავიანობა", value: agronomy.acidity.trim() } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const rows = (pairs: [string, string | undefined][]) =>
    pairs
      .map(([label, value]) => ({ label, value: value?.trim() || "" }))
      .filter((row) => row.value);

  const agronomyRows = rows([
    ["სიმწიფის პერიოდი", agronomy?.ripeningPeriod],
    ["შაქრიანობა", agronomy?.sugarContent],
    ["მჟავიანობა", agronomy?.acidity],
    ["ყინვაგამძლეობა", agronomy?.frostResistance],
    ["დაავადებებისადმი გამძლეობა", agronomy?.diseaseResistance],
  ]);

  const wineRows = rows([
    ["არომატები", wine?.aromas],
    ["ტანინები", wine?.tannins],
    ["სხეული", wine?.body],
    ["დაძველების პოტენციალი", wine?.agingPotential],
    ["გასტრონომია", wine?.foodPairing],
  ]);

  const regionNames = regions.map((region) => region.label || region.slug).filter(Boolean);
  const listingsHref = primary?.slug ? `/buy?region=${encodeURIComponent(primary.slug)}` : "/buy";

  return (
    <div className="mx-auto max-w-7xl py-8">
      <Link href="/encyclopedia" className="text-sm text-zinc-500 hover:text-zinc-900 px-4 md:px-0">
        ← ენციკლოპედია
      </Link>

      <section className="mt-6 grid items-start gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white px-6 py-8 text-center shadow-[0_10px_30px_rgba(60,40,20,0.04)]">
          {grape.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={grape.image} alt={grape.name} className="mx-auto h-40 w-40 rounded-full object-cover" />
          ) : (
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-zinc-200 text-5xl font-dejavu-sans text-zinc-800">
              {latin.slice(0, 1)}
            </div>
          )}
          {primary && (
            <p className="mt-6 text-xs font-medium leading-5 text-zinc-500">
              {primary.label}
              {zone ? ` · ${zone}` : ""}
            </p>
          )}
          <p className="mt-3 text-sm text-zinc-600">
            {GRAPE_COLOR_LABELS[grape.color]} {GRAPE_TYPE_LABELS[grape.type]} ჯიში
          </p>
        </aside>

        <div className="px-4 md:px-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              {grape.name} <span className="font-normal text-zinc-400">{latin}</span>
            </h1>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-zinc-700 shadow-sm">
              <span className={`h-2 w-2 rounded-full ${COLOR_DOT[grape.color]}`} />
              {GRAPE_COLOR_LABELS[grape.color]}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-zinc-700 shadow-sm">
              {GRAPE_TYPE_LABELS[grape.type]}
            </span>
          </div>

          {regionNames.length > 0 && (
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
              <span className="text-zinc-400">ძირითადი რეგიონები:</span>
              {regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/encyclopedia?region=${encodeURIComponent(region.slug || region.id)}`}
                  className="inline-flex items-center gap-1 hover:text-[#8a052d]"
                >
                  <span aria-hidden>📍</span>
                  {region.label || region.slug}
                </Link>
              ))}
            </p>
          )}

          {grape.description?.trim() && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">{grape.description}</p>
          )}

          {stats.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          )}
        </div>
      </section>

      {(agronomyRows.length > 0 || wineRows.length > 0) && (
        <section className="mt-12 grid gap-10 lg:grid-cols-2 px-4 md:px-0">
          {agronomyRows.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">აგრონომია</h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">Viticultural profile</p>
              <div className="mt-2">
                <FactList rows={agronomyRows} />
              </div>
            </div>
          )}
          {wineRows.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">ღვინის პროფილი</h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">Sensory notes</p>
              <div className="mt-2">
                <FactList rows={wineRows} />
              </div>
            </div>
          )}
        </section>
      )}

      {regions.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4 px-4 md:px-0">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">გავრცელების რეგიონები</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {grape.name} გვხვდება ამ რეგიონებში.
              </p>
            </div>
            <Link href="/encyclopedia" className="shrink-0 text-sm text-[#8a052d] hover:underline">
              ყველა ნახვა ({regions.length})
            </Link>
          </div>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {regions.map((region) => {
              const zones = (region.microzones ?? []).filter(Boolean);
              const text = excerpt(region.shortDesc || region.description);
              return (
                <li key={region.id} className="rounded-none md:rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(60,40,20,0.04)]">
                  <Link
                    href={`/encyclopedia?region=${encodeURIComponent(region.slug || region.id)}`}
                    className="text-base font-semibold text-zinc-900 hover:text-[#8a052d]"
                  >
                    {region.label || region.slug}
                  </Link>
                  {text && <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>}
                  {zones.length > 0 && (
                    <p className="mt-3 text-sm text-zinc-500">{zones.slice(0, 6).join(" · ")}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-12 px-4 md:px-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">მარნები, რომლებიც ამ ჯიშს აყენებენ</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {wineries.length > 0
                ? `${grape.name} მიბმულია ამ მარნებზე.`
                : "ამ ჯიშზე მარანი ჯერ არ არის მიბმული."}
            </p>
          </div>
          {wineries.length > 0 && (
            <Link href={`/wineries?grape=${encodeURIComponent(grape.slug)}`} className="shrink-0 text-sm text-[#721c24] hover:underline">
              ყველა ნახვა ({wineries.length})
            </Link>
          )}
        </div>
        {wineries.length > 0 && (
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wineries.map((winery) => (
              <li key={winery.id}>
                <WineryCard winery={winery} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4 px-4 md:px-0">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">განცხადებები ამ რეგიონებიდან</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {regionNames.length > 0
                ? `${regionNames.join(", ")} — აქტიური განცხადებები.`
                : "ამ ჯიშზე რეგიონი მიბმული არ არის."}
            </p>
          </div>
          {listings.length > 0 && (
            <Link href={listingsHref} className="shrink-0 text-sm text-[#8a052d] hover:underline">
              ყველა ნახვა{listings.length < 12 ? ` (${listings.length})` : ""}
            </Link>
          )}
        </div>
        <div className="mt-5">
          <ListingGrid listings={listings.slice(0, 4)} emptyMessage="ამ რეგიონებიდან აქტიური განცხადება ვერ მოიძებნა." />
        </div>
      </section>
    </div>
  );
}
