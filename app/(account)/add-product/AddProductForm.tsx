"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  createProduct,
  updateProduct,
  getCategories,
  getRegions,
  getCities,
  getFiltersByCategoryId,
  type ApiCategory,
  type ApiRegion,
  type ApiCity,
  type ApiFilter,
  type ApiProduct,
  type CreateProductPayload,
  type PromotionType,
} from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import type { CategoryTreeNode } from "@/types/category";
import {
  ProductImageUpload,
  getTempImageKeys,
  getExistingImageUrls,
  type UploadedImage,
} from "@/components/product/ProductImageUpload";

/** Georgian → Latin (ISO 9984–style) for URL-friendly slugs */
function transliterateGeorgianToLatin(s: string): string {
  const geoToLat: Record<string, string> = {
    ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i",
    კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh", რ: "r", ს: "s",
    ტ: "t", უ: "u", ფ: "f", ქ: "k", ღ: "gh", ყ: "q", შ: "sh", ჩ: "ch", ც: "ts",
    ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
  };
  return Array.from(s, (c) => (geoToLat as Record<string, string>)[c] ?? c).join("");
}

function titleToSlug(title: string): string {
  if (!title?.trim()) return "";
  const t = transliterateGeorgianToLatin(title.trim());
  return t
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toLocalDateTimeInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function defaultPromotionExpiryLocal(): string {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return toLocalDateTimeInputValue(d);
}

/** Promotion options with price and duration for display */
const PROMOTION_OPTIONS = [
  { type: "highlighted" as const, label: "გამოკვეთილი", labelClass: "text-yellow-400", desc: "შენი განცხადება უფრო თვალსაჩინო გახდება", price: "9₾", duration: "7 დღე" },
  { type: "featured" as const, label: "რეკომენდირებული", labelClass: "text-amber-600", desc: "გამოჩნდება რეკომენდირებულ განცხადებებში", price: "19₾", duration: "7 დღე" },
  { type: "homepageTop" as const, label: "TOP", labelClass: "text-purple-600", desc: "ჩანს მთავარ გვერდის ზედა ბლოკში", price: "39₾", duration: "7 დღე" },
];
const LISTING_TYPES = [
  { value: "sell" as const, label: "იყიდება" },
  { value: "rent" as const, label: "ქირავდება" },
];
const RENT_PERIODS = [
  { value: "hour" as const, label: "საათი" },
  { value: "day" as const, label: "დღე" },
  { value: "week" as const, label: "კვირა" },
  { value: "month" as const, label: "თვე" },
];
const CURRENCIES = [
  { value: "GEL" as const, label: "₾ (GEL)" },
  { value: "USD" as const, label: "$ (USD)" },
];
const PRICE_TYPES = [
  { value: "fixed" as const, label: "ფიქსირებული" },
  { value: "negotiable" as const, label: "შეთანხმებით" },
];
const CONDITIONS = [
  { value: "new" as const, label: "ახალი" },
  { value: "used" as const, label: "მეორადი" },
];

/** Renders a single filter control for add-product form (controlled by local state). */
function AddProductFilterControl({
  filter,
  valueSingle,
  valueMulti,
  onChange,
}: {
  filter: ApiFilter;
  valueSingle: string | number | boolean;
  valueMulti: string[];
  onChange: (value: string | string[] | number | boolean) => void;
}) {
  const label = filter.unit ? `${filter.name} (${filter.unit})` : filter.name;
  const id = `add-filter-${filter.id}`;

  if (filter.type === "select" && Array.isArray(filter.options) && filter.options.length > 0) {
    const selectedSet = new Set(valueMulti);
    const toggle = (opt: string) => {
      const next = selectedSet.has(opt)
        ? valueMulti.filter((v) => v !== opt)
        : [...valueMulti, opt];
      onChange(next);
    };
    return (
      <div className="space-y-2">
        <span className="block text-sm font-medium text-zinc-900">{label}</span>
        <div className="space-y-2">
          {filter.options.map((opt) => {
            const optId = `${id}-${opt.replace(/\s+/g, "-")}`;
            const checked = selectedSet.has(opt);
            return (
              <div key={opt} className="flex items-center gap-2">
                <input
                  id={optId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                <label htmlFor={optId} className="cursor-pointer text-sm text-zinc-700 hover:text-zinc-900">
                  {opt}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (filter.type === "number" || filter.type === "text") {
    const raw = valueSingle === undefined || valueSingle === null ? "" : String(valueSingle);
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-900">
          {label}
        </label>
        <input
          id={id}
          type={filter.type === "number" ? "number" : "text"}
          value={raw}
          onChange={(e) =>
            onChange(filter.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)
          }
          placeholder={filter.type === "number" ? "0" : ""}
          className={inputClass}
        />
      </div>
    );
  }

  if (filter.type === "checkbox") {
    const checked = valueSingle === true || valueSingle === "true" || valueSingle === "1";
    return (
      <div className="flex gap-2 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked ? "1" : "")}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
        />
        <label htmlFor={id} className="text-sm font-medium text-zinc-900">
          {label}
        </label>
      </div>
    );
  }

  if (filter.type === "range") {
    const raw = valueSingle === undefined || valueSingle === null ? "" : String(valueSingle);
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-900">
          {label}
        </label>
        <input
          id={id}
          type="text"
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          placeholder="მაგ. 0-100"
          className={inputClass}
        />
      </div>
    );
  }

  return null;
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-[1px] border-zinc-300 px-3 py-2 text-zinc-900 focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]";

export function AddProductForm({
  productId,
  initialProduct,
  initialRegionId,
  initialCityId,
}: {
  productId?: string;
  initialProduct?: ApiProduct | null;
  initialRegionId?: string;
  initialCityId?: string;
} = {}) {
  const router = useRouter();
  const { user, token, loading: authLoading, updateProfile } = useAuth();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [regions, setRegions] = useState<ApiRegion[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sell" | "rent">("sell");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"GEL" | "USD">("GEL");
  const [priceType, setPriceType] = useState<"fixed" | "negotiable">("fixed");
  const [rentPeriod, setRentPeriod] = useState<"hour" | "day" | "week" | "month" | "">("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [condition, setCondition] = useState<"new" | "used" | "">("");
  const [thumbnail, setThumbnail] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [phone, setPhone] = useState("");
  const [promotionType, setPromotionType] = useState<PromotionType>("none");
  const [promotionExpiresAtLocal, setPromotionExpiresAtLocal] = useState<string>("");

  const [categoryFilters, setCategoryFilters] = useState<ApiFilter[]>([]);
  const [loadingCategoryFilters, setLoadingCategoryFilters] = useState(false);
  const [dynamicFilterValues, setDynamicFilterValues] = useState<
    Record<string, string | string[] | number | boolean>
  >({});

  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categoryLevelStack, setCategoryLevelStack] = useState<CategoryTreeNode[][]>([]);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categoryDropdownOpen || categoryTree.length === 0) return;
    const current = categoryLevelStack.length > 0 ? categoryLevelStack[categoryLevelStack.length - 1] : [];
    if (current.length === 0) setCategoryLevelStack([categoryTree]);
  }, [categoryDropdownOpen, categoryTree, categoryLevelStack]);

  useEffect(() => {
    if (!categoryDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
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
      setCategoryId(node.id);
      closeCategoryDropdown();
    }
  };

  const handleCategoryBack = () => {
    setCategoryLevelStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const currentCategoryOptions = categoryLevelStack.length > 0 ? categoryLevelStack[categoryLevelStack.length - 1] : [];
  const canCategoryGoBack = categoryLevelStack.length > 1;

  useEffect(() => {
    if (!categoryId) {
      setCategoryFilters([]);
      setDynamicFilterValues({});
      return;
    }
    let cancelled = false;
    setLoadingCategoryFilters(true);
    getFiltersByCategoryId(categoryId)
      .then((list) => {
        if (!cancelled) {
          setCategoryFilters(list.filter((f) => f.isActive));
          const attrs = productId && initialProduct?.attributes && Array.isArray(initialProduct.attributes) && initialProduct.attributes.length > 0
            ? initialProduct.attributes
            : null;
          if (attrs) {
            const fromProduct = Object.fromEntries(
              attrs.map((a) => [String(a.filterId), a.value])
            );
            setDynamicFilterValues(fromProduct);
          } else {
            setDynamicFilterValues({});
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCategoryFilters(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, productId, initialProduct?.attributes]);

  const setDynamicFilter = useCallback((filterId: string, value: string | string[] | number | boolean) => {
    setDynamicFilterValues((prev) => {
      if (value === "" || (Array.isArray(value) && value.length === 0)) {
        const next = { ...prev };
        delete next[filterId];
        return next;
      }
      return { ...prev, [filterId]: value };
    });
  }, []);

  useEffect(() => {
    Promise.all([getCategories(), getRegions()]).then(([cats, regs]) => {
      setCategories(cats.filter((c) => c.active));
      setRegions(regs);
    });
  }, []);

  const loadCities = useCallback((rid: string) => {
    if (!rid) {
      setCities([]);
      setCityId("");
      return;
    }
    setLoadingCities(true);
    getCities(rid).then((list) => {
      setCities(list);
      setCityId("");
      setLoadingCities(false);
    });
  }, []);

  useEffect(() => {
    loadCities(regionId);
  }, [regionId, loadCities]);

  useEffect(() => {
    if (user?.phone != null && user.phone !== "") setPhone((prev) => prev || user.phone || "");
  }, [user?.phone]);

  const isEditMode = Boolean(productId && initialProduct);

  useEffect(() => {
    if (!isEditMode || !initialProduct) return;
    setTitle(initialProduct.title ?? "");
    setDescription(initialProduct.description ?? "");
    setType(initialProduct.type === "rent" ? "rent" : "sell");
    setCategoryId(initialProduct.categoryId ?? "");
    setPrice(initialProduct.price != null ? String(initialProduct.price) : "");
    setCurrency(initialProduct.currency === "USD" ? "USD" : "GEL");
    setPriceType("fixed");
    setRentPeriod((initialProduct.type === "rent" && initialProduct.rentPeriod) ? initialProduct.rentPeriod : "");
    setRegionId(initialRegionId ?? "");
    setCityId(initialCityId ?? "");
    setCondition(
      (initialProduct.specifications?.condition === "new" || initialProduct.specifications?.condition === "used")
        ? (initialProduct.specifications.condition as "new" | "used")
        : ""
    );
    setThumbnail(initialProduct.thumbnail ?? "");
    setUploadedImages(
      (initialProduct.images || []).map((url) => ({
        key: "",
        preview: url,
        uploading: false,
      }))
    );
    const pt = (initialProduct.promotionType ?? "none") as PromotionType;
    const expiresAtIso = initialProduct.promotionExpiresAt ?? null;
    const expiresAt = expiresAtIso ? new Date(expiresAtIso) : null;
    const isActive =
      pt !== "none" &&
      expiresAt != null &&
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt.getTime() > Date.now();

    setPromotionType(isActive ? pt : "none");
    setPromotionExpiresAtLocal(isActive && expiresAt ? toLocalDateTimeInputValue(expiresAt) : "");
  }, [isEditMode, initialProduct, initialRegionId, initialCityId]);

  useEffect(() => {
    if (isEditMode && initialRegionId && !regionId) setRegionId(initialRegionId);
  }, [isEditMode, initialRegionId, regionId]);

  useEffect(() => {
    if (isEditMode && initialCityId && !cityId) setCityId(initialCityId);
  }, [isEditMode, initialCityId, cityId]);

  if (authLoading) {
    return <p className="text-zinc-500">იტვირთება...</p>;
  }
  if (!user || !token) {
    return (
      <p className="text-zinc-600">
        განცხადების დასამატებლად გაიარეთ{" "}
        <a href="/login" className="text-[var(--nav-link-active)] underline">შესვლა</a>.
      </p>
    );
  }

  const selectedCategory = categoryId ? categories.find((c) => c.id === categoryId) : null;
  const selectedRegion = regionId ? regions.find((r) => r.id === regionId) : null;
  const selectedCity = cityId ? cities.find((c) => c.id === cityId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedCategory) {
      setError("კატეგორიის არჩევა სავალდებულოა");
      return;
    }
    if (!selectedRegion || !selectedCity) {
      setError("რეგიონი და ქალაქი სავალდებულოა");
      return;
    }
    if (type === "rent" && !rentPeriod) {
      setError("ქირის პერიოდი სავალდებულოა");
      return;
    }
    const requiredFilter = categoryFilters.find(
      (f) => f.isRequired && (dynamicFilterValues[f.id] === undefined || dynamicFilterValues[f.id] === "" || (Array.isArray(dynamicFilterValues[f.id]) && (dynamicFilterValues[f.id] as string[]).length === 0))
    );
    if (requiredFilter) {
      setError(`სავალდებულო მახასიათებელი: ${requiredFilter.name}`);
      return;
    }
    if (!phone.trim()) {
      setError("საკონტაქტო ნომერი სავალდებულოა");
      return;
    }
    const tempImageKeys = getTempImageKeys(uploadedImages);
    const existingUrls = getExistingImageUrls(uploadedImages);
    if (!isEditMode && tempImageKeys.length === 0 && existingUrls.length === 0) {
      setError("დაამატეთ მინიმუმ ერთი სურათი");
      return;
    }
    const priceNum = priceType === "negotiable" ? 0 : parseFloat(price);
    if (priceType === "fixed" && (Number.isNaN(priceNum) || priceNum < 0)) {
      setError("შეიყვანეთ სწორი ფასი");
      return;
    }

  
    const attributes = categoryFilters
      .map((f) => {
        const v = dynamicFilterValues[f.id];
        if (v === undefined || v === null) return null;
        if (typeof v === "string" && v.trim() === "") return null;
        if (Array.isArray(v) && v.length === 0) return null;
        return { filterId: f.id, value: v as string | number | boolean | string[] };
      })
      .filter((a): a is { filterId: string; value: string | number | boolean | string[] } => a != null);
    const payload: CreateProductPayload = {
      title: title.trim(),
      slug: titleToSlug(title) || undefined,
      description: description.trim(),
      type,
      category: { name: selectedCategory.name, slug: selectedCategory.slug },
      categoryId: selectedCategory.id,
      price: priceNum,
      currency,
      priceType,
      ...(type === "rent" && rentPeriod ? { rentPeriod } : {}),
      location: { region: selectedRegion.label, city: selectedCity.label },
      ...(isEditMode
        ? {
            ...(existingUrls.length > 0 ? { images: existingUrls, thumbnail: existingUrls[0] } : {}),
            ...(tempImageKeys.length > 0 ? { tempImageKeys } : {}),
          }
        : tempImageKeys.length > 0
          ? { tempImageKeys }
          : {}),
      ...(existingUrls.length === 0 && tempImageKeys.length === 0 && thumbnail.trim() ? { thumbnail: thumbnail.trim() } : {}),
      ...(condition ? { specifications: { condition } } : {}),
      ...(attributes.length > 0 ? { attributes } : {}),
      promotionType,
      promotionExpiresAt:
        promotionType !== "none"
          ? new Date(promotionExpiresAtLocal || defaultPromotionExpiryLocal()).toISOString()
          : null,
    };

    setSubmitting(true);
    try {
      await updateProfile({ phone: phone.trim() });
      if (productId) {
        await updateProduct(token, productId, payload);
      } else {
        await createProduct(token, payload);
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass = "block text-sm font-medium text-zinc-700";

  /** Preview data for the listing card: thumbnail from first image, then form fields */
  const previewThumbnail =
    uploadedImages[0]?.preview ?? thumbnail?.trim() ?? "";
  const previewPriceLabel = (() => {
    const sym = currency === "GEL" ? "₾" : "$";
    if (priceType === "negotiable") return "შეთანხმებით";
    const value = price.trim() ? Number(price) : 0;
    if (Number.isNaN(value)) return "—";
    const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (type === "rent" && rentPeriod) {
      const unitLabel =
        rentPeriod === "hour"
          ? "საათი"
          : rentPeriod === "day"
            ? "დღე"
            : rentPeriod === "week"
              ? "კვირა"
              : rentPeriod === "month"
                ? "თვე"
                : rentPeriod;
      return `${formatted} ${sym} - ${unitLabel}`;
    }
    return `${formatted} ${sym}`;
  })();
  const previewLocation =
    [selectedRegion?.label, selectedCity?.label].filter(Boolean).join(", ") || null;

  return (
  <div className="flex gap-4">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900 normal-font">ძირითადი ინფორმაცია</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className={labelClass}>სათაური</label>
            <input
              id="title"
              type="text"
              required
              minLength={2}
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="მაგ. ყურძნის პრესი"
            />
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>აღწერა</label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="აღწერა სავალდებულოა"
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>საკონტაქტო ნომერი</label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="მაგ. +995 555 123 456"
            />
            <p className="mt-1 text-xs text-zinc-500">შეინახება თქვენს ანგარიშზე და გამოჩნდება განცხადებაზე</p>
          </div>
          <div>
            <span className={labelClass}>ტიპი</span>
            <div className="mt-1 flex gap-2">
              {LISTING_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setType(opt.value);
                    if (opt.value === "sell") setRentPeriod("");
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    type === opt.value
                      ? "border-[var(--nav-link-active)] bg-[var(--nav-link-active)] text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900 normal-font">კატეგორია</h2>
        <div className="mt-4">
          <label htmlFor="categoryId" className={labelClass}>კატეგორია</label>
          <div ref={categoryDropdownRef} className="relative mt-1">
            <button
              type="button"
              id="categoryId"
              onClick={openCategoryDropdown}
              aria-haspopup="listbox"
              aria-expanded={categoryDropdownOpen}
              aria-label="აირჩიეთ კატეგორია"
              className={`${inputClass} flex w-full items-center justify-between text-left`}
            >
              <span className={selectedCategory ? "text-zinc-900" : "text-zinc-500"}>
                {selectedCategory ? selectedCategory.name : "— აირჩიეთ კატეგორია —"}
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
                className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-300 bg-white py-1 shadow-lg"
              >
                {canCategoryGoBack && (
                  <button
                    type="button"
                    onClick={handleCategoryBack}
                    className="flex cursor-pointer w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    უკან
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
                    aria-selected={node.id === categoryId}
                    onClick={() => handleCategoryOptionClick(node)}
                    className={`flex cursor-pointer w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                      node.children.length > 0
                        ? "text-zinc-900 hover:bg-zinc-50 font-medium"
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
          </div>
          {categoryId && (
            <input
              type="hidden"
              name="categoryId"
              value={categoryId}
              readOnly
              aria-hidden
            />
          )}
        </div>
      </section>

      {categoryId && (
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900 normal-font">დამატებითი მახასიათებლები</h2>
          <div className="mt-4">
            {loadingCategoryFilters && (
              <p className="text-sm text-zinc-500">ფილტრები იტვირთება…</p>
            )}
            {!loadingCategoryFilters && categoryFilters.length > 0 && (
              <div className="space-y-4">
                {categoryFilters.map((filter) => (
                  <AddProductFilterControl
                    key={filter.id}
                    filter={filter}
                    valueSingle={
                      Array.isArray(dynamicFilterValues[filter.id])
                        ? (dynamicFilterValues[filter.id] as string[])[0] ?? ""
                        : (dynamicFilterValues[filter.id] ?? "") as string | number | boolean
                    }
                    valueMulti={
                      Array.isArray(dynamicFilterValues[filter.id])
                        ? (dynamicFilterValues[filter.id] as string[])
                        : dynamicFilterValues[filter.id] !== undefined &&
                            dynamicFilterValues[filter.id] !== "" &&
                            dynamicFilterValues[filter.id] !== null
                          ? [String(dynamicFilterValues[filter.id])]
                          : []
                    }
                    onChange={(value) => setDynamicFilter(filter.id, value)}
                  />
                ))}
              </div>
            )}
            {!loadingCategoryFilters && categoryFilters.length === 0 && selectedCategory && (
              <p className="text-sm text-zinc-500">ამ კატეგორიისთვის დამატებითი მახასიათებლები არ არის.</p>
            )}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900 normal-font">ღირებულება</h2>
        <div className="mt-4 space-y-4">
          <div>
            <span className={labelClass}>ფასის ტიპი</span>
            <div className="mt-1 flex gap-2">
              {PRICE_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriceType(opt.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    priceType === opt.value
                      ? "border-[var(--nav-link-active)] bg-[var(--nav-link-active)] text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={priceType === "negotiable" ? "opacity-60" : ""}>
              <label htmlFor="price" className={labelClass}>ფასი</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={priceType === "negotiable"}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div className={priceType === "negotiable" ? "opacity-60" : ""}>
              <span className={labelClass}>ვალუტა</span>
              <div className="mt-1 flex gap-2">
                {CURRENCIES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCurrency(opt.value)}
                    disabled={priceType === "negotiable"}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                      currency === opt.value
                        ? "border-[var(--nav-link-active)] bg-[var(--nav-link-active)] text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {type === "rent" && (
            <div>
              <label htmlFor="rentPeriod" className={labelClass}>ქირის პერიოდი</label>
              <select
                id="rentPeriod"
                required={type === "rent"}
                value={rentPeriod}
                onChange={(e) => setRentPeriod(e.target.value as typeof rentPeriod)}
                className={inputClass}
              >
                <option value="">— აირჩიეთ —</option>
                {RENT_PERIODS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900 normal-font">მდებარეობა</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="regionId" className={labelClass}>რეგიონი</label>
            <select
              id="regionId"
              required
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className={inputClass}
            >
              <option value="">— აირჩიეთ რეგიონი —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cityId" className={labelClass}>ქალაქი</label>
            <select
              id="cityId"
              required
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              disabled={!regionId || loadingCities}
              className={inputClass}
            >
              <option value="">— აირჩიეთ ქალაქი —</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {loadingCities && <p className="mt-1 text-xs text-zinc-500">იტვირთება...</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900 normal-font">მდგომარეობა</h2>
        <div className="mt-4 flex gap-2">
          {CONDITIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCondition(condition === opt.value ? "" : opt.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                condition === opt.value
                  ? "border-[var(--nav-link-active)] bg-[var(--nav-link-active)] text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900 normal-font">სურათები</h2>
        <div className="mt-4 space-y-4">
          <label className={labelClass}>სურათების ატვირთვა</label>
          <ProductImageUpload
            token={token!}
            value={uploadedImages}
            onChange={setUploadedImages}
            disabled={submitting}
          />
          {!isEditMode && getTempImageKeys(uploadedImages).length === 0 && getExistingImageUrls(uploadedImages).length === 0 && (
            <p className="text-xs text-zinc-500">პირველი სურათი გამოჩნდება როგორც მთავარი. დაამატეთ მინიმუმ ერთი სურათი.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900 normal-font mb-4">პრომოუშენი (არასავალდებულო)</h2>
        <div className="grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="პრიორიტეტი">
          {PROMOTION_OPTIONS.map((opt) => (
            <label
              key={opt.type}
              className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-colors ${
                promotionType === opt.type
                  ? "border-[var(--nav-link-active)] bg-[var(--nav-link-active)]/10"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setPromotionType((prev) => {
                  const next = prev === opt.type ? "none" : opt.type;
                  if (next !== "none" && !promotionExpiresAtLocal) setPromotionExpiresAtLocal(defaultPromotionExpiryLocal());
                  if (next === "none") setPromotionExpiresAtLocal("");
                  return next;
                });
              }}
            >
              <span className={`text-sm font-bold ${opt.labelClass}`}>{opt.label}</span>
              <span className="mt-1 text-xs text-zinc-600">{opt.desc}</span>
             <div className="flex justify-between border-t border-zinc-200 mt-2">
             <span className="mt-2 text-sm font-semibold text-zinc-900">{opt.price} / {opt.duration}</span>
              <input
                type="radio"
                name="priority"
                value={opt.type}
                checked={promotionType === opt.type}
                onChange={() => {}}
                className="mt-3 h-4 w-4 border-zinc-300 text-[var(--nav-link-active)] focus:ring-[var(--nav-link-active)]"
              />
             </div>
            </label>
          ))}
        </div>
      </section>

      <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50"
        >
          გაუქმება
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[var(--nav-link-active)] px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "შენახვა…" : productId ? "ცვლილებების შენახვა" : "განცხადების დამატება"}
        </button>
      </div>
      </form>

    {/* Dynamic listing preview — updates as you fill the form and choose photos */}
    <div className="w-[300px] shrink-0 sticky top-4 self-start hidden md:block">
      <article
        className={`overflow-hidden rounded-xl border bg-white ${
          promotionType === "highlighted"
            ? "border-yellow-400/60 bg-yellow-50/80"
            : "border-zinc-200"
        }`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
          {previewThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewThumbnail}
              alt={title.trim() || "პრევიუ"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <span className="text-sm">სურათი</span>
            </div>
          )}
          <span className="absolute left-3 bottom-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-800">
            {type === "sell" ? "იყიდე" : "იქირავე"}
          </span>
          {(promotionType === "featured" || promotionType === "homepageTop") && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </span>
          )}
          {condition && (
            <span
              className={`absolute right-3 bottom-3 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                condition === "new" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
              }`}
            >
              {condition === "new" ? "ახალი" : "მეორადი"}
            </span>
          )}
        </div>
        <div className="p-4">
          {selectedCategory && (
            <p className="text-xs text-zinc-500 mb-1">{selectedCategory.name}</p>
          )}
          <h2 className="font-medium text-zinc-900 line-clamp-2 text-sm">
            {title.trim() || "— სათაური —"}
          </h2>
          {previewLocation && (
            <p className="mt-1 text-xs text-zinc-500">{previewLocation}</p>
          )}
          <div className="border-t border-zinc-200 mt-4" />
          <div className="mt-3 flex justify-between items-center">
            <p className="text-md font-medium text-zinc-900">{previewPriceLabel}</p>
          </div>
        </div>
      </article>
    </div>
  </div>
  );
}
