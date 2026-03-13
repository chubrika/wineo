"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openLoginModal } = useLoginModal();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token?.trim()) {
      setError("ლინკი არასწორია ან არ არის მითითებული.");
      return;
    }
    if (newPassword.length < 6) {
      setError("პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("პაროლები არ ემთხვევა");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "პაროლის განახლება ვერ მოხერხდა");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token?.trim()) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-4 rounded-lg shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">პაროლის აღდგენა</h1>
          <p className="text-zinc-600">ლინკი არასწორია ან არ არის მითითებული. გამოიყენეთ ლინკი ელფოსტიდან ან მოითხოვეთ ახალი.</p>
          <Link
            href="/"
            onClick={openLoginModal}
            className="inline-flex justify-center rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white hover:opacity-90"
          >
            შესვლა
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-4 rounded-lg shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">პაროლი შეიცვალა</h1>
          <p className="text-zinc-600">პაროლი წარმატებით განახლდა. შეგიძლიათ შეხვიდეთ ანგარიშზე.</p>
          <button
            type="button"
            onClick={() => {
              openLoginModal();
              router.push("/");
            }}
            className="inline-flex justify-center rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white hover:opacity-90"
          >
            შესვლა
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6 bg-white p-4 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900">ახალი პაროლის დაყენება</h1>
          <p className="mt-1 text-sm text-zinc-600">შეიყვანეთ ახალი პაროლი ორჯერ.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-zinc-700">
              ახალი პაროლი
            </label>
            <div className="relative mt-1">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label={showPassword ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">მინიმუმ 6 სიმბოლო</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700">
              გაიმეორეთ პაროლი
            </label>
            <div className="relative mt-1">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label={showConfirm ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "იგზავნება..." : "პაროლის შეცვლა"}
          </button>
          <p className="text-center text-sm text-zinc-500">
            <Link href="/" className="text-[var(--nav-link-active)] hover:underline">
              ← მთავარი
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="animate-pulse flex flex-col items-center gap-4 max-w-md w-full">
        <div className="h-10 w-10 rounded-full bg-zinc-200" />
        <p className="text-zinc-600">იტვირთება...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
