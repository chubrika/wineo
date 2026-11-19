import Link from "next/link";
import type { ApiGrape, GrapeColor } from "@/lib/api";
import { GRAPE_COLOR_LABELS, GRAPE_TYPE_LABELS, latinNameFromSlug } from "@/lib/encyclopedia";

const COLOR_DOT: Record<GrapeColor, string> = {
  white: "bg-[#e2b340]",
  red: "bg-[#c83b45]",
  rose: "bg-[#e07aa0]",
};

const PLACEHOLDER: Record<GrapeColor, string> = {
  white: "bg-[#c6a15a]",
  red: "bg-[#7a2433]",
  rose: "bg-[#c4818e]",
};

function traitLabel(grape: ApiGrape) {
  const tannins = grape.wineProfile?.tannins ?? "";
  const body = grape.wineProfile?.body ?? "";
  const acidity = grape.agronomy?.acidity ?? "";
  const firstAcidity = Number(acidity.match(/\d+(?:\.\d+)?/)?.[0]);
  if (tannins.includes("მაღალ")) return "ტანინიანი";
  if (body.includes("სრულ") || body.includes("სავსე")) return "სხეულიანი";
  if (Number.isFinite(firstAcidity) && firstAcidity >= 8) return "მაღალმჟავიანი";
  if (body.includes("მსუბუქ")) return "მსუბუქი";
  return "არომატული";
}

function PlaceholderArt({ color }: { color: GrapeColor }) {
  if (color === "white") {
    return (
      <svg viewBox="0 0 64 64" className="h-16 w-16 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M24 14h16M32 14v8" strokeLinecap="round" />
        <path d="M22 22h20l-2 16a8 8 0 0 1-16 0l-2-16Z" />
        <path d="M26 44h12v6H26z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 text-white/90" fill="currentColor" aria-hidden>
      <circle cx="32" cy="18" r="5" />
      <circle cx="22" cy="28" r="5.5" />
      <circle cx="42" cy="28" r="5.5" />
      <circle cx="27" cy="40" r="5.5" />
      <circle cx="39" cy="40" r="5.5" />
      <path d="M32 12c6-8 14-6 14-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GrapeCard({
  grape,
  onSelectRegion,
}: {
  grape: ApiGrape;
  onSelectRegion?: (regionId: string) => void;
}) {
  const regions = (grape.regions ?? []).filter((region) => region.label || region.slug).slice(0, 2);
  const latin = latinNameFromSlug(grape.slug);

  return (
    <article className="flex h-full flex-col rounded-3xl bg-white p-3 shadow-[0_10px_30px_rgba(60,40,20,0.05)]">
      <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${grape.image ? "bg-zinc-100" : PLACEHOLDER[grape.color]}`}>
        {grape.image ? (
          // Grape images are arbitrary URLs, outside next/image remote patterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={grape.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
            <PlaceholderArt color={grape.color} />
            <div className="px-4 text-center">
              <p className="text-lg font-semibold">{GRAPE_COLOR_LABELS[grape.color]} ჯიში</p>
              <p className="text-sm leading-5 text-white/80">{latin}</p>
            </div>
          </div>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm">
          <span className={`h-2 w-2 rounded-full ${COLOR_DOT[grape.color]}`} />
          {GRAPE_COLOR_LABELS[grape.color]}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-xl font-bold leading-tight tracking-tight text-zinc-900">{grape.name}</h3>
          <span className="max-w-[46%] text-right text-sm leading-5 text-zinc-400">{latin}</span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {GRAPE_TYPE_LABELS[grape.type]}
          <span className="px-1.5">·</span>
          {traitLabel(grape)}
        </p>
        {grape.description?.trim() && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">{grape.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {regions.map((region) =>
              onSelectRegion ? (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => onSelectRegion(region.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-zinc-300"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${COLOR_DOT[grape.color]}`} />
                  {region.label || region.slug}
                </button>
              ) : (
                <span
                  key={region.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${COLOR_DOT[grape.color]}`} />
                  {region.label || region.slug}
                </span>
              )
            )}
          </div>
          <Link href={`/encyclopedia/${grape.slug}`} className="shrink-0 text-sm font-medium text-[#8a052d] hover:underline">
            დეტალურად →
          </Link>
        </div>
      </div>
    </article>
  );
}
