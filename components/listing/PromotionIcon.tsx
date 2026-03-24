"use client";

import { Sparkles, Star } from "lucide-react";
import type { PromotionType } from "@/types/listing";

const iconClass = "h-3 w-3 shrink-0";

/** Icon per promotion type: highlighted = sparkles, featured = star, homepageTop = home. */
export function PromotionIcon({ type }: { type?: PromotionType | null }) {
  if (!type || type === "none") return null;

  if (type === "highlighted") {
    return <Sparkles className={iconClass} aria-hidden />;
  }

  if (type === "featured") {
    return <Star className={iconClass} aria-hidden />;
  }

  if (type === "homepageTop") {
    return "VIP";
  }

  return null;
}
