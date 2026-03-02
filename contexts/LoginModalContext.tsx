"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type LoginModalContextValue = {
  isOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openLoginModal = useCallback(() => setIsOpen(true), []);
  const closeLoginModal = useCallback(() => setIsOpen(false), []);
  return (
    <LoginModalContext.Provider value={{ isOpen, openLoginModal, closeLoginModal }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) return { isOpen: false, openLoginModal: () => {}, closeLoginModal: () => {} };
  return ctx;
}
