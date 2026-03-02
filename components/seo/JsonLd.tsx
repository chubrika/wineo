/**
 * Injects JSON-LD structured data into the page for SEO.
 * Use in server components; pass the object returned from buildProductListJsonLd,
 * listingToProductJsonLd, newsToArticleJsonLd, etc.
 */
export function JsonLd<T extends object>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
