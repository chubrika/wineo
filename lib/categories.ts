import type { ApiCategory } from "@/lib/api";
import type { CategoryTreeNode } from "@/types/category";

/**
 * Build a hierarchical category tree from flat API categories.
 * Roots have parentId === null. Prepared for ElasticSearch/facets later.
 */
export function buildCategoryTree(categories: ApiCategory[]): CategoryTreeNode[] {
  const active = categories.filter((c) => c.active);
  const byId = new Map<string, ApiCategory>(active.map((c) => [c.id, c]));

  function toNode(cat: ApiCategory): CategoryTreeNode {
    const children = active
      .filter((c) => c.parentId === cat.id)
      .map(toNode)
      .sort((a, b) => a.name.localeCompare(b.name));
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
  return roots.map(toNode).sort((a, b) => a.name.localeCompare(b.name));
}
