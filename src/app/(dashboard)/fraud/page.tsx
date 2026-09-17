import React, { Suspense } from "react";
import { FraudTable } from "./components/FraudTable";

export default function AdminFraudPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Fraud Detection & Security Audit</h1>
        <p className="text-xs text-secondary mt-1">
          Automated heuristic risk profiles, suspicious orders, and merchant fraud monitoring.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading fraud logs...</div>}>
        <FraudTable />
      </Suspense>
    </div>
  );
}
