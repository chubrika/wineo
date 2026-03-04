"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { XIcon } from "lucide-react";

type Tab = "login" | "register";

export function LoginModal() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { isOpen, closeLoginModal } = useLoginModal();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [userType, setUserType] = useState<"physical" | "business">("physical");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      closeLoginModal();
      setIsClosing(false);
      closeTimeoutRef.current = null;
    }, 300);
  };

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
        if (password !== repeatPassword) {
          setError("პაროლები არ ემთხვევა");
          setSubmitting(false);
          return;
        }
        if (userType === "physical") {
          await register(email.trim(), password, "physical", { firstName: firstName.trim(), lastName: lastName.trim() });
        } else {
          await register(email.trim(), password, "business", { businessName: businessName.trim() });
        }
      }
      closeLoginModal();
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
    if (t === "login") setRepeatPassword("");
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={tab === "login" ? "შესვლა" : "რეგისტრაცია"}
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-label="დახურვა"
      />

      {/* Panel: slide from bottom on mobile, from right on desktop */}
      <div
        className={`
          relative z-10 flex h-[85vh] w-full max-h-[90vh] flex-col rounded-t-2xl border-t border-zinc-200 bg-white shadow-xl
          transition-transform duration-300 ease-out
          md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:translate-y-0
          ${isVisible ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
        `}
      >
        <div className="flex h-full w-full flex-col bg-white">
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 md:px-6">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 medium-font">
              {tab === "login" ? "შესვლა" : "რეგისტრაცია"}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="დახურვა"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              <button
                type="button"
                onClick={() => switchTab("login")}
                className={`min-w-0 flex-1 cursor-pointer border-b-2 pb-3 text-sm font-medium transition-colors -mb-px ${
                  tab === "login"
                    ? "border-[var(--nav-link-active)] text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                შესვლა
              </button>
              <button
                type="button"
                onClick={() => switchTab("register")}
                className={`min-w-0 cursor-pointer flex-1 border-b-2 pb-3 text-sm font-medium transition-colors -mb-px ${
                  tab === "register"
                    ? "border-[var(--nav-link-active)] text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                რეგისტრაცია
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                  {error}
                </div>
              )}

              {tab === "register" && (
                <>
                  <div>
                    <span className="mb-2 block text-sm font-medium text-zinc-700">მომხმარებლის ტიპი</span>
                    <div className="flex rounded-xl bg-zinc-100 p-1 gap-0.5">
                      <button
                        type="button"
                        onClick={() => setUserType("physical")}
                        className={`flex-1 cursor-pointer rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                          userType === "physical"
                            ? "bg-white text-[var(--nav-link-active)] shadow-sm ring-1 ring-zinc-200/80"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        ფიზიკური პირი
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("business")}
                        className={`flex-1 cursor-pointer rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                          userType === "business"
                            ? "bg-white text-[var(--nav-link-active)] shadow-sm ring-1 ring-zinc-200/80"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        ბიზნესი
                      </button>
                    </div>
                  </div>
                  {userType === "physical" ? (
                    <>
                      <div>
                        <label htmlFor="modal-firstName" className="block text-sm font-medium text-zinc-700">
                          სახელი
                        </label>
                        <input
                          id="modal-firstName"
                          type="text"
                          autoComplete="given-name"
                          required={userType === "physical"}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-lastName" className="block text-sm font-medium text-zinc-700">
                          გვარი
                        </label>
                        <input
                          id="modal-lastName"
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
                      <label htmlFor="modal-businessName" className="block text-sm font-medium text-zinc-700">
                        საბიზნესო სახელი
                      </label>
                      <input
                        id="modal-businessName"
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
                <label htmlFor="modal-email" className="block text-sm font-medium text-zinc-700">
                  ელფოსტა
                </label>
                <input
                  id="modal-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
                />
              </div>

              <div>
                <label htmlFor="modal-password" className="block text-sm font-medium text-zinc-700">
                  პაროლი
                </label>
                <input
                  id="modal-password"
                  type="password"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  required
                  minLength={tab === "register" ? 6 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
                />
                {tab === "register" && <p className="mt-1 text-xs text-zinc-500">მინიმუმ 6 სიმბოლო</p>}
              </div>

              {tab === "register" && (
                <div>
                  <label htmlFor="modal-repeatPassword" className="block text-sm font-medium text-zinc-700">
                    გაიმეორეთ პაროლი
                  </label>
                  <input
                    id="modal-repeatPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "იწვევს..." : tab === "login" ? "შესვლა" : "რეგისტრაცია"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
