"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type FiltersModalContextValue = {
  isOpen: boolean;
  openFiltersModal: () => void;
  closeFiltersModal: () => void;
};

const FiltersModalContext = createContext<FiltersModalContextValue | null>(null);

export function FiltersModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openFiltersModal = useCallback(() => setIsOpen(true), []);
  const closeFiltersModal = useCallback(() => setIsOpen(false), []);
  return (
    <FiltersModalContext.Provider value={{ isOpen, openFiltersModal, closeFiltersModal }}>
      {children}
    </FiltersModalContext.Provider>
  );
}

export function useFiltersModal() {
  const ctx = useContext(FiltersModalContext);
  if (!ctx) return { isOpen: false, openFiltersModal: () => {}, closeFiltersModal: () => {} };
  return ctx;
}
