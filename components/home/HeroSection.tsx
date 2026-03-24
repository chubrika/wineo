"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCategories, getRegions } from "@/lib/api";
import type { ApiCategory } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import type { CategoryTreeNode } from "@/types/category";
import type { ListingType } from "@/types/listing";
import { listingBasePath, buildListingSearchString } from "@/lib/listing-search";
import { useFiltersModal } from "@/contexts/FiltersModalContext";
import { ChevronDownIcon, ChevronUpIcon, ClockIcon, FilterIcon, SearchIcon, ShoppingBagIcon, XIcon } from "lucide-react";
import { HeroSlider } from "@/components/hero/HeroSlider";

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
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const regionDropdownRefModal = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const { isOpen: filtersModalOpen, openFiltersModal, closeFiltersModal } = useFiltersModal();

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
  const selectedRegionLabel = region ? regions.find((r) => r.slug === region)?.label ?? null : null;

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

  useEffect(() => {
    if (!regionDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (regionDropdownRef.current?.contains(target) || regionDropdownRefModal.current?.contains(target)) return;
      setRegionDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [regionDropdownOpen]);

  const openCategoryDropdown = () => {
    setCategoryLevelStack([categoryTree]);
    setCategoryDropdownOpen((prev) => !prev);
  };

  const closeCategoryDropdown = () => {
    setCategoryDropdownOpen(false);
    setCategoryLevelStack([]);
  };

  const openRegionDropdown = () => {
    setRegionDropdownOpen((prev) => !prev);
  };

  const closeRegionDropdown = () => {
    setRegionDropdownOpen(false);
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
      className="bg-white pt-0 md:pt-5"
      aria-label="Hero"
    >
     <div className="relative overflow-visible rounded-none md:rounded-md z-11 min-h-[350px] mx-auto max-w-7xl bg-zinc-100 text-zinc-900 md:min-h-[300px] border-b border-zinc-200">
       {/* Hero slider: full-bleed background + slides (title, subtitle, CTA per slide) */}
       <div className="absolute inset-0 overflow-hidden rounded-none md:rounded-md">
        <HeroSlider />
      </div>

      {/* Search bar overlaid at bottom */}
      <div ref={searchSectionRef} className="absolute bottom-0 md:bottom-[-60px] left-0 right-0 z-11 px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto p-4 max-w-[850px] rounded-md bg-white/80 md:bg-white shadow-lg">
          <button
            type="button"
            onClick={openFiltersModal}
            className="md:hidden min-h-[40px] w-full rounded-md cursor-pointer wineo-green-bg px-5 py-2.5 text-sm font-normal text-white transition hover:bg-[#6d0423] flex items-center justify-center"
          >
            <FilterIcon className="h-4 w-4 shrink-0 mr-2" />
            დეტალური ძებნა
          </button>
        <form
            onSubmit={handleSubmit}
            className="hidden md:flex flex-col gap-3 h-full justify-between sm:flex-row sm:flex-wrap sm:items-end sm:gap-4"
            role="search"
          >
            <div className="flex items-center justify-between md:justify-start gap-2" role="group" aria-label="Listing type">
              <button
                type="button"
                onClick={() => setListingType("buy")}
                className={`min-h-[40px] min-w-[120px] rounded-md cursor-pointer px-3 py-2.5 text-sm font-medium transition flex items-center justify-center ${
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
                className={`min-h-[40px] min-w-[120px] rounded-md cursor-pointer px-3 py-2.5 text-sm font-medium transition flex items-center justify-center ${
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
                  className="min-h-[40px] w-full cursor-pointer rounded-md bg-white px-3 py-0 text-left sm:w-[180px] flex items-center justify-between"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] leading-4 text-zinc-500 normal-font">კატეგორიები</span>
                    <span
                      className={
                        selectedCategoryLabel
                          ? "text-[13px] leading-5 font-medium text-zinc-900"
                          : "text-[13px] leading-5 text-zinc-900"
                      }
                    >
                      {selectedCategoryLabel ?? "ყველა"}
                    </span>
                  </div>
                  {categoryDropdownOpen ? (
                    <ChevronUpIcon className="h-4 w-4 shrink-0 text-zinc-500 transition-transform" aria-hidden />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-zinc-500 transition-transform" aria-hidden />
                  )}
                </button>
                {categoryDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-64 w-full min-w-[180px] overflow-auto rounded-lg bg-white py-1 shadow-lg"
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
                        ყველა
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
              <div ref={regionDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={openRegionDropdown}
                  aria-haspopup="listbox"
                  aria-expanded={regionDropdownOpen}
                  aria-label="რეგიონი"
                  className="min-h-[40px] w-full cursor-pointer rounded-md bg-white px-3 py-0 text-left sm:w-[130px] flex items-center justify-between"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] leading-4 text-zinc-500 normal-font">რეგიონი</span>
                    <span
                      className={
                        selectedRegionLabel
                          ? "text-[13px] leading-5 font-medium text-zinc-900"
                          : "text-[13px] leading-5 text-zinc-900"
                      }
                    >
                      {selectedRegionLabel ?? "ყველა"}
                    </span>
                  </div>
                  {regionDropdownOpen ? (
                    <ChevronUpIcon className="h-4 w-4 shrink-0 text-zinc-500 transition-transform" aria-hidden />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-zinc-500 transition-transform" aria-hidden />
                  )}
                </button>
                {regionDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={!region}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRegion("");
                        closeRegionDropdown();
                      }}
                      className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                    >
                      ყველა
                    </button>
                    {regions.map((r) => (
                      <button
                        key={r.slug}
                        type="button"
                        role="option"
                        aria-selected={r.slug === region}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRegion(r.slug);
                          closeRegionDropdown();
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                          r.slug === region ? "font-medium text-zinc-900 hover:bg-zinc-50" : "text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" name="region" value={region} readOnly aria-hidden />
              </div>
            </label>
            <button
              type="submit"
              className="min-h-[40px] min-w-[150px] rounded-md cursor-pointer wineo-green-bg px-5 py-2.5 text-sm font-normal text-white transition hover:bg-[#6d0423] flex items-center justify-center"
            >
              <FilterIcon className="h-4 w-4 shrink-0 mr-2" />
              ძებნა
            </button>
          </form>
        </div>
      </div>

      {/* Filters modal */}
      {filtersModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex justify-center bg-black/50 p-4 items-center sm:p-0"
          aria-modal="true"
          role="dialog"
          aria-labelledby="filters-modal-title"
          onClick={closeFiltersModal}
        >
          <div
            className="w-full max-w-lg max-h-[calc(100vh-5rem)] overflow-auto  bg-white shadow-xl sm:max-h-[90vh] rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-11 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
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
                <div className="flex items-center gap-2 h-full" role="group" aria-label="Listing type">
                  <button
                    type="button"
                    onClick={() => setListingType("buy")}
                    className={`min-h-[40px] flex flex-1 h-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition ${listingType === "buy" ? "bg-[#8a052d] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                  >
                    <ShoppingBagIcon className="h-4 w-4 shrink-0" />
                    იყიდე
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType("rent")}
                    className={`min-h-[40px] flex flex-1 h-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition ${listingType === "rent" ? "bg-[#8a052d] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
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
                    className="min-h-[40px] flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-left"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] leading-4 text-zinc-500 normal-font">კატეგორიები</span>
                      <span
                        className={
                          selectedCategoryLabel ? "text-[13px] leading-5 font-medium text-zinc-900" : "text-[13px] leading-5 text-zinc-500"
                        }
                      >
                        {selectedCategoryLabel ?? "ყველა"}
                      </span>
                    </div>
                    <svg className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {categoryDropdownOpen && (
                    <div role="listbox" className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
                      {canCategoryGoBack && (
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCategoryBack(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                          უკან
                        </button>
                      )}
                      {!canCategoryGoBack && (
                        <button type="button" role="option" aria-selected={!category} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCategory(""); closeCategoryDropdown(); }} className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100">
                          ყველა
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
                  <label className="mb-1 block text-sm font-medium text-zinc-700">რეგიონი</label>
                  <div ref={regionDropdownRefModal} className="relative">
                    <button
                      type="button"
                      onClick={openRegionDropdown}
                      aria-haspopup="listbox"
                      aria-expanded={regionDropdownOpen}
                      aria-label="რეგიონი"
                      className="min-h-[40px] flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-left"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-[11px] leading-4 text-zinc-500 normal-font">რეგიონი</span>
                        <span
                          className={
                            selectedRegionLabel
                              ? "text-[13px] leading-5 font-medium text-zinc-900"
                              : "text-[13px] leading-5 text-zinc-500"
                          }
                        >
                          {selectedRegionLabel ?? "ყველა"}
                        </span>
                      </div>
                      <svg
                        className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
                          regionDropdownOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {regionDropdownOpen && (
                      <div
                        role="listbox"
                        className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="option"
                          aria-selected={!region}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setRegion("");
                            closeRegionDropdown();
                          }}
                          className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                        >
                          ყველა
                        </button>
                        {regions.map((r) => (
                          <button
                            key={r.slug}
                            type="button"
                            role="option"
                            aria-selected={r.slug === region}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setRegion(r.slug);
                              closeRegionDropdown();
                            }}
                            className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                              r.slug === region ? "font-medium text-zinc-900 hover:bg-zinc-50" : "text-zinc-700 hover:bg-zinc-100"
                            }`}
                          >
                            <span>{r.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <input type="hidden" name="region" value={region} readOnly aria-hidden />
                  </div>
                </div>
                <button type="submit" className="min-h-[40px] flex items-center justify-center h-full gap-2 rounded-lg bg-[#8a052d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d0423]">
                  <SearchIcon className="h-4 w-4 shrink-0" />
                  ძებნა
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
     </div>
    </section>
  );
}
