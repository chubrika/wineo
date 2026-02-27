"use client";

import { useAuth } from "@/contexts/AuthContext";

function getUserDisplayName(
  firstName: string,
  lastName: string,
  email: string
) {
  if (firstName && lastName) return `${firstName} ${lastName}`.trim();
  return email || "";
}

export function ProfileContent() {
  const { user, loading } = useAuth();

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
    <dl className="mt-6 grid gap-4 sm:grid-cols-1">
      <div>
        <dt className="text-sm font-medium text-zinc-500">სახელი და გვარი</dt>
        <dd className="mt-1 text-zinc-900">
          {getUserDisplayName(user.firstName, user.lastName, user.email)}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-zinc-500">ელფოსტა</dt>
        <dd className="mt-1 text-zinc-900">{user.email}</dd>
      </div>
    </dl>
  );
}
