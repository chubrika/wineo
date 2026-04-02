"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  provider_denied: "Google sign-in was cancelled.",
  bad_state: "Could not verify the Google sign-in request. Please try again.",
  not_configured: "Google sign-in is not configured.",
  db_not_connected: "The server is not connected to the database.",
  invalid_request: "Google sign-in returned an invalid request.",
  no_access_token: "Google did not return an access token.",
  invalid_google_profile: "Google did not return a valid user profile.",
  link_email_mismatch: "The Google email does not match the current account.",
  google_in_use: "This Google account is already linked to another user.",
  account_conflict: "This email is already linked to a different Google account.",
  oauth_failed: "Google sign-in failed. Please try again.",
};

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setMessage(
        "Google redirected to the frontend page directly. Set GOOGLE_REDIRECT_URI to the backend callback URL instead."
      );
      return;
    }

    const err = searchParams.get("error");
    if (!err) {
      router.replace("/");
      return;
    }

    setMessage(errorMessages[err] || errorMessages.oauth_failed);
  }, [router, searchParams]);

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
