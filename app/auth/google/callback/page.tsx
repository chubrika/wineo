"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const errorMessages: Record<string, string> = {
  provider_denied: "Google-ში შესვლა გაუქმდა.",
  bad_state: "Google-ში შესვლის მოთხოვნის დადასტურება ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
  not_configured: "Google-ში შესვლა კონფიგურირებული არ არის.",
  db_not_connected: "სერვერი არ არის დაკავშირებული მონაცემთა ბაზასთან.",
  invalid_request: "Google-ში შესვლამ არასწორი მოთხოვნა დააბრუნა.",
  no_access_token: "Google-მა წვდომის ტოკენი არ დააბრუნა.",
  invalid_google_profile: "Google-მა არ დააბრუნა სწორი მომხმარებლის პროფილი.",
  link_email_mismatch: "Google-ის ელ. ფოსტა არ ემთხვევა მიმდინარე ანგარიშს.",
  google_in_use: "ეს Google ანგარიში უკვე დაკავშირებულია სხვა მომხმარებელთან.",
  account_conflict: "ეს ელ. ფოსტა უკვე დაკავშირებულია სხვა Google ანგარიშთან.",
  oauth_failed: "Google-ში შესვლა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა..",
};

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setMessage(
        "Google redirected to the frontend page directly. Set GOOGLE_REDIRECT_URI to the backend callback URL instead."
      );
      return;
    }

    const success = searchParams.get("success");
    if (success === "1") {
      if (loading) {
        setMessage("Finishing Google sign-in...");
        return;
      }

      if (user) {
        router.replace("/");
        return;
      }

      setMessage("Google sign-in finished, but the browser session could not be restored. Please try again.");
      return;
    }

    const err = searchParams.get("error");
    if (!err) {
      router.replace("/");
      return;
    }

    setMessage(errorMessages[err] || errorMessages.oauth_failed);
  }, [loading, router, searchParams, user]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-zinc-800">{message}</p>
      <Link href="/" className="text-sm text-[var(--nav-link-active)] underline">
        Back to home
      </Link>
    </div>
  );
}

export default function GoogleAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
          Loading...
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
