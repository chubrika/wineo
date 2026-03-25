"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type FancySelectOption = { value: string; label: string; disabled?: boolean };

export function FancySelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  loading,
  hasError,
  buttonClassName,
}: {
  id: string;
  value: string;
  onValueChange: (next: string) => void;
  options: FancySelectOption[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  hasError?: boolean;
  buttonClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = value ? options.find((o) => o.value === value) ?? null : null;

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  const enabledOptions = useMemo(() => options.filter((o) => !o.disabled), [options]);
  const selectedEnabledIndex = useMemo(
    () => enabledOptions.findIndex((o) => o.value === value),
    [enabledOptions, value]
  );

  const openMenu = () => {
    if (disabled || loading) return;
    setOpen(true);
    setActiveIndex(selectedEnabledIndex >= 0 ? selectedEnabledIndex : 0);
  };

  const move = (dir: 1 | -1) => {
    if (enabledOptions.length === 0) return;
    setActiveIndex((prev) => {
      const start = prev < 0 ? 0 : prev;
      const next = (start + dir + enabledOptions.length) % enabledOptions.length;
      return next;
    });
  };

  const commitActive = () => {
    const opt = enabledOptions[activeIndex];
    if (!opt) return;
    onValueChange(opt.value);
    close();
  };

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (disabled || loading) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) openMenu();
            else move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) openMenu();
            else move(-1);
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!open) openMenu();
            else commitActive();
          }
        }}
        className={`${buttonClassName} flex w-full items-center justify-between text-left cursor-pointer disabled:cursor-not-allowed disabled:bg-zinc-100`}
      >
        <span className={selected ? "text-zinc-900 text-sm" : "text-zinc-500 text-sm"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="ml-2 flex items-center gap-2">
          {loading ? (
            <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            </span>
          ) : null}
          <svg
            className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={id}
          className={`absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border bg-white py-1 shadow-lg ${
            hasError ? "border-red-300" : "border-zinc-200"
          }`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-3 text-sm text-zinc-500">არ მოიძებნა</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              const enabledIndex = enabledOptions.findIndex((o) => o.value === opt.value);
              const isActive = enabledIndex >= 0 && enabledIndex === activeIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onMouseEnter={() => {
                    if (opt.disabled) return;
                    if (enabledIndex >= 0) setActiveIndex(enabledIndex);
                  }}
                  onClick={() => {
                    if (opt.disabled) return;
                    onValueChange(opt.value);
                    close();
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                    opt.disabled ? "cursor-not-allowed text-zinc-400" : "cursor-pointer text-zinc-700"
                  } ${isActive && !opt.disabled ? "bg-zinc-100" : ""} ${isSelected ? "font-medium text-zinc-900" : ""}`}
                >
                  <span>{opt.label}</span>
                  {isSelected ? (
                    <svg
                      className="h-4 w-4 text-[var(--nav-link-active)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

