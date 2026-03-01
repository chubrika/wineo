"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ListingType } from "@/types/listing";
import type { CategoryTreeNode } from "@/types/category";
import { listingBasePath } from "@/lib/listing-search";

interface CategoryTreeProps {
  type: ListingType;
  tree: CategoryTreeNode[];
  currentSlug?: string | null;
}

function CategoryLink({
  type,
  slug,
  name,
  isActive,
  level,
}: {
  type: ListingType;
  slug: string;
  name: string;
  isActive: boolean;
  level: number;
}) {
  const href = slug ? `${listingBasePath(type, slug)}` : listingBasePath(type);
  return (
    <Link
      href={href}
      prefetch={false}
      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
        level > 0 ? "pl-6" : ""
      } ${
        isActive
          ? "bg-zinc-100 font-medium text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`}
    >
      {name}
    </Link>
  );
}

/** True if node or any descendant has the given slug (used to expand path to selection). */
function hasSlugInSubtree(node: CategoryTreeNode, slug: string | null | undefined): boolean {
  if (!slug) return false;
  if (node.slug === slug) return true;
  return node.children.some((c) => hasSlugInSubtree(c, slug));
}

function TreeNode({
  type,
  node,
  currentSlug,
  level,
}: {
  type: ListingType;
  node: CategoryTreeNode;
  currentSlug?: string | null;
  level: number;
}) {
  const pathname = usePathname();
  const base = type === "buy" ? "/buy" : "/rent";
  const href = node.slug ? `${base}/${node.slug}` : base;
  const isActive = currentSlug === node.slug || pathname === href;
  const hasChildren = node.children.length > 0;
  const isOnPathToSelection = hasSlugInSubtree(node, currentSlug);
  const [open, setOpen] = useState(isOnPathToSelection);

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex shrink-0 items-center justify-center rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          >
            {open ? (
              <svg className="h-4 w-4" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            ) : (
              <svg className="h-4 w-4" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            )}
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <CategoryLink
            type={type}
            slug={node.slug}
            name={node.name}
            isActive={isActive}
            level={level}
          />
        </div>
      </div>
      {hasChildren && open && (
        <div className="ml-2 border-l border-zinc-200 pl-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              type={type}
              node={child}
              currentSlug={currentSlug}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ type, tree, currentSlug }: CategoryTreeProps) {
  const pathname = usePathname();
  const basePath = listingBasePath(type);
  const isAllActive = !currentSlug && pathname === basePath;

  return (
    <nav aria-label="Categories" className="space-y-0.5">
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-900">
        კატეგორიები
      </h2>
      <div className="space-y-0">
        <div className="border-b border-zinc-100">
          <Link
            href={basePath}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              isAllActive
                ? "bg-zinc-100 font-medium text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            ყველა
          </Link>
        </div>
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            type={type}
            node={node}
            currentSlug={currentSlug}
            level={0}
          />
        ))}
      </div>
    </nav>
  );
}
