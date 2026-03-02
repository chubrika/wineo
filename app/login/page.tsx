"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Login is now a modal; redirect /login to home. */
export default function LoginRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
