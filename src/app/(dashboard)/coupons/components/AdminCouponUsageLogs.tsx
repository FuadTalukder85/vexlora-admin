"use client";

import React from "react";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { formatCurrency } from "@/lib/utils";
import { AdminCouponUsageLog } from "@/types/couponUsageLog";
import { Tag, User, ShoppingBag, Clock, Store, ShieldCheck } from "lucide-react";
import { CouponsSkeleton } from "./CouponsSkeleton";

interface AdminCouponUsageLogsProps {
  logs: AdminCouponUsageLog[];
  isLoading: boolean;
  headerContent?: React.ReactNode;
}

export const AdminCouponUsageLogs: React.FC<AdminCouponUsageLogsProps> = ({
  logs,
  isLoading,
  headerContent,
}) => {
  const columns: ColumnDef<AdminCouponUsageLog>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Voucher Code",
      cell: (log) => (
        <span className="font-mono font-bold text-xs px-2.5 py-1 bg-primary text-white rounded-lg tracking-wider inline-flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          {log.couponCode}
        </span>
      ),
    },
    {
      header: "Scope",
      cell: (log) =>
        log.coupon?.scope === "platform" ? (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" />
            Platform
          </span>
        ) : (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
            <Store className="w-2.5 h-2.5" />
            {log.coupon?.vendor?.storeName || "Vendor"}
          </span>
        ),
    },
    {
      header: "User / Shopper",
      cell: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-primary text-xs">{log.user?.name || "Shopper"}</p>
            <p className="text-[10px] text-secondary">{log.user?.email || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Order Number",
      cell: (log) => (
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-secondary" />
          <span className="font-mono text-xs font-semibold text-primary">
            {log.order?.orderNumber || log.orderId?.slice(0, 10) || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Discount",
      cell: (log) => (
        <span className="font-bold text-emerald-600 text-xs">
          -{formatCurrency(Number(log.discountAmount) || 0)}
        </span>
      ),
    },
    {
      header: "Redeemed At",
      cell: (log) => (
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {new Date(log.usedAt || log.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <CouponsSkeleton />;
  }

  return (
    <PaginateTable
      data={logs}
      columns={columns}
      keyExtractor={(log) => log.id}
      defaultPageSize={20}
      className="flex-1 min-h-0"
      headerContent={headerContent}
      emptyMessage="No coupon redemptions recorded yet."
    />
  );
};
