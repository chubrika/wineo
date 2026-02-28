"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCategories, getRegions } from "@/lib/api";
import type { ApiCategory } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import type { CategoryTreeNode } from "@/types/category";
import type { ListingType } from "@/types/listing";
import { listingBasePath, buildListingSearchString } from "@/lib/listing-search";
import { useFiltersModal } from "@/contexts/FiltersModalContext";
import { ClockIcon, PlusIcon, SearchIcon, ShoppingBagIcon, XIcon } from "lucide-react";

const HERO_PLACEHOLDER = "/next.svg";

export function HeroSection() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [categoriesApi, setCategoriesApi] = useState<ApiCategory[]>([]);
  const [regions, setRegions] = useState<{ slug: string; label: string }[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categoryLevelStack, setCategoryLevelStack] = useState<CategoryTreeNode[][]>([]);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRefModal = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const { isOpen: filtersModalOpen, closeFiltersModal } = useFiltersModal();

  const categoryTree = useMemo(() => buildCategoryTree(categoriesApi), [categoriesApi]);

  function findCategoryNameBySlug(tree: CategoryTreeNode[], slug: string): string | null {
    for (const node of tree) {
      if (node.slug === slug) return node.name;
      const found = findCategoryNameBySlug(node.children, slug);
      if (found) return found;
    }
    return null;
  }
  const selectedCategoryLabel = category ? findCategoryNameBySlug(categoryTree, category) : null;

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((list) => {
        if (cancelled) return;
        setCategoriesApi(list);
      })
      .catch(() => {
        if (!cancelled) setCategoriesApi([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!categoryDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (categoryDropdownRef.current?.contains(target) || categoryDropdownRefModal.current?.contains(target)) return;
      setCategoryDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryDropdownOpen]);

  const openCategoryDropdown = () => {
    setCategoryLevelStack([categoryTree]);
    setCategoryDropdownOpen(true);
  };

  const closeCategoryDropdown = () => {
    setCategoryDropdownOpen(false);
    setCategoryLevelStack([]);
  };

  const handleCategoryOptionClick = (node: CategoryTreeNode) => {
    if (node.children.length > 0) {
      setCategoryLevelStack((prev) => [...prev, node.children]);
    } else {
      setCategory(node.slug);
      closeCategoryDropdown();
    }
  };

  const handleCategoryBack = () => {
    setCategoryLevelStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const currentCategoryOptions = categoryLevelStack.length > 0 ? categoryLevelStack[categoryLevelStack.length - 1] : [];
  const canCategoryGoBack = categoryLevelStack.length > 1;

  useEffect(() => {
    let cancelled = false;
    getRegions()
      .then((list) => {
        if (cancelled) return;
        setRegions(list.map((r) => ({ slug: r.slug, label: r.label })));
      })
      .catch(() => {
        if (!cancelled) setRegions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const searchHref = listingBasePath(listingType, category || undefined);
  const queryString = buildListingSearchString({
    region: region || undefined,
  });
  const fullHref = `${searchHref}${queryString}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    closeFiltersModal();
    router.push(fullHref);
  }

  return (
    <section
      className="relative z-10 min-h-[520px] bg-zinc-100 text-zinc-900 md:min-h-[580px] border-b border-zinc-200"
      aria-label="Hero"
    >
      {/* Slider: single slide placeholder */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${HERO_PLACEHOLDER})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-zinc-50/95 to-zinc-100" />
      </div>

      <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8 md:min-h-[580px]">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
            განცხადებების ძებნა და დამატება
          </h1>
          <p className="mt-4 text-md text-zinc-600 sm:text-xl">
          იყიდეთ ან იქირავეთ ბოთლები, კასრები, დანადგარები და ვენახის მიწები. დაუკავშირდით მყიდველებსა და დამქირავებლებს საქართველოს რეგიონებში.          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/add-product"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-[14px] md:text-[20px] font-semibold normal-font text-[#8a052d] transition  hover:text-white hover:bg-[#8a052d]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 mr-2" />
             განცხადების დამატება
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div ref={searchSectionRef} className="mt-10">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg sm:flex-row sm:flex-wrap sm:items-end sm:gap-4"
            role="search"
          >
            <div className="flex items-center gap-2" role="group" aria-label="Listing type">
              <button
                type="button"
                onClick={() => setListingType("buy")}
                className={`rounded-lg cursor-pointer px-3 py-2.5 text-sm font-medium transition flex items-center justify-center ${
                  listingType === "buy"
                    ? "bg-[#8a052d] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <ShoppingBagIcon className="h-4 w-4 shrink-0 mr-2" />
                იყიდე
              </button>
              <button
                type="button"
                onClick={() => setListingType("rent")}
                className={`rounded-lg cursor-pointer px-3 py-2.5 text-sm font-medium transition flex items-center justify-center ${
                  listingType === "rent"
                    ? "bg-[#8a052d] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <ClockIcon className="h-4 w-4 shrink-0 mr-2" />
                იქირავე
              </button>
            </div>
            
            <label className="w-full sm:w-auto min-w-[160px]">
              <span className="sr-only">კატეგორია</span>
              <div ref={categoryDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={openCategoryDropdown}
                  aria-haspopup="listbox"
                  aria-expanded={categoryDropdownOpen}
                  aria-label="კატეგორია"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-left sm:w-[180px] flex items-center justify-between"
                >
                  <span className={selectedCategoryLabel ? "text-zinc-900" : "text-zinc-500"}>
                    {selectedCategoryLabel ?? "კატეგორიები"}
                  </span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {categoryDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-64 w-full min-w-[180px] overflow-auto rounded-lg border border-zinc-300 bg-white py-1 shadow-lg"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {canCategoryGoBack && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCategoryBack();
                        }}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                        უკან
                      </button>
                    )}
                    {!canCategoryGoBack && (
                      <button
                        type="button"
                        role="option"
                        aria-selected={!category}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCategory("");
                          closeCategoryDropdown();
                        }}
                        className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                      >
                        ყველა კატეგორია
                      </button>
                    )}
                    {currentCategoryOptions.length === 0 && !canCategoryGoBack && (
                      <div className="px-3 py-4 text-center text-sm text-zinc-500">კატეგორია არ მოიძებნა</div>
                    )}
                    {currentCategoryOptions.map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        role="option"
                        aria-selected={node.slug === category}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCategoryOptionClick(node);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                          node.children.length > 0
                            ? "font-medium text-zinc-900 hover:bg-zinc-50"
                            : "text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        <span>{node.name}</span>
                        {node.children.length > 0 && (
                          <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" name="category" value={category} readOnly aria-hidden />
              </div>
            </label>
            <label className="w-full sm:w-auto min-w-[140px]">
              <span className="sr-only">რეგიონი</span>
              <select
                name="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-500 sm:w-[130px]"
                aria-label="Region"
              >
                <option value="">ყველა</option>
                {regions.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-lg cursor-pointer bg-[#8a052d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d0423] flex items-center justify-center"
            >
              <SearchIcon className="h-4 w-4 shrink-0 mr-2" />
              ძებნა
            </button>
          </form>
        </div>
      </div>

      {/* Filters modal */}
      {filtersModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center sm:p-0"
          aria-modal="true"
          role="dialog"
          aria-labelledby="filters-modal-title"
          onClick={closeFiltersModal}
        >
          <div
            className="w-full max-w-lg max-h-[calc(100vh-5rem)] overflow-auto rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
              <h2 id="filters-modal-title" className="text-lg font-semibold text-zinc-900">
                ფილტრები
              </h2>
              <button
                type="button"
                onClick={closeFiltersModal}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="დახურვა"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 pb-24 lg:pb-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" role="search">
                <div className="flex items-center gap-2" role="group" aria-label="Listing type">
                  <button
                    type="button"
                    onClick={() => setListingType("buy")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${listingType === "buy" ? "bg-[#8a052d] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                  >
                    <ShoppingBagIcon className="h-4 w-4 shrink-0" />
                    იყიდე
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType("rent")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${listingType === "rent" ? "bg-[#8a052d] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                  >
                    <ClockIcon className="h-4 w-4 shrink-0" />
                    იქირავე
                  </button>
                </div>
                <div ref={categoryDropdownRefModal} className="relative">
                  <label className="mb-1 block text-sm font-medium text-zinc-700">კატეგორია</label>
                  <button
                    type="button"
                    onClick={openCategoryDropdown}
                    aria-haspopup="listbox"
                    aria-expanded={categoryDropdownOpen}
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-left"
                  >
                    <span className={selectedCategoryLabel ? "text-zinc-900" : "text-zinc-500"}>
                      {selectedCategoryLabel ?? "ყველა კატეგორია"}
                    </span>
                    <svg className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {categoryDropdownOpen && (
                    <div role="listbox" className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-300 bg-white py-1 shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
                      {canCategoryGoBack && (
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCategoryBack(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                          უკან
                        </button>
                      )}
                      {!canCategoryGoBack && (
                        <button type="button" role="option" aria-selected={!category} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCategory(""); closeCategoryDropdown(); }} className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100">
                          ყველა კატეგორია
                        </button>
                      )}
                      {currentCategoryOptions.length === 0 && !canCategoryGoBack && <div className="px-3 py-4 text-center text-sm text-zinc-500">კატეგორია არ მოიძებნა</div>}
                      {currentCategoryOptions.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          role="option"
                          aria-selected={node.slug === category}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCategoryOptionClick(node); }}
                          className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm ${node.children.length > 0 ? "font-medium text-zinc-900 hover:bg-zinc-50" : "text-zinc-700 hover:bg-zinc-100"}`}
                        >
                          <span>{node.name}</span>
                          {node.children.length > 0 && <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>}
                        </button>
                      ))}
                    </div>
                  )}
                  <input type="hidden" name="category" value={category} readOnly aria-hidden />
                </div>
                <div>
                  <label htmlFor="modal-region" className="mb-1 block text-sm font-medium text-zinc-700">რეგიონი</label>
                  <select id="modal-region" name="region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-700">
                    <option value="">ყველა</option>
                    {regions.map((r) => <option key={r.slug} value={r.slug}>{r.label}</option>)}
                  </select>
                </div>
                <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-[#8a052d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d0423]">
                  <SearchIcon className="h-4 w-4 shrink-0" />
                  ძებნა
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
