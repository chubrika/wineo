import type { WineryType } from "@/lib/api";

export const WINERY_TYPE_LABELS: Record<WineryType, string> = {
  family: "ოჯახური",
  organic: "ბიო / ორგანული",
  industrial: "ინდუსტრიული",
};

export const WINEMAKING_METHOD_OPTIONS = ["ქვევრი", "კლასიკური", "მუხის კასრი", "ცქრიალა / პეტ-ნატი"] as const;

export const TOURISM_SERVICE_OPTIONS = [
  "დეგუსტაცია",
  "ვენახის ტური",
  "ტრადიციული სადილი",
  "მასტერკლასები",
  "ღამისთევა / სასტუმრო",
] as const;

export function formatCount(value?: number | null, suffix?: string) {
  if (value == null || !Number.isFinite(value)) return null;
  const text = new Intl.NumberFormat("ka").format(value);
  return suffix ? `${text} ${suffix}` : text;
}

export function externalHref(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

export function phoneHref(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return null;
  const tel = raw.replace(/[^\d+]/g, "");
  return tel ? `tel:${tel}` : null;
}

export function mapsHref(input: {
  coordinates?: { lat?: number; lng?: number } | null;
  address?: string;
  microzone?: string;
  regionLabel?: string;
}) {
  const lat = input.coordinates?.lat;
  const lng = input.coordinates?.lng;
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const query = [input.address, input.microzone, input.regionLabel].filter(Boolean).join(", ");
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
