"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]";
const labelClass = "block text-sm font-medium text-zinc-700";

export function ProfileContent() {
  const { user, loading, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setBusinessName(user.businessName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const isBusiness = user?.userType === "business";
    if (isBusiness) {
      if (!businessName.trim()) {
        setError("საბიზნესო სახელი სავალდებულოა");
        return;
      }
    } else {
      if (!firstName.trim()) {
        setError("სახელი სავალდებულოა");
        return;
      }
      if (!lastName.trim()) {
        setError("გვარი სავალდებულოა");
        return;
      }
    }
    setSubmitting(true);
    try {
      if (isBusiness) {
        await updateProfile({
          businessName: businessName.trim(),
          phone: phone.trim(),
        });
      } else {
        await updateProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        });
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="mt-4 text-zinc-500">იტვირთება...</p>
    );
  }

  if (!user) {
    return (
      <p className="mt-4 text-zinc-600">
        პროფილის სანახავად გაიარეთ ავტორიზაცია.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-5">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          ცვლილებები შენახულია.
        </div>
      )}

      <div>
        <label className={labelClass}>მომხმარებლის ტიპი</label>
        <p className="mt-1 text-zinc-600">
          {user.userType === "business" ? "ბიზნესი" : "ფიზიკური პირი"}
        </p>
      </div>

      {user.userType === "business" ? (
        <div>
          <label htmlFor="profile-businessName" className={labelClass}>
            საბიზნესო სახელი
          </label>
          <input
            id="profile-businessName"
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={inputClass}
            placeholder="მაგ. შპს ვაზის მეურნეობა"
          />
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="profile-firstName" className={labelClass}>
              სახელი
            </label>
            <input
              id="profile-firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              placeholder="სახელი"
            />
          </div>
          <div>
            <label htmlFor="profile-lastName" className={labelClass}>
              გვარი
            </label>
            <input
              id="profile-lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              placeholder="გვარი"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="profile-email" className={labelClass}>
          ელფოსტა
        </label>
        <input
          id="profile-email"
          type="email"
          value={user.email ?? ""}
          disabled
          className={`${inputClass} cursor-not-allowed bg-zinc-50 text-zinc-600`}
          aria-describedby="profile-email-note"
        />
        <p id="profile-email-note" className="mt-1 text-xs text-zinc-500">
          ელფოსტის შეცვლა მოგვიანებით იქნება შესაძლებელი.
        </p>
      </div>
      <div>
        <label htmlFor="profile-phone" className={labelClass}>
          საკონტაქტო ნომერი
        </label>
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="მაგ. +995 555 123 456"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "შენახვა…" : "ცვლილებების შენახვა"}
        </button>
      </div>
    </form>
  );
}
