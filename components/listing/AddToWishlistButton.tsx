"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { Heart } from "lucide-react";

interface AddToWishlistButtonProps {
  productId: string;
  className?: string;
  /** Show only the heart icon (e.g. for fixed mobile bar) */
  iconOnly?: boolean;
}

export function AddToWishlistButton({ productId, className, iconOnly }: AddToWishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const baseIconOnly =
    "shrink-0 cursor-pointer rounded-full border p-2.5 transition ";
  const iconOnlyClass =
    inWishlist
      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50";

  const resolvedClassName = iconOnly
    ? `${baseIconOnly}${iconOnlyClass}${className ? ` ${className}` : ""}`
    : (className ??
        `mt-4 w-full cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition flex items-center justify-center gap-2 ${
          inWishlist
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
        }`);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(productId)}
      className={resolvedClassName}
      aria-label={inWishlist ? "ამოშლა" : "დამატება"}
    >
      <Heart
        className={`h-5 w-5 shrink-0 ${inWishlist ? "text-red-500" : ""}`}
        strokeWidth={2}
        fill={inWishlist ? "currentColor" : "none"}
      />
      {!iconOnly && (inWishlist ? "ამოშლა" : "დამატება")}
    </button> 
  );
}
