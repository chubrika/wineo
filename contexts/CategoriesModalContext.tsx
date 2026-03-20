"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type CategoriesModalContextValue = {
  open: boolean;
  /** Optional slug to pre-select a root category when the modal opens. */
  initialRootSlug: string | null;
  openCategoriesModal: (opts?: { initialRootSlug?: string | null }) => void;
  closeCategoriesModal: () => void;
};

const CategoriesModalContext = createContext<CategoriesModalContextValue | null>(null);

export function CategoriesModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialRootSlug, setInitialRootSlug] = useState<string | null>(null);

  const openCategoriesModal = useCallback((opts?: { initialRootSlug?: string | null }) => {
    setInitialRootSlug(opts?.initialRootSlug ?? null);
    setOpen(true);
  }, []);

  const closeCategoriesModal = useCallback(() => {
    setOpen(false);
    setInitialRootSlug(null);
  }, []);

  const value = useMemo(
    () => ({ open, initialRootSlug, openCategoriesModal, closeCategoriesModal }),
    [open, initialRootSlug, openCategoriesModal, closeCategoriesModal]
  );

  return <CategoriesModalContext.Provider value={value}>{children}</CategoriesModalContext.Provider>;
}

export function useCategoriesModal() {
  const ctx = useContext(CategoriesModalContext);
  if (!ctx) throw new Error("useCategoriesModal must be used within CategoriesModalProvider");
  return ctx;
}

