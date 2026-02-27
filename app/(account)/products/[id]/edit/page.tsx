"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProductById, getRegions, getCities } from "@/lib/api";
import type { ApiProduct, ApiRegion, ApiCity } from "@/lib/api";
import { AddProductForm } from "@/app/(account)/add-product/AddProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [initialRegionId, setInitialRegionId] = useState("");
  const [initialCityId, setInitialCityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      queueMicrotask(() => {
        setError("ID არ მოიძებნა");
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    getProductById(id)
      .then((p) => {
        if (!cancelled) {
          setError(null);
          setProduct(p ?? null);
          if (!p) setError("განცხადება ვერ მოიძებნა");
        }
      })
      .catch(() => { if (!cancelled) setError("შეცდომა"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const productRegion = product?.location?.region;
  const productCity = product?.location?.city;

  useEffect(() => {
    if (!productRegion) return;
    let cancelled = false;
    getRegions().then((regions: ApiRegion[]) => {
      if (cancelled) return;
      const r = regions.find((x) => x.label === productRegion);
      if (r) setInitialRegionId(r.id);
    });
    return () => { cancelled = true; };
  }, [productRegion]);

  useEffect(() => {
    if (!initialRegionId || !productCity) return;
    let cancelled = false;
    getCities(initialRegionId).then((cities: ApiCity[]) => {
      if (cancelled) return;
      const c = cities.find((x) => x.label === productCity);
      if (c) setInitialCityId(c.id);
    });
    return () => { cancelled = true; };
  }, [initialRegionId, productCity]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <p className="text-zinc-500">იტვირთება…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <p className="text-red-600">{error ?? "განცხადება ვერ მოიძებნა"}</p>
        <Link href="/products" className="mt-4 inline-block text-[var(--nav-link-active)] hover:underline">
          ← ჩემი განცხადებები
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AddProductForm
        productId={product.id}
        initialProduct={product}
        initialRegionId={initialRegionId}
        initialCityId={initialCityId}
      />
    </div>
  );
}
