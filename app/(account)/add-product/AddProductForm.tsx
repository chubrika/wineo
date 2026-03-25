"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { FancySelect } from "@/components/ui";
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
import { SimpleEditor } from "@/components/editor/SimpleEditor";

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

function normalizeDecimalInput(raw: string): string {
  return raw.replace(",", ".");
}

function parseDecimal(raw: string): number {
  return parseFloat(normalizeDecimalInput(raw));
}

/** Promotion options with price and duration for display */
// const PROMOTION_OPTIONS = [
//   { type: "highlighted" as const, label: "გამოკვეთილი", labelClass: "text-yellow-400", desc: "შენი განცხადება უფრო თვალსაჩინო გახდება", price: "9₾", duration: "7 დღე" },
//   { type: "featured" as const, label: "რეკომენდირებული", labelClass: "text-amber-600", desc: "გამოჩნდება რეკომენდირებულ განცხადებებში", price: "19₾", duration: "7 დღე" },
//   { type: "homepageTop" as const, label: "TOP", labelClass: "text-purple-600", desc: "ჩანს მთავარ გვერდის ზედა ბლოკში", price: "39₾", duration: "7 დღე" },
// ];
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
  { value: "GEL" as const, label: "ლარი" },
  { value: "USD" as const, label: "დოლარი" },
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
  hasError,
}: {
  filter: ApiFilter;
  valueSingle: string | number | boolean;
  valueMulti: string[];
  onChange: (value: string | string[] | number | boolean) => void;
  hasError?: boolean;
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
      <div id={id} className="space-y-2">
        <span className="block text-sm font-medium text-zinc-900">
          {label}
          {filter.isRequired ? <span className="text-red-500"> *</span> : null}
        </span>
        <div className={`space-y-2 ${hasError ? "rounded-lg border border-red-500/70 bg-red-50/30 p-3" : ""}`}>
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
          {filter.isRequired ? <span className="text-red-500"> *</span> : null}
        </label>
        <input
          id={id}
          type={filter.type === "number" ? "number" : "text"}
          value={raw}
          onChange={(e) =>
            onChange(filter.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)
          }
          placeholder={filter.type === "number" ? "0" : ""}
          className={hasError ? inputClassError : inputClass}
        />
      </div>
    );
  }

  if (filter.type === "checkbox") {
    const checked = valueSingle === true || valueSingle === "true" || valueSingle === "1";
    return (
      <div id={id} className={`flex gap-2 items-center rounded-lg ${hasError ? "border border-red-500/70 bg-red-50/30 p-3" : ""}`}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked ? "1" : "")}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
        />
        <label htmlFor={id} className="text-sm font-medium text-zinc-900">
          {label}
          {filter.isRequired ? <span className="text-red-500"> *</span> : null}
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
          {filter.isRequired ? <span className="text-red-500"> *</span> : null}
        </label>
        <input
          id={id}
          type="text"
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          placeholder="მაგ. 0-100"
          className={hasError ? inputClassError : inputClass}
        />
      </div>
    );
  }

  return null;
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-[1px] border-zinc-300 px-3 py-2 text-zinc-900 focus:border-[var(--nav-link-active)] focus:outline-none  focus:ring-[var(--nav-link-active)]";
const inputClassError =
  "mt-1 block w-full rounded-lg border border-[1px] border-red-500 px-3 py-2 text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-red-500";

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
  const { openLoginModal } = useLoginModal();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [regions, setRegions] = useState<ApiRegion[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sell" | "rent">("sell");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [currency, setCurrency] = useState<"GEL" | "USD">("GEL");
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
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

  const requiredCategoryType = type === "rent" ? "rent" : "buy";
  const categoriesForType = useMemo(
    () => categories.filter((c) => c.active && Array.isArray(c.types) && c.types.includes(requiredCategoryType)),
    [categories, requiredCategoryType]
  );

  const categoryTree = useMemo(
    () => buildCategoryTree(categoriesForType),
    [categoriesForType]
  );

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categoryLevelStack, setCategoryLevelStack] = useState<CategoryTreeNode[][]>([]);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!currencyDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currencyDropdownOpen]);

  useEffect(() => {
    if (priceType === "negotiable") {
      setCurrencyDropdownOpen(false);
      setDiscountedPrice("");
    }
  }, [priceType]);

  const discountedPercent = useMemo(() => {
    if (priceType !== "fixed") return "";
    const basePrice = parseDecimal(price);
    const salePrice = parseDecimal(discountedPrice);
    if (Number.isNaN(basePrice) || basePrice <= 0) return "";
    if (Number.isNaN(salePrice) || salePrice < 0 || salePrice >= basePrice) return "";
    const percent = ((basePrice - salePrice) / basePrice) * 100;
    return String(Math.round(percent * 100) / 100);
  }, [price, discountedPrice, priceType]);

  const scrollToField = useCallback((key: string) => {
    const el =
      document.getElementById(key) ??
      document.getElementById(
        key.startsWith("filter:") ? `add-filter-${key.slice("filter:".length)}` : key
      );
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      el.focus();
    }
  }, []);

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
          const activeList = list.filter((f) => f.isActive);
          setCategoryFilters(activeList);
          const attrs = productId && initialProduct?.attributes ? initialProduct.attributes : null;
          if (attrs != null) {
            let fromProduct: Record<string, string | string[] | number | boolean>;
            if (Array.isArray(attrs) && attrs.length > 0) {
              const first = attrs[0];
              const isNewShape =
                first &&
                typeof first === "object" &&
                "slug" in first &&
                "values" in first &&
                Array.isArray((first as { values?: unknown }).values);
              if (isNewShape) {
                fromProduct = {};
                for (const a of attrs as { name: string; slug: string; values: string[] }[]) {
                  const f = activeList.find((x) => x.slug === a.slug);
                  if (f && a.values.length > 0) {
                    fromProduct[f.id] = a.values.length === 1 ? a.values[0] : a.values;
                  }
                }
              } else {
                const arr = attrs as { filterId: string; value: string | number | boolean | string[] }[];
                fromProduct = Object.fromEntries(arr.map((a) => [String(a.filterId), a.value]));
              }
            } else if (typeof attrs === "object" && attrs !== null && !Array.isArray(attrs)) {
              const slugMap = attrs as Record<string, string[] | string | number | boolean>;
              fromProduct = {};
              for (const f of activeList) {
                const raw = slugMap[f.slug];
                if (raw !== undefined && raw !== null) {
                  fromProduct[f.id] = Array.isArray(raw) ? raw : raw;
                }
              }
            } else {
              fromProduct = {};
            }
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
    setDiscountedPrice(
      initialProduct.discountedPrice != null ? String(initialProduct.discountedPrice) : ""
    );
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

  useEffect(() => {
    if (!categoryId) return;
    // If user switched listing type, clear an incompatible selected category.
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const ok = Array.isArray(cat.types) && cat.types.includes(requiredCategoryType);
    if (!ok) setCategoryId("");
  }, [requiredCategoryType, categoryId, categories]);

  if (authLoading) {
    return <p className="text-zinc-500">იტვირთება...</p>;
  }
  if (!user || !token) {
    return (
      <p className="text-zinc-600">
        განცხადების დასამატებლად გაიარეთ{" "}
        <button type="button" onClick={openLoginModal} className="text-[var(--nav-link-active)] underline">შესვლა</button>.
      </p>
    );
  }

  const selectedCategory = categoryId ? categoriesForType.find((c) => c.id === categoryId) : null;
  const selectedRegion = regionId ? regions.find((r) => r.id === regionId) : null;
  const selectedCity = cityId ? cities.find((c) => c.id === cityId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const nextFieldErrors: Record<string, string> = {};
    const setFieldError = (key: string, message: string) => {
      if (!nextFieldErrors[key]) nextFieldErrors[key] = message;
    };

    if (!title.trim()) setFieldError("title", "სათაური სავალდებულოა");
    if (!selectedCategory) setFieldError("categoryId", "კატეგორიის არჩევა სავალდებულოა");
    if (!selectedRegion) setFieldError("regionId", "რეგიონი სავალდებულოა");
    if (!selectedCity) setFieldError("cityId", "ქალაქი სავალდებულოა");
    if (type === "rent" && !rentPeriod) setFieldError("rentPeriod", "ქირის პერიოდი სავალდებულოა");
    if (!description.trim()) setFieldError("description", "აღწერა სავალდებულოა");
    if (!phone.trim()) setFieldError("phone", "საკონტაქტო ნომერი სავალდებულოა");

    const tempImageKeys = getTempImageKeys(uploadedImages);
    const existingUrls = getExistingImageUrls(uploadedImages);
    if (!isEditMode && tempImageKeys.length === 0 && existingUrls.length === 0) {
      setFieldError("images", "დაამატეთ მინიმუმ ერთი სურათი");
    }
    const priceNum = priceType === "negotiable" ? 0 : parseDecimal(price);
    if (priceType === "fixed" && (Number.isNaN(priceNum) || priceNum < 0)) {
      setFieldError("price", "შეიყვანეთ სწორი ფასი");
    }
    const discountedPriceNum =
      priceType === "fixed" && discountedPrice.trim() !== ""
        ? parseDecimal(discountedPrice)
        : null;
    if (
      discountedPriceNum != null &&
      (Number.isNaN(discountedPriceNum) || discountedPriceNum < 0 || discountedPriceNum >= priceNum)
    ) {
      setFieldError("discountedPrice", "ფასდაკლებული ფასი უნდა იყოს ძირითად ფასზე ნაკლები");
    }

    const requiredFiltersMissing = categoryFilters.filter((f) => {
      if (!f.isRequired) return false;
      const v = dynamicFilterValues[f.id];
      if (v === undefined || v === null) return true;
      if (typeof v === "string" && v.trim() === "") return true;
      if (Array.isArray(v) && v.length === 0) return true;
      return false;
    });
    if (requiredFiltersMissing.length > 0) {
      for (const f of requiredFiltersMissing) {
        setFieldError(`filter:${f.id}`, `სავალდებულო მახასიათებელი: ${f.name}`);
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError(Object.values(nextFieldErrors)[0] ?? "");
      const firstKey = Object.keys(nextFieldErrors)[0];
      if (firstKey) requestAnimationFrame(() => scrollToField(firstKey));
      return;
    }

    // Type narrowing for payload construction (should be guaranteed by validation above).
    if (!selectedCategory || !selectedRegion || !selectedCity) {
      setError("შეავსეთ სავალდებულო ველები");
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
      ...(discountedPriceNum != null
        ? {
            discountedPrice: discountedPriceNum,
            discountedPercent: Number(discountedPercent),
          }
        : {}),
      currency,
      priceType,
      ...(type === "rent" && rentPeriod ? { rentPeriod } : {}),
      location: { region: selectedRegion.slug, city: selectedCity.label },
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
  const fieldErrorText = (key: string) =>
    fieldErrors[key] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {fieldErrors[key]}
      </p>
    ) : null;

  /** Preview data for the listing card: thumbnail from first image, then form fields */
  const previewThumbnail =
    uploadedImages[0]?.preview ?? thumbnail?.trim() ?? "";
  const formatPreviewPriceValue = (value: number) => {
    const sym = currency === "GEL" ? "₾" : "$";
    const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 2 });
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
  };
  const previewPriceValue = price.trim() ? Number(price) : 0;
  const previewDiscountedPriceValue =
    discountedPrice.trim() !== "" ? Number(discountedPrice) : Number.NaN;
  const previewHasDiscount =
    priceType === "fixed" &&
    !Number.isNaN(previewPriceValue) &&
    previewPriceValue > 0 &&
    !Number.isNaN(previewDiscountedPriceValue) &&
    previewDiscountedPriceValue >= 0 &&
    previewDiscountedPriceValue < previewPriceValue;
  const previewPriceLabel =
    priceType === "negotiable"
      ? "შეთანხმებით"
      : Number.isNaN(previewPriceValue)
        ? "—"
        : formatPreviewPriceValue(previewPriceValue);
  const previewDiscountedPriceLabel = previewHasDiscount
    ? formatPreviewPriceValue(previewDiscountedPriceValue)
    : null;
  const previewLocation =
    [selectedRegion?.label, selectedCity?.label].filter(Boolean).join(", ") || null;

  return (
  <div className="flex gap-4">
      <form onSubmit={handleSubmit} noValidate className="space-y-6 w-full">
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
            <label htmlFor="title" className={labelClass}>
              სათაური <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              minLength={2}
              maxLength={200}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.title;
                    return next;
                  });
                }
              }}
              className={fieldErrors.title ? inputClassError : inputClass}
              placeholder="მაგ. ყურძნის პრესი"
            />
            {fieldErrorText("title")}
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>
              აღწერა <span className="text-red-500">*</span>
            </label>
            <div className={fieldErrors.description ? "mt-1 rounded-lg border border-red-500 p-1" : "mt-1"}>
              <SimpleEditor
                id="description"
                value={description}
                onChange={(v) => {
                  setDescription(v);
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.description;
                      return next;
                    });
                  }
                }}
                placeholder="აღწერა სავალდებულოა"
                className="block w-full"
                minHeight="8rem"
              />
            </div>
            {fieldErrorText("description")}
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              საკონტაქტო ნომერი <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                }
              }}
              className={fieldErrors.phone ? inputClassError : inputClass}
              placeholder="მაგ. +995 555 123 456"
            />
            {fieldErrorText("phone")}
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
          <label htmlFor="categoryId" className={labelClass}>
            კატეგორია <span className="text-red-500">*</span>
          </label>
          <div ref={categoryDropdownRef} className="relative mt-1">
            <button
              type="button"
              id="categoryId"
              onClick={openCategoryDropdown}
              aria-haspopup="listbox"
              aria-expanded={categoryDropdownOpen}
              aria-label="აირჩიეთ კატეგორია"
              className={`${fieldErrors.categoryId ? inputClassError : inputClass} flex w-full items-center justify-between text-left cursor-pointer`}
            >
              <span className={selectedCategory ? "text-zinc-900" : "text-zinc-500"}>
                {selectedCategory ? selectedCategory.name : "ყველა"}
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
            {fieldErrorText("categoryId")}
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
                    hasError={Boolean(fieldErrors[`filter:${filter.id}`])}
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
          <div className={priceType === "negotiable" ? "opacity-60" : ""}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-end">
                <div className="flex-1">
              <label htmlFor="price" className={labelClass}>
                საწყისი ფასი {priceType === "fixed" ? <span className="text-red-500">*</span> : null}
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => {
                  setPrice(normalizeDecimalInput(e.target.value));
                  if (fieldErrors.price) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.price;
                      return next;
                    });
                  }
                }}
                disabled={priceType === "negotiable"}
                className={`mt-1 block w-full rounded-l-lg rounded-r-none border ${fieldErrors.price ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-[var(--nav-link-active)] focus:ring-[var(--nav-link-active)]"} border-r-0 px-3 py-2 text-zinc-900 focus:outline-none`}
                placeholder="0"
              />
              {fieldErrorText("price")}
                </div>
                <div className="relative min-w-[100px]" ref={currencyDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCurrencyDropdownOpen((prev) => !prev)}
                    disabled={priceType === "negotiable"}
                    className="mt-1 flex h-[42px] w-full items-center justify-between rounded-l-none rounded-r-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 cursor-pointer transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-100"
                  >
                    <span>{CURRENCIES.find((opt) => opt.value === currency)?.label ?? CURRENCIES[0].label}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`h-4 w-4 text-zinc-500 transition-transform ${currencyDropdownOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.117l3.71-3.886a.75.75 0 111.08 1.04l-4.25 4.45a.75.75 0 01-1.08 0l-4.25-4.45a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {currencyDropdownOpen && priceType !== "negotiable" && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
                      {CURRENCIES.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setCurrency(opt.value);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full rounded-md cursor-pointer px-3 py-2 text-left text-sm transition-colors ${
                            currency === opt.value
                              ? "wineo-red"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="discountedPrice" className={labelClass}>ფასდაკლებული ფასი</label>
                <div className="flex items-end">
                  <input
                    id="discountedPrice"
                    type="number"
                    step="0.01"
                    min={0}
                    value={discountedPrice}
                    onChange={(e) => {
                      setDiscountedPrice(normalizeDecimalInput(e.target.value));
                      if (fieldErrors.discountedPrice) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.discountedPrice;
                          return next;
                        });
                      }
                    }}
                    disabled={priceType === "negotiable"}
                    className={`mt-1 block w-full rounded-l-lg rounded-r-none border ${fieldErrors.discountedPrice ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-[var(--nav-link-active)] focus:ring-[var(--nav-link-active)]"} border-r-0 px-3 py-2 text-zinc-900 focus:outline-none`}
                    placeholder="0"
                  />
                  {fieldErrorText("discountedPrice")}
                  <div className="mt-1 flex h-[42px] min-w-[78px] items-center justify-center rounded-l-none rounded-r-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-600">
                    {discountedPercent || "0"}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          {type === "rent" && (
            <div>
              <label htmlFor="rentPeriod" className={labelClass}>
                ქირის პერიოდი <span className="text-red-500">*</span>
              </label>
              <select
                id="rentPeriod"
                required={type === "rent"}
                value={rentPeriod}
                onChange={(e) => {
                  setRentPeriod(e.target.value as typeof rentPeriod);
                  if (fieldErrors.rentPeriod) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.rentPeriod;
                      return next;
                    });
                  }
                }}
                className={fieldErrors.rentPeriod ? inputClassError : inputClass}
              >
                <option value="">— აირჩიეთ —</option>
                {RENT_PERIODS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {fieldErrorText("rentPeriod")}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900 normal-font">მდებარეობა</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="regionId" className={labelClass}>
              რეგიონი <span className="text-red-500">*</span>
            </label>
            <FancySelect
              id="regionId"
              value={regionId}
              onValueChange={(next) => {
                setRegionId(next);
                if (fieldErrors.regionId) {
                  setFieldErrors((prev) => {
                    const n = { ...prev };
                    delete n.regionId;
                    return n;
                  });
                }
              }}
              options={regions.map((r) => ({ value: r.id, label: r.label }))}
              placeholder="ყველა"
              hasError={Boolean(fieldErrors.regionId)}
              buttonClassName={fieldErrors.regionId ? inputClassError : inputClass}
            />
            {fieldErrorText("regionId")}
            {regionId && (
              <input type="hidden" name="regionId" value={regionId} readOnly aria-hidden />
            )}
          </div>
          <div>
            <label htmlFor="cityId" className={labelClass}>
              ქალაქი <span className="text-red-500">*</span>
            </label>
            <FancySelect
              id="cityId"
              value={cityId}
              onValueChange={(next) => {
                setCityId(next);
                if (fieldErrors.cityId) {
                  setFieldErrors((prev) => {
                    const n = { ...prev };
                    delete n.cityId;
                    return n;
                  });
                }
              }}
              options={cities.map((c) => ({ value: c.id, label: c.label }))}
              placeholder="ყველა"
              disabled={!regionId}
              loading={loadingCities}
              hasError={Boolean(fieldErrors.cityId)}
              buttonClassName={fieldErrors.cityId ? inputClassError : inputClass}
            />
            {fieldErrorText("cityId")}
            {loadingCities && <p className="mt-1 text-xs text-zinc-500">იტვირთება...</p>}
            {cityId && (
              <input type="hidden" name="cityId" value={cityId} readOnly aria-hidden />
            )}
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
          <div className={fieldErrors.images ? "rounded-lg border border-red-500 p-2" : ""}>
            <ProductImageUpload
              token={token!}
              value={uploadedImages}
              onChange={(imgs) => {
                setUploadedImages(imgs);
                if (fieldErrors.images) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.images;
                    return next;
                  });
                }
              }}
              disabled={submitting}
            />
          </div>
          {fieldErrorText("images")}
          {!isEditMode && getTempImageKeys(uploadedImages).length === 0 && getExistingImageUrls(uploadedImages).length === 0 && (
            <p className="text-xs text-zinc-500"> დაამატეთ მინიმუმ ერთი სურათი.</p>
          )}
        </div>
      </section>

      {/* <section className="rounded-xl border border-zinc-200 bg-white p-4">
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
      </section> */}

      <div className="flex gap-3 justify-between text-sm rounded-xl border border-zinc-200 bg-white p-4">
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
          className="rounded-lg bg-[var(--nav-link-active)] cursor-pointer px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "შენახვა…" : productId ? "შენახვა" : "გამოქვეყნება"}
        </button>
      </div>
      </form>

    {/* Dynamic listing preview — updates as you fill the form and choose photos */}
    <div className="w-[300px] shrink-0 sticky top-20 self-start hidden md:block">
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
            <div className="flex items-center gap-2">
              <p className="text-md font-medium text-zinc-900">
                {previewDiscountedPriceLabel ?? previewPriceLabel}
              </p>
              {previewHasDiscount && (
                <p className="text-xs text-zinc-500 line-through">{previewPriceLabel}</p>
              )}
            </div>
            {discountedPercent && <p className="text-xs bg-red-500 text-white rounded-full px-2 py-1">{discountedPercent}%</p>}
          </div>
        </div>
      </article>
      <div className="text-[13px] text-zinc-700 mt-5">
            <span>შეავსეთ ყველა სავალდებულო ველი რომელიც მონიშნულია <span className="text-red-500">*</span>-ით</span>
      </div>
    </div>
  </div>
  );
}
