import React, { Suspense } from "react";
import { CategoryTable } from "./components/CategoryTable";

export default function CategoriesPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Category Taxonomy</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-highlight/10 text-highlight border border-highlight/20">
            Admin Only
          </span>
        </div>
        <p className="text-xs text-secondary mt-1">
          Configure global marketplace categories, commission tiers, and sub-category hierarchies.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading categories...</div>}>
        <CategoryTable />
      </Suspense>
    </div>
  );
}
