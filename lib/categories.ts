import type { ApiCategory } from "@/lib/api";
import type { CategoryTreeNode } from "@/types/category";

/**
 * Build a hierarchical category tree from flat API categories.
 * Roots have parentId === null. Prepared for ElasticSearch/facets later.
 */
export function buildCategoryTree(categories: ApiCategory[]): CategoryTreeNode[] {
  const active = categories.filter((c) => c.active);

  const byIndexThenName = (a: ApiCategory, b: ApiCategory) => {
    const ai = Number.isFinite(a.index) ? a.index : 0;
    const bi = Number.isFinite(b.index) ? b.index : 0;
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name);
  };

  function toNode(cat: ApiCategory): CategoryTreeNode {
    const children = active
      .filter((c) => c.parentId === cat.id)
      .sort(byIndexThenName)
      .map(toNode);
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      level: cat.level ?? 0,
      path: cat.path ?? [],
      children,
    };
  }

  const roots = active.filter((c) => !c.parentId);
  // Keep ordering stable with backend sort (index then name).
  const rootsSorted = [...roots].sort(byIndexThenName);
  const rootsNodes = rootsSorted.map(toNode);
  // Children are built from `active` which already comes sorted from API; this keeps UI consistent.
  return rootsNodes;
}
