"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { Heart } from "lucide-react";

interface AddToWishlistButtonProps {
  productId: string;
  className?: string;
}

export function AddToWishlistButton({ productId, className }: AddToWishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(productId)}
      className={
        className ??
        `mt-4 w-full cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition flex items-center justify-center gap-2 ${
          inWishlist
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
        }`
      }
    >
      <Heart
        className={`h-5 w-5 shrink-0 ${inWishlist ? "text-red-500" : ""}`}
        strokeWidth={2}
        fill={inWishlist ? "currentColor" : "none"}
      />
      {inWishlist ? "ამოშლა" : "დამატება"}
    </button> 
  );
}
