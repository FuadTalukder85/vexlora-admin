import React, { Suspense } from "react";
import { ProductTable } from "./components/ProductTable";

export default function AdminProductsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Catalog Moderation & Products</h1>
        <p className="text-xs text-secondary mt-1">
          Global product inventory, merchant listings, stock levels, and safety moderation.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading catalog...</div>}>
        <ProductTable />
      </Suspense>
    </div>
  );
}
