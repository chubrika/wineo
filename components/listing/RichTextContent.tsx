"use client";

/**
 * Renders product/listing description that may be HTML from the rich text editor.
 * Uses prose styling so paragraphs, lists, bold and italic display correctly.
 */
export function RichTextContent({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const trimmed = content?.trim() ?? "";
  if (!trimmed) return null;

  return (
    <div
      className={`prose prose-sm prose-zinc max-w-none text-[14px] text-zinc-600 ${className}`}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}
