import type { CategorySlug } from "@/types/listing";

export interface CategoryItem {
  slug: CategorySlug;
  label: string;
}

export const CATEGORIES: CategoryItem[] = [
  { slug: "wine-bottles", label: "Wine Bottles" },
  { slug: "winery-machinery", label: "Winery Machinery" },
  { slug: "vineyard-land", label: "Vineyard Land" },
  { slug: "barrels", label: "Barrels" },
  { slug: "wine-press-crusher", label: "Wine Press / Crusher" },
  { slug: "agricultural-equipment", label: "Agricultural Equipment" },
];
