"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  const verify = useCallback(async () => {
    if (!token?.trim()) {
      setStatus("error");
      setMessage("Invalid or missing verification link.");
      return;
    }
    try {
      const data = await verifyEmail(token);
      setStatus("success");
      setMessage(data.message ?? "ელ-ფოსტის ვერიფიკაცია წარმატებით დასრულდა.");
      if (data.user && data.token) {
        setSession(data.user, data.token);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Invalid or expired verification link.");
    }
  }, [token, setSession]);

  useEffect(() => {
    if (token === null) return;
    queueMicrotask(() => verify());
  }, [token, verify]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="animate-pulse flex flex-col items-center gap-4 max-w-md w-full">
          <div className="h-10 w-10 rounded-full bg-zinc-200" />
          <p className="text-zinc-600">ელ-ფოსტის ვერიფიკაცია...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">ელ ფოსტის ვერიფიკაცია</h1>
          <p className="text-zinc-600">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex justify-center rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white hover:opacity-90"
            >
              მთავარ გვერდზე გადასვლა
            </Link>
            <Link
              href="/profile"
              className="inline-flex justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50"
            >
              პროფილი
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900">ელ-ფოსტის ვერიფიკაცია ვერ მოხერხდა</h1>
        <p className="text-zinc-600">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white hover:opacity-90"
          >
            მთავარ გვერდზე გადასვლა
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50"
          >
            ანგარიშზე შესვლა
          </Link>
        </div>
      </div>
    </div>
  );
}
