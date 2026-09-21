import React, { Suspense } from "react";
import { DealsTable } from "./components/DealsTable";
import { DealsSkeleton } from "./components/DealsSkeleton";

export default function AdminDealsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Campaigns & Flash Deals</h1>
        <p className="text-xs text-secondary mt-1">
          Review vendor promotional submissions, manage live flash deals, and sponsor platform sales.
        </p>
      </div>

      <Suspense fallback={<DealsSkeleton />}>
        <DealsTable />
      </Suspense>
    </div>
  );
}
