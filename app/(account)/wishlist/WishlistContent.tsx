"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { mapApiProductToListing } from "@/lib/listings";
import { ListingCard } from "@/components/listing/ListingCard";
import { Heart } from "lucide-react";

export function WishlistContent() {
  const { user, loading: authLoading } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { items, loading: wishlistLoading } = useWishlist();

  if (authLoading) {
    return <p className="mt-4 text-zinc-500">იტვირთება...</p>;
  }

  if (!user) {
    return (
      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center">
        <Heart className="mx-auto h-12 w-12 text-zinc-400" strokeWidth={1.5} />
        <p className="mt-3 text-zinc-600">სურვილების სიის სანახავად შედით ანგარიშში.</p>
        <button
          type="button"
          onClick={openLoginModal}
          className="mt-4 rounded-lg bg-[var(--nav-link-active)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          შესვლა
        </button>
      </div>
    );
  }

  if (wishlistLoading) {
    return <p className="mt-4 text-zinc-500">იტვირთება...</p>;
  }

  const fullItems = items.filter((p) => p.slug && p.title);
  if (fullItems.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-zinc-400" strokeWidth={1.5} />
        <p className="mt-3 text-zinc-600">სურვილების სია.</p>
        <p className="mt-1 text-sm text-zinc-500">
          განცხადებებზე გულის ხატულაზე დაწკაპუნებით დაამატებთ მათ აქ.
        </p>
      </div>
    );
  }

  const listings = fullItems.map(mapApiProductToListing);
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
