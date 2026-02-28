import type { ApiProduct, PromotionType } from "@/lib/api";
import type { Listing } from "@/types/listing";

export function isPromotionActive(item: {
  promotionType?: PromotionType;
  promotionExpiresAt?: string | null;
}): boolean {
  const type = item.promotionType ?? "none";
  if (type === "none") return false;
  const expiresAt = item.promotionExpiresAt ? new Date(item.promotionExpiresAt) : null;
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) return false;
  return expiresAt.getTime() > Date.now();
}

export function getEffectivePromotionType(item: {
  promotionType?: PromotionType;
  promotionExpiresAt?: string | null;
}): PromotionType {
  const type = item.promotionType ?? "none";
  if (type === "homepageTop" || type === "featured" || type === "highlighted") {
    return isPromotionActive(item) ? type : "none";
  }
  return "none";
}

export function getPromotionRank(item: {
  promotionType?: PromotionType;
  promotionExpiresAt?: string | null;
}): number {
  const type = getEffectivePromotionType(item);
  if (type === "homepageTop") return 0;
  if (type === "featured") return 1;
  if (type === "highlighted") return 2;
  return 3;
}

export function compareByPromotionThenCreatedAtDesc(
  a: Pick<Listing, "promotionType" | "promotionExpiresAt" | "createdAt">,
  b: Pick<Listing, "promotionType" | "promotionExpiresAt" | "createdAt">
): number {
  const ra = getPromotionRank(a);
  const rb = getPromotionRank(b);
  if (ra !== rb) return ra - rb;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function normalizeApiProductPromotion(api: ApiProduct): Pick<
  Listing,
  "promotionType" | "promotionExpiresAt"
> {
  const promotionType = getEffectivePromotionType(api);
  const promotionExpiresAt = isPromotionActive(api) ? api.promotionExpiresAt ?? null : null;
  return { promotionType, promotionExpiresAt };
}

