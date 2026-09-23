"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminPayoutStatistics } from "@/types/payout";
import { useStripePlatformBalance } from "@/hooks/useAdminPayouts";
import { CreditCard, ExternalLink } from "lucide-react";

interface FinanceStatsGridProps {
  stats?: AdminPayoutStatistics;
  isLoading?: boolean;
}

export const FinanceStatsGrid: React.FC<FinanceStatsGridProps> = ({
  stats,
  isLoading = false,
}) => {
  const { data: stripeBalance, isLoading: isLoadingStripe } = useStripePlatformBalance();

  const defaultStats: AdminPayoutStatistics = {
    totalPlatformVolume: 0,
    totalCommissionEarned: 0,
    totalVendorEarnings: 0,
    totalPaidOut: 0,
    pendingPayoutsAmount: 0,
    pendingPayoutsCount: 0,
    paidPayoutsCount: 0,
    failedPayoutsCount: 0,
  };

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Platform Gross Volume */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
            Gross Marketplace Volume
          </span>
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-primary tracking-tight">
            {isLoading ? "---" : formatCurrency(data.totalPlatformVolume)}
          </h3>
          <p className="text-[11px] text-secondary mt-1">
            Total delivered goods volume (GMV)
          </p>
        </div>
      </div>

      {/* Retained Commission Revenue */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Retained Commission
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-indigo-700 tracking-tight">
            {isLoading ? "---" : formatCurrency(data.totalCommissionEarned)}
          </h3>
          <p className="text-[11px] text-secondary mt-1">
            Platform net take revenue
          </p>
        </div>
      </div>

      {/* Pending Escrow Queue */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Pending Escrow Clearance
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-amber-600 tracking-tight">
              {isLoading ? "---" : formatCurrency(data.pendingPayoutsAmount)}
            </h3>
            {!isLoading && data.pendingPayoutsCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                {data.pendingPayoutsCount} pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-secondary mt-1">
            Awaiting transfer / bank wire execution
          </p>
        </div>
      </div>

      {/* Cleared Disbursements */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Settled Disbursements
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
              {isLoading ? "---" : formatCurrency(data.totalPaidOut)}
            </h3>
            {!isLoading && data.paidPayoutsCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {data.paidPayoutsCount} paid
              </span>
            )}
          </div>
          <p className="text-[11px] text-secondary mt-1">
            Paid out to vendor bank / Stripe
          </p>
        </div>
      </div>

      {/* Stripe Platform Live Balance Bar */}
      <div className="sm:col-span-2 lg:col-span-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-primary text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-xs border border-white/10">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                Stripe Account Live Balance
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Connected
              </span>
            </div>
            <p className="text-[11px] text-secondary/60 mt-0.5">
              Available funds in your master Stripe account ready for instant vendor disbursements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-end sm:self-auto">
          <div>
            <span className="text-[10px] font-bold text-secondary/60 uppercase block">
              Available in Stripe
            </span>
            <span className="text-lg font-black text-emerald-400">
              {isLoadingStripe
                ? "Loading..."
                : formatCurrency(stripeBalance?.available ?? 0)}
            </span>
          </div>

          <div className="border-l border-white/10 pl-6">
            <span className="text-[10px] font-bold text-secondary/60 uppercase block">
              Pending in Stripe
            </span>
            <span className="text-lg font-black text-amber-300">
              {isLoadingStripe
                ? "Loading..."
                : formatCurrency(stripeBalance?.pending ?? 0)}
            </span>
          </div>

          <a
            href="https://dashboard.stripe.com/balance"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-xs font-bold text-highlight hover:underline ml-2"
          >
            <span>Stripe Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
