"use client";

import { AccountNavContent } from "./AccountNavContent";

export function AccountSidebar() {
  return (
    <aside
      className="hidden w-full shrink-0 lg:block lg:w-56"
      aria-label="Account navigation"
    >
      <AccountNavContent />
    </aside>
  );
}
