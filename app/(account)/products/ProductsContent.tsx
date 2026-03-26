"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, CirclePlus, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { getMyProducts, deleteProduct, type ApiProduct } from "@/lib/api";

function listingHref(p: ApiProduct): string {
  const base = p.type === "sell" ? "/buy" : "/rent";
  return `${base}/listing/${p.slug}`;
}

function productImageUrl(p: ApiProduct): string {
  const firstImage = Array.isArray(p.images) ? p.images[0] : undefined;
  return p.thumbnail || firstImage || "/wine.png";
}

function formatPriceValue(p: ApiProduct, amount: number): string {
  const sym = p.currency === "GEL" ? "₾" : "$";
  const value = amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
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

function hasValidDiscount(p: ApiProduct): boolean {
  return typeof p.discountedPrice === "number" && p.discountedPrice >= 0 && p.discountedPrice < p.price;
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

function promotionTypeLabel(type?: string): string {
  if (!type || type === "none") return "—";
  const map: Record<string, string> = {
    highlighted: "გამოკვეთილი",
    featured: "რეკომენდირებული",
    homepageTop: "",
  };
  return map[type] ?? type;
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

/** Status icons for product table */
function StatusIcon({ status }: { status?: string }) {
  const className = "h-4 w-4 shrink-0";
  if (status === "active") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (status === "sold" || status === "rented") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (status === "expired") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return null;
}

/** Promotion type icons for product table */
function PromotionIcon({ type }: { type?: string }) {
  const className = "h-4 w-4 shrink-0";
  if (!type || type === "none") return null;
  if (type === "highlighted") {
    return <Sparkles className={className} aria-hidden />;
  }
  if (type === "featured") {
    return <Star className={className} aria-hidden />;
  }
  if (type === "homepageTop") {
    return 'VIP';
  }
  return null;
}

export function ProductsContent() {
  const { user, token, loading: authLoading } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
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
        <h1 className="text-md md:text-lg nav-font-caps font-bold tracking-tight wineo-red">
          განცხადებები
        </h1>
        <p className="mt-4 text-zinc-500">იტვირთება…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-md md:text-lg nav-font-caps font-bold tracking-tight wineo-red">
          განცხადებები
        </h1>
        <p className="mt-4 text-zinc-600">
          განცხადებების სანახავად გაიარეთ{" "}
          <button type="button" onClick={openLoginModal} className="text-[var(--nav-link-active)] underline">
            შესვლა
          </button>
          .
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight wineo-red medium-font">
          განცხადებები
        </h1>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-md md:text-lg nav-font-caps font-bold tracking-tight wineo-red">
         ჩემი განცხადებები
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { type: "highlighted" as const, label: promotionTypeLabel("highlighted"), className: "bg-yellow-100 text-yellow-800" },
            { type: "featured" as const, label: promotionTypeLabel("featured"), className: "bg-amber-100 text-amber-800" },
            { type: "homepageTop" as const, label: promotionTypeLabel("homepageTop"), className: "bg-purple-50 text-purple-700" },
          ].map(({ type, label, className }) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
            >
              <PromotionIcon type={type} />
              {label}
            </span>
          ))}
        </div>
        <Link
          href="/add-product"
          className="flex items-center max-w-[190px] cursor-pointer gap-2 rounded-lg border border-zinc-300 bg-[#8a052d2e] px-3 py-2 text-sm font-medium transition-colors hover:bg-[#8a052d5c] text-[var(--wineo-red)] focus:outline-none"
        >
          <CirclePlus className="h-5 w-5 shrink-0" />
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
        <>
        <div className="mt-6 space-y-3 md:hidden">
          {products.map((p) => {
            const isExpanded = expandedProductId === p.id;
            return (
              <div key={p.id} className="rounded-lg border border-zinc-200 bg-white">
                <div className="flex items-start gap-2 p-3">
                  <Link
                    href={listingHref(p)}
                    className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
                    aria-label={`${p.title} ფოტო`}
                  >
                    <Image
                      src={productImageUrl(p)}
                      alt={p.title}
                      fill
                      sizes="48px"
                      unoptimized
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={listingHref(p)}
                      className="line-clamp-2 text-sm font-medium text-zinc-900 hover:text-[var(--nav-link-active)]"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-1 text-sm text-zinc-900">
                      {hasValidDiscount(p) ? (
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs text-zinc-500 line-through">
                            {formatPriceValue(p, p.price)}
                          </span>
                          <span className="font-medium text-[var(--nav-link-active)]">
                            {formatPriceValue(p, p.discountedPrice as number)}
                          </span>
                        </div>
                      ) : (
                        formatPriceValue(p, p.price)
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
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
                    <button
                      type="button"
                      onClick={() => setExpandedProductId((prev) => (prev === p.id ? null : p.id))}
                      className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      aria-label={isExpanded ? "დეტალების დამალვა" : "დეტალების ჩვენება"}
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="grid grid-cols-2 gap-2 border-t border-zinc-200 px-3 py-2 text-xs">
                    <div>
                      <span className="text-zinc-500">ტიპი: </span>
                      <span className="text-zinc-800">{p.type === "sell" ? "იყიდება" : "ქირავდება"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">კატეგორია: </span>
                      <span className="text-zinc-800">{p.category?.name ?? "—"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">მდებარეობა: </span>
                      <span className="text-zinc-800">{p.location ? `${p.location.city}` : "—"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">სტატუსი: </span>
                      <span className="text-zinc-800">{statusLabel(p.status)}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-zinc-500">პრომოუშენი:</span>
                      {p.promotionType && p.promotionType !== "none" ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.promotionType === "highlighted"
                              ? "bg-yellow-100 text-yellow-800"
                              : p.promotionType === "featured"
                                ? "bg-amber-100 text-amber-800"
                                : p.promotionType === "homepageTop"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          <PromotionIcon type={p.promotionType} />
                        </span>
                      ) : (
                        <span className="text-zinc-800">—</span>
                      )}
                    </div>
                    <div className="col-span-2 pt-1">
                      <Link href={listingHref(p)} className="text-sm text-[var(--nav-link-active)] hover:underline">
                        ნახვა
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="py-3 pr-4 font-medium text-zinc-900">
                  სათაური
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-medium text-zinc-900 sm:table-cell">
                  ტიპი
                </th>
                <th scope="col" className="py-3 pr-4 font-medium text-zinc-900">
                  ფასი
                </th>
                <th scope="col" className="py-3 pr-4 font-medium text-zinc-900">
                  სტატუსი
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-medium text-zinc-900 md:table-cell">
                  პრომოუშენი
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
                      className="flex items-center gap-3 font-medium text-zinc-900 hover:text-[var(--nav-link-active)]"
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                        <Image
                          src={productImageUrl(p)}
                          alt={p.title}
                          fill
                          sizes="44px"
                          className="object-cover"
                          unoptimized
                        />
                      </span>
                      <span className="line-clamp-2">{p.title}</span>
                    </Link>
                  </td>
                  <td className="hidden py-3 pr-4 text-zinc-600 sm:table-cell">
                    {p.type === "sell" ? "იყიდება" : "ქირავდება"}
                  </td>
                  <td className="py-3 pr-4 text-zinc-900">
                    {hasValidDiscount(p) ? (
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs text-zinc-500 line-through">
                          {formatPriceValue(p, p.price)}
                        </span>
                        <span className="font-medium text-[var(--nav-link-active)]">
                          {formatPriceValue(p, p.discountedPrice as number)}
                        </span>
                      </div>
                    ) : (
                      formatPriceValue(p, p.price)
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "active"
                          ? "bg-green-100 text-green-800"
                          : p.status === "sold" || p.status === "rented"
                            ? "bg-zinc-100 text-zinc-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <StatusIcon status={p.status} />
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-zinc-900">
                    {p.promotionType && p.promotionType !== "none" ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.promotionType === "highlighted"
                            ? "bg-yellow-100 text-yellow-800"
                            : p.promotionType === "featured"
                              ? "bg-amber-100 text-amber-800"
                              : p.promotionType === "homepageTop"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        <PromotionIcon type={p.promotionType} />
                        {/* {promotionTypeLabel(p.promotionType)} */}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
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
        </>
      )}
    </div>
  );
}
