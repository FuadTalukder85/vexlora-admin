import React, { Suspense } from "react";
import { CouponTable } from "./components/CouponTable";

export default function AdminCouponsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Coupons & Campaigns</h1>
        <p className="text-xs text-secondary mt-1">
          Create platform-wide discount vouchers and track coupon redemption metrics.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading coupons...</div>}>
        <CouponTable />
      </Suspense>
    </div>
  );
}
