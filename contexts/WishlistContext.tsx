"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  type ApiProduct,
} from "@/lib/api";

type WishlistContextValue = {
  /** Full list of wishlist products (active only). */
  items: ApiProduct[];
  /** Number of items (items.length). */
  count: number;
  loading: boolean;
  /** Refetch from API. */
  fetchWishlist: () => Promise<void>;
  /** Toggle product in wishlist. If not logged in, opens login modal. Optimistic update; reverts on API failure. */
  toggleWishlist: (productId: string) => Promise<void>;
  /** True if productId is in the current wishlist. */
  isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!token || !user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getWishlist(token);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [user, token, fetchWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user || !token) {
        openLoginModal();
        return;
      }

      const inList = items.some((p) => p.id === productId);
      const previousItems = items;

      if (inList) {
        setItems((prev) => prev.filter((p) => p.id !== productId));
        try {
          await removeFromWishlist(token, productId);
        } catch {
          setItems(previousItems);
        }
        return;
      }

      setItems((prev) => [...prev, { id: productId } as ApiProduct]);
      try {
        await addToWishlist(token, productId);
        const list = await getWishlist(token);
        setItems(list);
      } catch {
        setItems(previousItems);
      }
    },
    [user, token, items, openLoginModal]
  );

  const value: WishlistContextValue = {
    items,
    count: items.length,
    loading,
    fetchWishlist,
    toggleWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
