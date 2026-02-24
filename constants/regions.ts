import type { RegionSlug } from "@/types/listing";

export interface RegionItem {
  slug: RegionSlug;
  label: string;
}

export const REGIONS: RegionItem[] = [
  { slug: "kakheti", label: "Kakheti" },
  { slug: "imereti", label: "Imereti" },
  { slug: "racha", label: "Racha" },
  { slug: "kartli", label: "Kartli" },
  { slug: "adjara", label: "Adjara" },
];
