import type { Metadata } from "next";
import { getGrapes, getRegions, getWineries, type WineryType } from "@/lib/api";
import { WineriesView, type WineryFilters } from "@/components/wineries/WineriesView";
import { buildMetadata } from "@/lib/seo";

type Search = {
  search?: string | string[];
  region?: string | string[];
  grape?: string | string[];
  method?: string | string[];
  type?: string | string[];
  visitors?: string | string[];
};

function first(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : "";
}

const TYPES = new Set<WineryType>(["family", "organic", "industrial"]);

export const metadata: Metadata = buildMetadata({
  title: "მარნები",
  description: "საქართველოს მარნები, დაყენების მეთოდები, ჯიშები და ღვინის ტურიზმი.",
  path: "/wineries",
});

export default async function WineriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const type = first(params.type);
  const initial: WineryFilters = {
    search: first(params.search),
    region: first(params.region),
    grape: first(params.grape),
    method: first(params.method),
    wineryType: TYPES.has(type as WineryType) ? (type as WineryType) : "",
    acceptsVisitors: first(params.visitors) === "1" || first(params.visitors) === "true",
  };
  const [regions, grapes, wineries] = await Promise.all([getRegions(), getGrapes(), getWineries()]);

  return (
    <div className="mx-auto max-w-7xl py-8">
      <WineriesView regions={regions} grapes={grapes} wineries={wineries} initial={initial} />
    </div>
  );
}
