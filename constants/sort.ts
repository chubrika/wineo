import type { ListingSortOption } from "@/types/listing";

export interface SortOptionConfig {
  value: ListingSortOption;
  label: string;
}

export const SORT_OPTIONS: SortOptionConfig[] = [
  { value: "newest", label: "უახლესი" },
  { value: "price_asc", label: "ფასი ზრდადობით" },
  { value: "price_desc", label: "ფასი კლებადობით" },
  { value: "featured", label: "რეკომენდირული" },
];
