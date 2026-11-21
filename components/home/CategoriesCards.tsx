"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as LucideIcons from "lucide-react";
import type { ApiCategory } from "@/lib/api";
import { listingBasePath } from "@/lib/listing-search";

function toPascalCase(input: string) {
  return input
    .trim()
    .replace(/[-_]/g, " ")
    .split(/\s+/g)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join("");
}

function resolveCategoryIcon({
  icon,
  iconColor,
}: {
  icon: string;
  iconColor?: string;
}): ReactNode {
  const normalized = icon.trim();
  const safeIconColor = iconColor?.trim() ? iconColor.trim() : "#000";

  // If the stored icon includes emoji/symbols, just render it as text.
  const hasEmojiLikeChars = /[\u{1F300}-\u{1FAFF}]/u.test(normalized) || /[\u{2600}-\u{27BF}]/u.test(normalized);
  const containsNonAscii = /[^\x00-\x7F]/.test(normalized);
  if (hasEmojiLikeChars || containsNonAscii) {
    return (
      <span aria-hidden style={{ color: safeIconColor, fontSize: 26, lineHeight: 1 }}>
        {normalized}
      </span>
    );
  }

  // Otherwise treat it as an icon name (admin allows "category-icon-name").
  const lucideName = toPascalCase(normalized);
  const IconComp = (LucideIcons as unknown as Record<string, unknown>)[lucideName] as
    | ((props: { size?: number; color?: string }) => ReactNode)
    | undefined;
  if (IconComp) {
    return <IconComp aria-hidden size={28} color={safeIconColor} />;
  }

  // Fallback: render as text.
  return (
    <span aria-hidden style={{ color: safeIconColor, fontSize: 22, lineHeight: 1 }}>
      {normalized}
    </span>
  );
}

function categoryHref(category: ApiCategory) {
  const type = category.types?.includes("buy") || !category.types?.length ? "buy" : "rent";
  return listingBasePath(type, category.slug);
}

function CategoryCard({ category }: { category: ApiCategory }) {
  const iconBg = category.iconBg?.trim() ? category.iconBg.trim() : "#ffffff";
  const iconColor = category.iconColor?.trim() ? category.iconColor.trim() : "#000";
  const [isHovered, setIsHovered] = useState(false);

  const squareBg = isHovered ? iconColor : iconBg;
  const currentIconColor = isHovered ? "#ffffff" : iconColor;
  return (
    <Link
      href={categoryHref(category)}
      className="block text-left cursor-pointer"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="rounded-2xl bg-none sm:bg-[#f5f6f8] hover:bg-[#fff] transition-colors duration-300 p-0 md:p-5 flex flex-col items-center justify-start">
        <div
          className="w-15 h-15 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: squareBg }}
        >
          {resolveCategoryIcon({ icon: category.icon ?? "", iconColor: currentIconColor })}
        </div>
        <p className="mt-3 text-zinc-700 text-[12px] md:text-sm font-semibold normal-font text-center">{category.name}</p>
      </div>
    </Link>
  );
}

export function CategoriesCards({ categories }: { categories: ApiCategory[] }) {
  const withIcons = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.active &&
          !c.parentId &&
          typeof c.icon === "string" &&
          c.icon.trim().length > 0,
      ),
    [categories],
  );

  if (withIcons.length === 0) return null;

  return (
    <section className="pb-0 pt-10 md:pt-20 px-4 md:px-0">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-3 gap-2 md:gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {withIcons.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

