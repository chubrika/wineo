"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { getCategories } from "@/lib/api";
import type { ApiCategory } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import type { CategoryTreeNode } from "@/types/category";
import type { ListingType } from "@/types/listing";
import { listingBasePath } from "@/lib/listing-search";
import { ChevronRightIcon, XIcon } from "lucide-react";

export function CategoryGrid() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [categoriesApi, setCategoriesApi] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryLevelStack, setCategoryLevelStack] = useState<CategoryTreeNode[][]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const categoryDropdownRefModal = useRef<HTMLDivElement>(null);

  const categoryTree = useMemo(() => buildCategoryTree(categoriesApi), [categoriesApi]);
  const roots = categoryTree;

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((list) => {
        if (cancelled) return;
        setCategoriesApi(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load categories");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleCategoryClick(rootNode: CategoryTreeNode) {
    if (rootNode.children.length === 0) {
      router.push(listingBasePath(listingType, rootNode.slug));
      return;
    }
    setModalTitle(rootNode.name);
    setCategoryLevelStack([rootNode.children]);
    setModalOpen(true);
  }

  function handleModalOptionClick(node: CategoryTreeNode) {
    if (node.children.length > 0) {
      setCategoryLevelStack((prev) => [...prev, node.children]);
    } else {
      setModalOpen(false);
      router.push(listingBasePath(listingType, node.slug));
    }
  }

  function handleModalBack() {
    setCategoryLevelStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  const currentOptions = categoryLevelStack.length > 0 ? categoryLevelStack[categoryLevelStack.length - 1] : [];
  const canGoBack = categoryLevelStack.length > 1;

  return (
    <section
      className="border-b border-zinc-200 bg-white py-14 sm:py-18"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="categories-heading" className="text-2xl font-bold tracking-tight wineo-red sm:text-3xl">
          მოძებნეთ კატეგორიით
        </h2>
        <p className="mt-2 text-zinc-600">
          მოძებნეთ აღჭურვილობები და მიწები კატეგორიით.
        </p>

        {/* იყიდე / იქირავე toggle */}
        <div className="mt-6 flex items-center gap-2" role="group" aria-label="Listing type">
          <button
            type="button"
            onClick={() => setListingType("buy")}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
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
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              listingType === "rent"
                ? "bg-[#8a052d] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            იქირავე
          </button>
        </div>

        {loading && (
          <p className="mt-8 text-zinc-500" aria-live="polite">
            კატეგორიები იტვირთება...
          </p>
        )}
        {error && (
          <p className="mt-8 text-red-600" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && roots.length > 0 && (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roots.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(node)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 px-5 py-4 text-left text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-100"
                >
                  <span className="font-medium">{node.name}</span>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && roots.length === 0 && (
          <p className="mt-8 text-zinc-500">კატეგორიები ვერ მოიძებნა.</p>
        )}
      </div>

      {/* Category children modal — cascading */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="category-modal-title"
          onClick={() => setModalOpen(false)}
        >
          <div
            ref={categoryDropdownRefModal}
            className="w-full max-w-md max-h-[85vh] overflow-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
              <h2 id="category-modal-title" className="text-lg font-semibold text-zinc-900">
                {modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="დახურვა"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {canGoBack && (
                <button
                  type="button"
                  onClick={handleModalBack}
                  className="mb-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  უკან
                </button>
              )}
              {currentOptions.length === 0 && !canGoBack && (
                <p className="py-6 text-center text-sm text-zinc-500">ქვეკატეგორიები არ მოიძებნა.</p>
              )}
              <ul className="flex flex-col gap-1">
                {currentOptions.map((node) => (
                  <li key={node.id} className="border-b border-zinc-200 last:border-b-0"  >
                    <button
                      type="button"
                      onClick={() => handleModalOptionClick(node)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        node.children.length > 0
                          ? "font-medium text-zinc-900 hover:bg-zinc-50"
                          : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <span>{node.name}</span>
                      {node.children.length > 0 ? (
                        <ChevronRightIcon className="h-4 w-4 text-zinc-400" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
