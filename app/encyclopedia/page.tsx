import type { Metadata } from "next";
import { getGrapes, getRegions, getWineries } from "@/lib/api";
import { EncyclopediaView } from "@/components/encyclopedia/EncyclopediaView";
import { buildMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ region?: string }> };

export const metadata: Metadata = buildMetadata({
  title: "ენციკლოპედია",
  description: "საქართველოს ღვინის რეგიონები და ყურძნის ჯიშების კატალოგი.",
  path: "/encyclopedia",
});

export default async function EncyclopediaPage({ searchParams }: Props) {
  const { region } = await searchParams;
  const [regions, grapes, wineries] = await Promise.all([getRegions(), getGrapes(), getWineries()]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-0">
      <EncyclopediaView regions={regions} grapes={grapes} wineries={wineries} initialRegionSlug={region} />
    </div>
  );
}
