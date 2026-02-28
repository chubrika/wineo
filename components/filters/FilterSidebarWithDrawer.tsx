"use client";

import { useState } from "react";
import { FilterSidebar } from "./FilterSidebar";
import { FilterDrawer } from "./FilterDrawer";
import type { FilterSidebarProps } from "./FilterSidebar";

export function FilterSidebarWithDrawer({
  children,
  ...props
}: FilterSidebarProps & { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr] lg:gap-8">
        {/* Desktop: sticky sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-24">
            <FilterSidebar {...props} />
          </div>
        </aside>

        {/* Main content: mobile filter button + toolbar/grid/pagination */}
        <div className="min-w-0">
          <div className="mb-4 flex justify-end lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
              aria-label="Open filters"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              ფილტრები
            </button>
          </div>
          {children}
        </div>
      </div>

      {/* Mobile: slide drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
      >
        <FilterSidebar
          {...props}
          onClearFilters={() => setDrawerOpen(false)}
        />
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>
      </FilterDrawer>
    </>
  );
}
