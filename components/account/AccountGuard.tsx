"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";

/**
 * Wraps account routes (profile, products, add-product, wishlist).
 * When user is not logged in, redirects to home and opens the login modal.
 */
export function AccountGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      openLoginModal();
    }
  }, [loading, user, router, openLoginModal]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-zinc-500">იტვირთება...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
