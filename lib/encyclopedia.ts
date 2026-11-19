import type { GrapeColor, GrapeType } from "@/lib/api";

export const GRAPE_COLOR_LABELS: Record<GrapeColor, string> = {
  white: "თეთრი",
  red: "წითელი",
  rose: "ვარდისფერი",
};

export const GRAPE_TYPE_LABELS: Record<GrapeType, string> = {
  wine: "საღვინე",
  table: "სასუფრე",
  universal: "უნივერსალური",
};

export function latinNameFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Canonical slugs baked into public/georgia.svg */
export const MAP_LABELS: Record<string, string> = {
  kakheti: "კახეთი",
  imereti: "იმერეთი",
  "shida-kartli": "შიდა ქართლი",
  "kvemo-kartli": "ქვემო ქართლი",
  "racha-lechkhumi": "რაჭა-ლეჩხუმი",
  samegrelo: "სამეგრელო",
  guria: "გურია",
  adjara: "აჭარა",
  "samtskhe-javakheti": "სამცხე-ჯავახეთი",
  "mtskheta-mtianeti": "მცხეთა-მთიანეთი",
  abkhazia: "აფხაზეთი",
};

const SLUG_ALIASES: Record<string, string> = {
  racha: "racha-lechkhumi",
  "racha-lechkhumi-kvemo-svaneti": "racha-lechkhumi",
  "samegrelo-zemo-svaneti": "samegrelo",
  ajara: "adjara",
  ajaria: "adjara",
  samtskhe: "samtskhe-javakheti",
  mtskheta: "mtskheta-mtianeti",
  mtianeti: "mtskheta-mtianeti",
};

const LABEL_NEEDLES: [string, string][] = [
  ["შიდაქართლ", "shida-kartli"],
  ["შიდა ქართლ", "shida-kartli"],
  ["ქვემოქართლ", "kvemo-kartli"],
  ["ქვემო ქართლ", "kvemo-kartli"],
  ["სამეგრელ", "samegrelo"],
  ["რაჭა", "racha-lechkhumi"],
  ["ლეჩხუმ", "racha-lechkhumi"],
  ["სამცხე", "samtskhe-javakheti"],
  ["ჯავახეთ", "samtskhe-javakheti"],
  ["მცხეთა", "mtskheta-mtianeti"],
  ["მთიანეთ", "mtskheta-mtianeti"],
  ["კახეთ", "kakheti"],
  ["იმერეთ", "imereti"],
  ["გურია", "guria"],
  ["აჭარ", "adjara"],
  ["აფხაზ", "abkhazia"],
];

export function mapSlugForRegion(region: { slug?: string; label?: string }): string | null {
  const slug = (region.slug || "").trim().toLowerCase();
  if (slug && MAP_LABELS[slug]) return slug;
  if (slug && SLUG_ALIASES[slug]) return SLUG_ALIASES[slug];

  const label = (region.label || "").trim().toLowerCase();
  for (const [needle, mapSlug] of LABEL_NEEDLES) {
    if (label.includes(needle)) return mapSlug;
  }
  return null;
}
