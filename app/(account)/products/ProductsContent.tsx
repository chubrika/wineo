"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProducts, deleteProduct, type ApiProduct } from "@/lib/api";

function listingHref(p: ApiProduct): string {
  const base = p.type === "sell" ? "/buy" : "/rent";
  return `${base}/listing/${p.slug}`;
}

function formatPrice(p: ApiProduct): string {
  const sym = p.currency === "GEL" ? "₾" : "$";
  const value = p.price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p.type === "rent" && p.rentPeriod) {
    const unit =
      p.rentPeriod === "day"
        ? "დღე"
        : p.rentPeriod === "week"
          ? "კვირა"
          : p.rentPeriod === "month"
            ? "თვე"
            : p.rentPeriod === "hour"
              ? "საათი"
              : p.rentPeriod;
    return `${sym}${value}/${unit}`;
  }
  return `${sym}${value}`;
}

function statusLabel(s?: string): string {
  if (!s) return "—";
  const map: Record<string, string> = {
    active: "აქტიური",
    sold: "გაყიდული",
    rented: "ქირაობაში",
    expired: "ვადაგასული",
  };
  return map[s] ?? s;
}

const EditIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function ProductsContent() {
  const { user, token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyProducts(token)
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "შეცდომა");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const handleDelete = async (p: ApiProduct) => {
    if (!token) return;
    const ok = typeof window !== "undefined" && window.confirm(`გნებავთ წაშალოთ „${p.title}"?`);
    if (!ok) return;
    setDeletingId(p.id);
    try {
      await deleteProduct(token, p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "წაშლა ვერ მოხერხდა");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
          განცხადებები
        </h1>
        <p className="mt-4 text-zinc-500">იტვირთება…</p>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
          განცხადებები
        </h1>
        <p className="mt-4 text-zinc-600">
          განცხადებების სანახავად გაიარეთ{" "}
          <a href="/login" className="text-[var(--nav-link-active)] underline">
            შესვლა
          </a>
          .
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
          განცხადებები
        </h1>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
          განცხადებები
        </h1>
        <Link
          href="/add-product"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          ახალი განცხადება
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-zinc-600">
          ჯერ არ გაქვთ განცხადებები.{" "}
          <Link href="/add-product" className="text-[var(--nav-link-active)] underline">
            დაამატეთ პირველი
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="py-3 pr-4 font-medium text-zinc-900">
                  სათაური
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-medium text-zinc-900 sm:table-cell">
                  ტიპი
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-medium text-zinc-900 md:table-cell">
                  კატეგორია
                </th>
                <th scope="col" className="py-3 pr-4 font-medium text-zinc-900">
                  ფასი
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-medium text-zinc-900 md:table-cell">
                  მდებარეობა
                </th>
                <th scope="col" className="py-3 pr-4 font-medium text-zinc-900">
                  სტატუსი
                </th>
                <th scope="col" className="relative py-3 pl-4 text-right font-medium text-zinc-900">
                  <span className="sr-only">მოქმედებები</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="py-3 pr-4">
                    <Link
                      href={listingHref(p)}
                      className="font-medium text-zinc-900 hover:text-[var(--nav-link-active)]"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="hidden py-3 pr-4 text-zinc-600 sm:table-cell">
                    {p.type === "sell" ? "იყიდება" : "ქირავდება"}
                  </td>
                  <td className="hidden py-3 pr-4 text-zinc-600 md:table-cell">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-zinc-900">
                    {formatPrice(p)}
                  </td>
                  <td className="hidden py-3 pr-4 text-zinc-600 md:table-cell">
                    {p.location
                      ? `${p.location.region}, ${p.location.city}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "active"
                          ? "bg-green-100 text-green-800"
                          : p.status === "sold" || p.status === "rented"
                            ? "bg-zinc-100 text-zinc-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="relative py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                        title="რედაქტირება"
                        aria-label="რედაქტირება"
                      >
                        <EditIcon />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="წაშლა"
                        aria-label="წაშლა"
                      >
                        <DeleteIcon />
                      </button>
                      <Link
                        href={listingHref(p)}
                        className="text-[var(--nav-link-active)] hover:underline text-sm"
                      >
                        ნახვა
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
