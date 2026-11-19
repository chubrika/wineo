import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGrapeBySlug, getProducts } from "@/lib/api";
import { mapApiProductToListing } from "@/lib/listings";
import { GrapeDetail } from "@/components/encyclopedia/GrapeDetail";
import { buildMetadata, truncateForMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const grape = await getGrapeBySlug(slug);
  if (!grape) return { title: "ენციკლოპედია" };
  return buildMetadata({
    title: grape.name,
    description: truncateForMeta(grape.description || "", 150) || `${grape.name} — ყურძნის ჯიში.`,
    path: `/encyclopedia/${grape.slug || slug}`,
    image: grape.image || undefined,
  });
}

export default async function GrapePage({ params }: Props) {
  const { slug } = await params;
  const grape = await getGrapeBySlug(slug);
  if (!grape) notFound();

  const regions = grape.regions ?? [];
  const regionTokens = [...new Set(regions.flatMap((region) => [region.slug, region.label].filter(Boolean)))] as string[];
  let listings: ReturnType<typeof mapApiProductToListing>[] = [];
  if (regionTokens.length > 0) {
    try {
      const products = await getProducts({
        status: "active",
        regionSlug: regionTokens.join(","),
        limit: 12,
      });
      listings = products.map(mapApiProductToListing);
    } catch {
      listings = [];
    }
  }

  return <GrapeDetail grape={grape} listings={listings} />;
}
