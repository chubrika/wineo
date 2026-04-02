"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/lib/api";

const errorMessages: Record<string, string> = {
  provider_denied: "Google sign-in was canceled.",
  bad_state: "Google sign-in could not be verified. Please try again.",
  not_configured: "Google sign-in is not configured right now.",
  db_not_connected: "The server is not connected to the database.",
  invalid_request: "Google returned an invalid sign-in request.",
  no_access_token: "Google did not return an access token.",
  invalid_google_profile: "Google did not return a valid user profile.",
  link_email_mismatch: "This Google email does not match the current account.",
  google_in_use: "This Google account is already linked to another user.",
  account_conflict: "This email is already linked to a different Google account.",
  oauth_failed: "Google sign-in could not be completed. Please try again.",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, setSession } = useAuth();
  const [message, setMessage] = useState("Loading...");
  const restoreAttemptedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const code = searchParams.get("code");
    if (code) {
      setMessage(
        "Google redirected to the frontend page directly. Set GOOGLE_REDIRECT_URI to the backend callback URL instead."
      );
      return () => {
        cancelled = true;
      };
    }

    const success = searchParams.get("success");
    if (success === "1") {
      if (user) {
        router.replace("/");
        return () => {
          cancelled = true;
        };
      }

      setMessage("Finishing Google sign-in...");

      if (loading || restoreAttemptedRef.current) {
        return () => {
          cancelled = true;
        };
      }

      restoreAttemptedRef.current = true;

      const restoreSession = async () => {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const { user: restoredUser } = await getMe();
            if (cancelled) return;
            setSession(restoredUser, null);
            router.replace("/");
            return;
          } catch {
            if (attempt < 2) {
              await wait(350);
            }
          }
        }

        if (!cancelled) {
          setMessage("Google sign-in finished, but the browser session could not be restored. Please try again.");
        }
      };

      void restoreSession();

      return () => {
        cancelled = true;
      };
    }

    const err = searchParams.get("error");
    if (!err) {
      router.replace("/");
      return () => {
        cancelled = true;
      };
    }

    setMessage(errorMessages[err] || errorMessages.oauth_failed);
    return () => {
      cancelled = true;
    };
  }, [loading, router, searchParams, setSession, user]);

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
