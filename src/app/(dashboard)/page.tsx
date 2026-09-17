"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Store,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useAdminStore } from "@/stores/useAdminStore";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { RecentOrdersTable } from "./components/RecentOrdersTable";

export default function AdminDashboardPage() {
  const { isInitialChecking, isLoading } = useAdminStore();

  if (isInitialChecking || isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">Marketplace Command Center</h1>
          <p className="text-xs text-secondary mt-1">
            Real-time analytics, vendor payouts, catalog taxonomy, and platform GMV.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/categories">
            <Button variant="outline" size="sm">
              Manage Categories
            </Button>
          </Link>
          <Link href="/vendors">
            <Button variant="primary" size="sm">
              <Store className="w-4 h-4" />
              Vendor Approvals
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Platform GMV"
          value={formatCurrency(148290.45)}
          change="18.2%"
          isPositive={true}
          icon={DollarSign}
          iconColorClass="bg-emerald-50 text-emerald-600 border border-emerald-200"
        />
        <StatCard
          title="Net Commission Revenue"
          value={formatCurrency(14829.05)}
          change="14.8%"
          isPositive={true}
          icon={TrendingUp}
          iconColorClass="bg-primary/10 text-primary border border-primary/20"
        />
        <StatCard
          title="Active Sellers & Stores"
          value="142"
          change="8.4%"
          isPositive={true}
          icon={Store}
          iconColorClass="bg-indigo-50 text-indigo-600 border border-indigo-200"
        />
        <StatCard
          title="Total Marketplace Orders"
          value="1,289"
          change="24.5%"
          isPositive={true}
          icon={ShoppingCart}
          iconColorClass="bg-rose-50 text-rose-600 border border-rose-200"
        />
      </div>

      {/* 3. Platform Health & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary via-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-md space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Platform Escrow Guard
            </div>
            <h3 className="text-2xl font-black tracking-tight">{formatCurrency(32490.15)}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Total funds currently held in platform escrow pending customer delivery confirmations.
            </p>
          </div>
          <Link href="/payouts">
            <Button variant="highlight" size="sm" className="w-full">
              Review Payout Transfers
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-primary">Pending Administrative Actions</h3>
              <p className="text-xs text-secondary">Items requiring admin review and approval</p>
            </div>
            <Badge variant="warning">Action Required</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-secondary uppercase">Vendor Applications</span>
              <p className="text-xl font-bold text-primary">6 Pending</p>
              <Link href="/vendors" className="text-xs font-semibold text-highlight hover:underline block pt-1">
                Review Stores &rarr;
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-secondary uppercase">Payout Requests</span>
              <p className="text-xl font-bold text-emerald-600">4 Ready</p>
              <Link href="/payouts" className="text-xs font-semibold text-highlight hover:underline block pt-1">
                Authorize Transfers &rarr;
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-secondary uppercase">Fraud Risk Alerts</span>
              <p className="text-xl font-bold text-rose-600">1 Flagged</p>
              <Link href="/fraud" className="text-xs font-semibold text-highlight hover:underline block pt-1">
                Inspect Audit Log &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Platform Orders Table */}
      <RecentOrdersTable />
    </div>
  );
}
