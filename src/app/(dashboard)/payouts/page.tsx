import React, { Suspense } from "react";
import { PayoutTable } from "./components/PayoutTable";

export default function AdminPayoutsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Vendor Payouts & Escrow Clearance</h1>
        <p className="text-xs text-secondary mt-1">
          Authorize merchant withdrawals, manage bank transfer queues, and reconcile platform commission balances.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading payouts...</div>}>
        <PayoutTable />
      </Suspense>
    </div>
  );
}
