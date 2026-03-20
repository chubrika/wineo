"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCategories } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import type { CategoryTreeNode } from "@/types/category";
import { listingBasePath } from "@/lib/listing-search";
import type { ListingType } from "@/types/listing";
import { XIcon, ChevronRightIcon } from "lucide-react";

type CategoriesModalProps = {
  open: boolean;
  onClose: () => void;
  /** Optional slug to pre-select a root category when the modal opens. */
  initialRootSlug?: string | null;
};

export function CategoriesModal({ open, onClose, initialRootSlug }: CategoriesModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [categoriesApi, setCategoriesApi] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoot, setSelectedRoot] = useState<CategoryTreeNode | null>(null);
  const [listingType, setListingType] = useState<ListingType>("buy");

  const roots = useMemo(() => buildCategoryTree(categoriesApi), [categoriesApi]);
  const children = selectedRoot?.children ?? [];

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });
    getCategories()
      .then((list) => {
        if (!cancelled) setCategoriesApi(list.filter((c) => c.active));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setListingType(pathname.startsWith("/rent") ? "rent" : "buy");

    // When opening without a pre-selection, reset immediately.
    if (!initialRootSlug) setSelectedRoot(null);
  }, [open, pathname, initialRootSlug]);

  useEffect(() => {
    if (!open) return;
    if (!initialRootSlug) return;

    const normalized = initialRootSlug.trim().toLowerCase();
    const found = roots.find((n) => n.slug.toLowerCase() === normalized) ?? null;
    setSelectedRoot(found);
  }, [open, initialRootSlug, roots]);

  function handleRootClick(node: CategoryTreeNode) {
    if (node.children.length > 0) {
      setSelectedRoot(node);
      return;
    }
    onClose();
    router.push(listingBasePath(listingType, node.slug));
  }

  function handleChildClick(node: CategoryTreeNode) {
    onClose();
    router.push(listingBasePath(listingType, node.slug));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="categories-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:h-auto sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-zinc-200 bg-white px-4 pb-3 pt-2 sm:py-3">
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-zinc-200 sm:hidden" aria-hidden />
          <div className="flex items-center justify-between gap-3">
            <h2 id="categories-modal-title" className="text-base font-semibold text-zinc-900 sm:text-lg">
              კატეგორიები
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="დახურვა"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2" role="group" aria-label="Listing type">
            <button
              type="button"
              onClick={() => setListingType("buy")}
              className={`rounded-lg cursor-pointer px-3 py-1.5 text-sm font-medium transition ${
                listingType === "buy"
                  ? "bg-[#8a052d] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              იყიდე
            </button>
            <button
              type="button"
              onClick={() => setListingType("rent")}
              className={`rounded-lg cursor-pointer px-3 py-1.5 text-sm font-medium transition ${
                listingType === "rent"
                  ? "bg-[#8a052d] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              იქირავე
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          {/* Left: root categories */}
          <div className="w-full shrink-0 border-b border-zinc-200 bg-zinc-50/80 max-sm:max-h-[40dvh] max-sm:overflow-auto sm:w-56 sm:border-b-0 sm:border-r sm:border-zinc-200">
            {loading ? (
              <p className="p-4 text-sm text-zinc-500">იტვირთება...</p>
            ) : roots.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500">კატეგორიები ვერ მოიძებნა.</p>
            ) : (
              <ul className="flex flex-col py-2">
                {roots.map((node) => (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => handleRootClick(node)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition ${
                        selectedRoot?.id === node.id
                          ? "bg-white text-[var(--wineo-red)] font-medium shadow-sm"
                          : "text-zinc-700 hover:bg-white/80 hover:text-zinc-900"
                      }`}
                    >
                      <span className="truncate">{node.name}</span>
                      {node.children.length > 0 && (
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: children of selected root */}
          <div className="flex-1 overflow-auto bg-white p-3 sm:p-4">
            {!selectedRoot ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                დააკლიკეთ კატეგორიაზე ქვეკატეგორიების სანახავად
              </p>
            ) : children.length === 0 ? (
              <div className="py-8">
                <p className="text-center text-sm text-zinc-500">ქვეკატეგორიები არ არის.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link
                    href={listingBasePath(listingType, selectedRoot.slug)}
                    onClick={onClose}
                    className="rounded-lg bg-[var(--wineo-red)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    {listingType === "buy" ? "იყიდე" : "იქირავე"} — {selectedRoot.name}
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {selectedRoot.name}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {children.map((node) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => handleChildClick(node)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-[var(--wineo-red)]"
                      >
                        <span>{node.name}</span>
                        {node.children.length > 0 ? (
                          <span className="text-xs text-zinc-400">(ქვეკატეგორიებით)</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
