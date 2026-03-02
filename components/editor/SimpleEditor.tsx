"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useCallback, useEffect } from "react";

/** Returns true if HTML is effectively empty (no text content). */
function isEditorContentEmpty(html: string): boolean {
  if (!html || html.trim() === "") return true;
  const stripped = html.replace(/<[^>]+>/g, "").trim();
  return stripped === "";
}

export interface SimpleEditorProps {
  /** Current value as HTML string. */
  value: string;
  /** Called when content changes. Receives HTML string. */
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  /** Optional class for the outer wrapper (e.g. to match form input styling). */
  className?: string;
  /** Minimum height of the content area (e.g. "8rem"). */
  minHeight?: string;
  /** Optional: when true, editor is re-mounted when this changes (e.g. form mode switch). */
  editorKey?: string;
}

const toolbarBtnClass =
  "inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-[var(--nav-link-active)] disabled:opacity-50 disabled:cursor-not-allowed";

export function SimpleEditor({
  value,
  onChange,
  placeholder = "აღწერა…",
  id,
  disabled = false,
  className = "",
  minHeight = "8rem",
}: SimpleEditorProps) {
  const handleUpdate = useCallback(
    (html: string) => {
      const out = isEditorContentEmpty(html) ? "" : html;
      onChange(out);
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        "data-placeholder": placeholder,
        class:
          "prose prose-sm max-w-none min-w-0 w-full px-3 py-2 focus:outline-none",
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      handleUpdate(editor.getHTML());
    },
  });

  // Sync external value into editor when it changes (e.g. edit mode initial load).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    const norm = (h: string) => (isEditorContentEmpty(h) ? "" : h);
    if (norm(current) !== norm(next)) {
      editor.commands.setContent(next || "<p></p>", false);
    }
  }, [editor, value]);

  // Update editable when disabled changes.
  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div
        className={`rounded-lg border border-zinc-300 bg-zinc-50 ${className}`}
        style={{ minHeight }}
      >
        <div className="flex items-center gap-1 border-b border-zinc-200 p-1">
          <span className="h-8 w-8 rounded border border-zinc-200 bg-zinc-100" />
          <span className="h-8 w-8 rounded border border-zinc-200 bg-zinc-100" />
          <span className="h-8 w-8 rounded border border-zinc-200 bg-zinc-100" />
          <span className="h-8 w-8 rounded border border-zinc-200 bg-zinc-100" />
        </div>
        <div className="px-3 py-2 text-zinc-500 text-sm">{placeholder}</div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`simple-editor rounded-lg border border-zinc-300 bg-white overflow-hidden ${className}`}
      aria-label={placeholder}
      style={{ "--editor-min-height": minHeight } as React.CSSProperties}
    >
      <div className="flex items-center gap-0.5 border-b border-zinc-200 p-1 bg-zinc-50/80">
        <button
          type="button"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={`${toolbarBtnClass} ${editor.isActive("bold") ? "bg-zinc-200 border-zinc-400" : ""}`}
        >
          <span className="font-bold text-sm">B</span>
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={`${toolbarBtnClass} ${editor.isActive("italic") ? "bg-zinc-200 border-zinc-400" : ""}`}
        >
          <span className="italic text-sm">I</span>
        </button>
        <span className="w-px h-5 bg-zinc-300 mx-0.5" aria-hidden />
        <button
          type="button"
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`${toolbarBtnClass} ${editor.isActive("bulletList") ? "bg-zinc-200 border-zinc-400" : ""}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`${toolbarBtnClass} ${editor.isActive("orderedList") ? "bg-zinc-200 border-zinc-400" : ""}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
            />
          </svg>
        </button>
      </div>
      <EditorContent editor={editor} />
      <style jsx global>{`
        .simple-editor .ProseMirror {
          min-height: var(--editor-min-height, 8rem);
        }
        .simple-editor [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #a1a1aa;
        }
        .simple-editor .ProseMirror p {
          margin: 0 0 0.5em 0;
        }
        .simple-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .simple-editor .ProseMirror ul,
        .simple-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5em 0;
        }
        .simple-editor .ProseMirror li {
          margin: 0.25em 0;
        }
      `}</style>
    </div>
  );
}
