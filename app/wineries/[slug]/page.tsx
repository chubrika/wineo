import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWineryBySlug } from "@/lib/api";
import { WineryDetail } from "@/components/wineries/WineryDetail";
import { buildMetadata, truncateForMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const winery = await getWineryBySlug(slug);
  if (!winery) return { title: "მარნები" };
  const place = [winery.region?.label, winery.microzone].filter(Boolean).join(", ");
  return buildMetadata({
    title: winery.name,
    description: truncateForMeta(winery.tagline || winery.description || "", 150) || `${winery.name}${place ? ` — ${place}` : ""}.`,
    path: `/wineries/${winery.slug || slug}`,
    image: winery.coverImage || winery.logo || undefined,
  });
}

export default async function WineryPage({ params }: Props) {
  const { slug } = await params;
  const winery = await getWineryBySlug(slug);
  if (!winery) notFound();
  return <WineryDetail winery={winery} />;
}
