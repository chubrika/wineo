import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import {
  getCategories,
  getGrapes,
  getNewsList,
  getPages,
  getProducts,
  getWineries,
} from "@/lib/api";
import { fetchEventsList } from "@/lib/events-api";

export const revalidate = 3600;

function absolute(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function lastModified(value?: string): Date {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/buy", "/rent", "/wineries", "/encyclopedia", "/news", "/events", "/contact"];

  const [products, wineries, grapes, news, events, categories, pages] = await Promise.all([
    safe(() => getProducts({ status: "active", limit: 500, revalidate: 3600 }), []),
    safe(() => getWineries(), []),
    safe(() => getGrapes(), []),
    safe(() => getNewsList({ limit: 500, revalidate: 3600 }), { items: [], total: 0 }),
    safe(() => fetchEventsList({ limit: 500, revalidate: 3600 }), { items: [], total: 0 }),
    safe(() => getCategories(), []),
    safe(() => getPages(), []),
  ]);

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absolute(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  for (const product of products) {
    const slug = product.slug?.trim();
    if (!slug || (product.status && product.status !== "active")) continue;
    const base = product.type === "rent" ? "/rent/listing" : "/buy/listing";
    entries.push({
      url: absolute(`${base}/${slug}`),
      lastModified: lastModified(product.updatedAt || product.createdAt),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const winery of wineries) {
    if (!winery.slug?.trim()) continue;
    entries.push({
      url: absolute(`/wineries/${winery.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const grape of grapes) {
    if (!grape.slug?.trim()) continue;
    entries.push({
      url: absolute(`/encyclopedia/${grape.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const item of news.items) {
    const slug = item.slug?.trim();
    if (!slug) continue;
    entries.push({
      url: absolute(`/news/${slug}`),
      lastModified: lastModified(item.updatedAt || item.date),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const event of events.items) {
    const slug = event.slug?.trim();
    if (!slug) continue;
    entries.push({
      url: absolute(`/events/${slug}`),
      lastModified: lastModified(event.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const category of categories) {
    if (!category.active || !category.slug?.trim()) continue;
    const types = category.types?.length ? category.types : (["buy"] as const);
    for (const type of types) {
      entries.push({
        url: absolute(`/${type}/${category.slug}`),
        lastModified: lastModified(category.updatedAt),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  for (const page of pages) {
    if (!page.slug?.trim()) continue;
    entries.push({
      url: absolute(`/pages/${page.slug}`),
      lastModified: lastModified(page.updatedAt || page.createdAt),
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  return entries;
}
