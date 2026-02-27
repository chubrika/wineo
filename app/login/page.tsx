"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [userType, setUserType] = useState<"physical" | "business">("physical");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (tab === "login") {
        await login(email.trim(), password);
      } else {
        if (userType === "physical") {
          if (!firstName.trim() || !lastName.trim()) {
            setError("სახელი და გვარი სავალდებულოა");
            setSubmitting(false);
            return;
          }
        } else {
          if (!businessName.trim()) {
            setError("საბიზნესო სახელი სავალდებულოა");
            setSubmitting(false);
            return;
          }
        }
        if (password.length < 6) {
          setError("პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო");
          setSubmitting(false);
          return;
        }
        if (userType === "physical") {
          await register(email.trim(), password, "physical", { firstName: firstName.trim(), lastName: lastName.trim() });
        } else {
          await register(email.trim(), password, "business", { businessName: businessName.trim() });
        }
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError("");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
        {tab === "login" ? "შესვლა" : "რეგისტრაცია"}
      </h1>

      {/* Tabs */}
      <div className="mt-6 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => switchTab("login")}
          className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
            tab === "login"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          შესვლა
        </button>
        <button
          type="button"
          onClick={() => switchTab("register")}
          className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
            tab === "register"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          რეგისტრაცია
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {tab === "register" && (
          <>
            <div>
              <span className="block text-sm font-medium text-zinc-700 mb-2">
                მომხმარებლის ტიპი
              </span>
              <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                <button
                  type="button"
                  onClick={() => setUserType("physical")}
                  className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                    userType === "physical"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  ფიზიკური პირი
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("business")}
                  className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                    userType === "business"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  ბიზნესი
                </button>
              </div>
            </div>
            {userType === "physical" ? (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700">
                    სახელი
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    required={userType === "physical"}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700">
                    გვარი
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    required={userType === "physical"}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-zinc-700">
                  საბიზნესო სახელი
                </label>
                <input
                  id="businessName"
                  type="text"
                  autoComplete="organization"
                  required={userType === "business"}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
                  placeholder="მაგ. შპს ვაზის მეურნეობა"
                />
              </div>
            )}
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
            ელფოსტა
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            პაროლი
          </label>
          <input
            id="password"
            type="password"
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            required
            minLength={tab === "register" ? 6 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
          />
          {tab === "register" && (
            <p className="mt-1 text-xs text-zinc-500">მინიმუმ 6 სიმბოლო</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "იწვევს..." : tab === "login" ? "შესვლა" : "რეგისტრაცია"}
        </button>
      </form>
    </div>
  );
}
