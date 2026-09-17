import React, { Suspense } from "react";
import { OrderTable } from "./components/OrderTable";

export default function AdminOrdersPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Platform Orders & Logistics</h1>
        <p className="text-xs text-secondary mt-1">
          Monitor marketplace transactions, customer receipts, and merchant sub-order fulfillments.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading orders...</div>}>
        <OrderTable />
      </Suspense>
    </div>
  );
}
