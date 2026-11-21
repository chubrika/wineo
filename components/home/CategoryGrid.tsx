"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import type { ApiCategory } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import type { CategoryTreeNode } from "@/types/category";
import type { ListingType } from "@/types/listing";
import { listingBasePath } from "@/lib/listing-search";
import { ChevronDownIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { ChevronUpIcon } from "lucide-react";

const PILL_CLASS =
  "group relative flex w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-full border border-zinc-200/90 bg-white px-4 py-2.5 text-left text-zinc-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8a052d]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a052d]/40 focus-visible:ring-offset-2 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4 sm:shadow-[0_2px_10px_rgba(24,24,27,0.04)] sm:hover:shadow-[0_10px_24px_rgba(138,5,45,0.12)]";

function collectLinks(
  nodes: CategoryTreeNode[],
  categories: ApiCategory[],
  type: ListingType,
): { id: string; name: string; href: string }[] {
  const links: { id: string; name: string; href: string }[] = [];
  for (const node of nodes) {
    const category = categories.find((item) => item.slug === node.slug);
    const allowed =
      category?.active !== false &&
      (Array.isArray(category?.types) ? category.types.includes(type) : true);
    if (allowed) {
      links.push({
        id: `${type}-${node.id}`,
        name: node.name,
        href: listingBasePath(type, node.slug),
      });
    }
    if (node.children.length > 0) {
      links.push(...collectLinks(node.children, categories, type));
    }
  }
  return links;
}

export function CategoryGrid({ categories }: { categories: ApiCategory[] }) {
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryLevelStack, setCategoryLevelStack] = useState<CategoryTreeNode[][]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const categoryDropdownRefModal = useRef<HTMLDivElement>(null);

  const INITIAL_CATEGORIES_COUNT = 6;

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const roots = useMemo(() => {
    return categoryTree.filter((node) => {
      const cat = categories.find((item) => item.slug === node.slug);
      if (!cat?.active) return false;
      return Array.isArray(cat.types) ? cat.types.includes(listingType) : true;
    });
  }, [categoryTree, categories, listingType]);
  const crawlLinks = useMemo(
    () => [...collectLinks(categoryTree, categories, "buy"), ...collectLinks(categoryTree, categories, "rent")],
    [categoryTree, categories],
  );

  const visibleRoots = isMobile || showAllCategories ? roots : roots.slice(0, INITIAL_CATEGORIES_COUNT);
  const hasMoreCategories = !isMobile && roots.length > INITIAL_CATEGORIES_COUNT;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  function openChildren(node: CategoryTreeNode) {
    setModalTitle(node.name);
    setCategoryLevelStack([node.children]);
    setModalOpen(true);
  }

  function handleModalOptionClick(node: CategoryTreeNode) {
    if (node.children.length > 0) {
      setCategoryLevelStack((prev) => [...prev, node.children]);
    }
  }

  function handleModalBack() {
    setCategoryLevelStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  const currentOptions = categoryLevelStack.length > 0 ? categoryLevelStack[categoryLevelStack.length - 1] : [];
  const canGoBack = categoryLevelStack.length > 1;

  return (
    <section
      className="border-b border-zinc-200  py-8 md:py-14 px-4 md:px-0"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-7xl">
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

        {roots.length > 0 && (
          <>
            <ul className="mt-8 flex gap-2 md:gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
              {visibleRoots.map((node) => {
                const href = listingBasePath(listingType, node.slug);
                const inner = (
                  <>
                    <span className="relative text-sm font-normal md:font-semibold tracking-tight text-zinc-700 sm:pl-2 sm:text-base">{node.name}</span>
                    <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-[#8a052d]/10 group-hover:text-[#8a052d] sm:inline-flex">
                      <ChevronRightIcon className="h-4 w-4" aria-hidden />
                    </span>
                  </>
                );
                return (
                  <li key={node.id} className=" shrink-0 sm:min-w-0 sm:shrink">
                    {node.children.length === 0 ? (
                      <Link href={href} className={PILL_CLASS} aria-label={`${node.name} კატეგორია`}>
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openChildren(node)}
                        className={PILL_CLASS}
                        aria-label={`${node.name} კატეგორია`}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <nav className="sr-only" aria-label="კატეგორიები">
              <ul>
                {crawlLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
        {roots.length === 0 && (
          <p className="mt-8 text-zinc-500">კატეგორიები ვერ მოიძებნა.</p>
        )}
      </div>

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
                  <li key={node.id} className="border-b border-zinc-200 last:border-b-0">
                    {node.children.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleModalOptionClick(node)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
                      >
                        <span>{node.name}</span>
                        <ChevronRightIcon className="h-4 w-4 text-zinc-400" aria-hidden />
                      </button>
                    ) : (
                      <Link
                        href={listingBasePath(listingType, node.slug)}
                        onClick={() => setModalOpen(false)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                      >
                        <span>{node.name}</span>
                      </Link>
                    )}
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
