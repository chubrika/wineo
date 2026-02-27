/**
 * Hierarchical category node for sidebar tree (built from API categories).
 * Prepared for ElasticSearch/facets later.
 */
export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  level: number;
  path: string[];
  children: CategoryTreeNode[];
}
