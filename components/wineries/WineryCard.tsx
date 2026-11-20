import Link from "next/link";
import type { ApiWinery } from "@/lib/api";
import { WINERY_TYPE_LABELS } from "@/lib/wineries";

function excerpt(value?: string) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

export function WineryCard({ winery }: { winery: ApiWinery }) {
  const regionLabel = winery.region?.label || winery.region?.slug || "";
  const place = [regionLabel, winery.microzone?.trim()].filter(Boolean).join(", ");
  const grapes = (winery.grapes ?? []).filter((grape) => grape.name || grape.slug).slice(0, 3);
  const summary = excerpt(winery.description) || excerpt(winery.tagline);
  const visitors = Boolean(winery.tourism?.acceptsVisitors);
  const href = `/wineries/${winery.slug}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(60,40,20,0.06)]">
      <div className="relative aspect-[16/10] bg-[#efe6df]">
        {winery.coverImage ? (
          // Cover images are arbitrary URLs, outside next/image remote patterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={winery.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#8d3a45] to-[#3d1016]" />
        )}
        <div className="absolute left-3 top-3 flex max-w-[75%] flex-wrap gap-1.5">
          {regionLabel && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-zinc-800 shadow-sm backdrop-blur-sm">
              {regionLabel}
            </span>
          )}
          {visitors && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-zinc-800 shadow-sm backdrop-blur-sm">
              იღებს სტუმრებს
            </span>
          )}
        </div>
        {winery.foundedYear ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
            EST. {winery.foundedYear}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        <h2 className="font-dejavu-sans font-bold text-[1.35rem] font-semibold leading-tight tracking-tight text-zinc-900">
          <Link href={href} className="hover:text-[#721c24]">
            {winery.name}
          </Link>
        </h2>
        {place && <p className="mt-1 text-sm text-zinc-500">{place}</p>}
        {summary && <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">{summary}</p>}

        {grapes.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {grapes.map((grape) => (
              <li key={grape.id} className="rounded-full bg-[#f6e7ea] px-2.5 py-1 text-xs text-[#6d3b44]">
                {grape.name || grape.slug}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
          <p className="text-sm font-medium text-zinc-800">
            {visitors ? "დეგუსტაცია" : WINERY_TYPE_LABELS[winery.wineryType]}
          </p>
          <Link href={href} className="shrink-0 text-sm font-medium text-[#721c24] hover:underline">
            მარნის ნახვა →
          </Link>
        </div>
      </div>
    </article>
  );
}
