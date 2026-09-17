import React, { Suspense } from "react";
import { VendorTable } from "./components/VendorTable";

export default function VendorsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Vendor & Store Directory</h1>
        <p className="text-xs text-secondary mt-1">
          Review vendor onboarding applications, approve merchants, and configure custom commission rates.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading vendors...</div>}>
        <VendorTable />
      </Suspense>
    </div>
  );
}
