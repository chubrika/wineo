"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  createProduct,
  getCategories,
  getRegions,
  getCities,
  type ApiCategory,
  type ApiRegion,
  type ApiCity,
  type CreateProductPayload,
} from "@/lib/api";

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

export function AddProductForm() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
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
  const [imagesText, setImagesText] = useState("");
  const [thumbnail, setThumbnail] = useState("");

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
    const priceNum = priceType === "negotiable" ? 0 : parseFloat(price);
    if (priceType === "fixed" && (Number.isNaN(priceNum) || priceNum < 0)) {
      setError("შეიყვანეთ სწორი ფასი");
      return;
    }

    const images = imagesText
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
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
      ...(images.length > 0 ? { images } : {}),
      ...(thumbnail.trim() ? { thumbnail: thumbnail.trim() } : {}),
      ...(condition ? { specifications: { condition } } : {}),
    };

    setSubmitting(true);
    try {
      await createProduct(token, payload);
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-[var(--nav-link-active)] focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)]";
  const labelClass = "block text-sm font-medium text-zinc-700";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <section>
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

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 normal-font">კატეგორია</h2>
        <div className="mt-4">
          <label htmlFor="categoryId" className={labelClass}>კატეგორია</label>
          <select
            id="categoryId"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">— აირჩიეთ კატეგორია —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
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

      <section>
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

      <section>
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

      <section>
          <h2 className="text-sm font-semibold text-zinc-900 normal-font">სურათები</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="images" className={labelClass}>სურათების URL-ები (თითო ხაზზე ერთი)</label>
            <textarea
              id="images"
              rows={3}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="thumbnail" className={labelClass}>პირველადი სურათის URL (არასავალდებულო)</label>
            <input
              id="thumbnail"
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className={inputClass}
              placeholder="ცარიელი = პირველი სურათი"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-3 border-t border-zinc-200 pt-6">
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
          {submitting ? "შენახვა…" : "განცხადების დამატება"}
        </button>
      </div>
    </form>
  );
}
