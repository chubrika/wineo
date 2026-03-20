"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as LucideIcons from "lucide-react";
import { getCategories, type ApiCategory } from "@/lib/api";
import { useCategoriesModal } from "@/contexts/CategoriesModalContext";

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

function CategoryCard({
  category,
  onOpen,
}: {
  category: ApiCategory;
  onOpen: (slug: string) => void;
}) {
  const iconBg = category.iconBg?.trim() ? category.iconBg.trim() : "#ffffff";
  const iconColor = category.iconColor?.trim() ? category.iconColor.trim() : "#000";
  const [isHovered, setIsHovered] = useState(false);

  const squareBg = isHovered ? iconColor : iconBg;
  const currentIconColor = isHovered ? "#ffffff" : iconColor;
  return (
    <button
      type="button"
      onClick={() => onOpen(category.slug)}
      className="block text-left cursor-pointer"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="rounded-2xl bg-[#f5f6f8] hover:bg-[#fff] transition-colors duration-300 p-5 flex flex-col items-center justify-start">
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: squareBg }}
        >
          {resolveCategoryIcon({ icon: category.icon ?? "", iconColor: currentIconColor })}
        </div>
        <p className="mt-3 text-zinc-700 text-[12px] md:text-sm font-semibold normal-font text-center">{category.name}</p>
      </div>
    </button>
  );
}

export function CategoriesCards() {
  const { openCategoriesModal } = useCategoriesModal();
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const withIcons = useMemo(
    () =>
      categories.filter(
        (c) => c.active && typeof c.icon === "string" && c.icon.trim().length > 0
      ),
    [categories]
  );

  useEffect(() => {
    let cancelled = false;
    getCategories({ roots: true })
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (withIcons.length === 0) return null;

  return (
    <section className="bg-white pb-0 pt-10 md:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2 md:gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {withIcons.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onOpen={(slug) => openCategoriesModal({ initialRootSlug: slug })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

