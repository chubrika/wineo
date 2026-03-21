"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { getCategories } from "@/lib/api";
import type { ApiCategory } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import type { CategoryTreeNode } from "@/types/category";
import type { ListingType } from "@/types/listing";
import { listingBasePath } from "@/lib/listing-search";
import { ChevronDownIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { ChevronUpIcon } from "lucide-react";

export function CategoryGrid() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [categoriesApi, setCategoriesApi] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryLevelStack, setCategoryLevelStack] = useState<CategoryTreeNode[][]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches
  );
  const categoryDropdownRefModal = useRef<HTMLDivElement>(null);

  const INITIAL_CATEGORIES_COUNT = 6;

  const categoryTree = useMemo(() => buildCategoryTree(categoriesApi), [categoriesApi]);
  const roots = categoryTree;
  const visibleRoots = isMobile || showAllCategories ? roots : roots.slice(0, INITIAL_CATEGORIES_COUNT);
  const hasMoreCategories = !isMobile && roots.length > INITIAL_CATEGORIES_COUNT;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

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
      className="border-b border-zinc-200 bg-[#f5f6f8] py-8 md:py-14"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="categories-heading" className="text-md md:text-2xl nav-font-caps font-bold tracking-tight wineo-red sm:text-3xl">
              მოძებნეთ კატეგორიით
          </h2>
            <p className="mt-2 text-xs md:text-sm text-zinc-600">
              მოძებნეთ აღჭურვილობები და მიწები კატეგორიით.
            </p>
        </div>
        {hasMoreCategories && (
              <div className="flex justify-center hidden md:block">
                <button
                  type="button"
                  onClick={() => setShowAllCategories((prev) => !prev)}
                  className="flex items-center cursor-pointer justify-center wineo-red gap-2 px-5 py-2.5 text-sm font-medium text-zinc-700 transition"
                >
                  {showAllCategories ? "აკეცვა" : "ყველას ჩვენება"}
                  {showAllCategories ? <ChevronUpIcon className="h-5 w-5 shrink-0 wineo-red" aria-hidden /> : <ChevronDownIcon className="h-5 w-5 shrink-0 wineo-red" aria-hidden />}
                </button>
              </div>
            )}
      </div>

     

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
          <>
            <ul className="mt-8 flex gap-2 md:gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
              {visibleRoots.map((node) => (
                <li key={node.id} className=" shrink-0 sm:min-w-0 sm:shrink">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(node)}
                    className="group relative flex w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-full border border-zinc-200/90 bg-white px-4 py-2.5 text-left text-zinc-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8a052d]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a052d]/40 focus-visible:ring-offset-2 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4 sm:shadow-[0_2px_10px_rgba(24,24,27,0.04)] sm:hover:shadow-[0_10px_24px_rgba(138,5,45,0.12)]"
                    aria-label={`${node.name} კატეგორია`}
                  >
                    <span className="relative text-sm font-normal md:font-semibold tracking-tight text-zinc-700 sm:pl-2 sm:text-base">{node.name}</span>
                    <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-[#8a052d]/10 group-hover:text-[#8a052d] sm:inline-flex">
                      <ChevronRightIcon className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
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
