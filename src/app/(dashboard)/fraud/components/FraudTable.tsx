"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  UserX,
  Store,
  MessageSquareWarning,
  History,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { UserFraudTab } from "./UserFraudTab";
import { SellerFraudTab } from "./SellerFraudTab";
import { ReviewFraudTab } from "./ReviewFraudTab";
import { FraudAuditLogTab } from "./FraudAuditLogTab";
import { toast } from "sonner";

type FraudTabType = "USERS" | "SELLERS" | "REVIEWS" | "AUDIT";

export const FraudTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FraudTabType>("USERS");
  const [stats, setStats] = useState({
    userProfilesCount: 0,
    highRiskUsersCount: 0,
    sellersCount: 0,
    highRiskSellersCount: 0,
    reviewsCount: 0,
    flaggedReviewsCount: 0,
    auditLogsCount: 0,
    unresolvedAuditsCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSeedingOrCalculatingAll, setIsSeedingOrCalculatingAll] = useState(false);

  const fetchFraudStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const [usersRes, sellersRes, reviewsRes, auditsRes] = await Promise.allSettled([
        apiClient.get("/fraud-profiles", { params: { limit: 100 } }),
        apiClient.get("/seller-fraud-profiles", { params: { limit: 100 } }),
        apiClient.get("/review-fraud-logs", { params: { limit: 100 } }),
        apiClient.get("/fraud-audit-logs", { params: { limit: 100 } }),
      ]);

      const userProfiles =
        usersRes.status === "fulfilled"
          ? usersRes.value.data?.data || usersRes.value.data || []
          : [];
      const sellers =
        sellersRes.status === "fulfilled"
          ? sellersRes.value.data?.data || sellersRes.value.data || []
          : [];
      const reviews =
        reviewsRes.status === "fulfilled"
          ? reviewsRes.value.data?.data || reviewsRes.value.data || []
          : [];
      const audits =
        auditsRes.status === "fulfilled"
          ? auditsRes.value.data?.data || auditsRes.value.data || []
          : [];

      const highRiskUsers = userProfiles.filter(
        (u: { riskLevel?: string }) =>
          u.riskLevel === "CRITICAL" || u.riskLevel === "HIGH"
      ).length;

      const highRiskSellers = sellers.filter(
        (s: { riskLevel?: string }) =>
          s.riskLevel === "CRITICAL" || s.riskLevel === "HIGH"
      ).length;

      const flaggedReviews = reviews.filter(
        (r: { status?: string }) =>
          r.status === "FLAGGED" || r.status === "REMOVED"
      ).length;

      const unresolvedAudits = audits.filter(
        (a: { action?: string }) =>
          a.action &&
          a.action.toLowerCase() !== "resolved" &&
          a.action.toLowerCase() !== "cleared"
      ).length;

      setStats({
        userProfilesCount: userProfiles.length,
        highRiskUsersCount: highRiskUsers,
        sellersCount: sellers.length,
        highRiskSellersCount: highRiskSellers,
        reviewsCount: reviews.length,
        flaggedReviewsCount: flaggedReviews,
        auditLogsCount: audits.length,
        unresolvedAuditsCount: unresolvedAudits,
      });
    } catch {
      // ignore
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchFraudStats();
  }, [fetchFraudStats]);

  const handleRunComprehensiveScan = async () => {
    try {
      setIsSeedingOrCalculatingAll(true);
      toast.info("Triggering comprehensive heuristic recalculation across system...");
      await Promise.allSettled([
        apiClient.post("/fraud-profiles/batch-recalculate"),
        apiClient.post("/seller-fraud-profiles/batch-recalculate"),
        apiClient.post("/review-fraud-logs/batch-analyze"),
      ]);
      toast.success("Comprehensive security & fraud scan completed");
      await fetchFraudStats();
    } catch {
      toast.error("Failed to run complete scan");
    } finally {
      setIsSeedingOrCalculatingAll(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <StatCard
          title="User Risk Profiles"
          value={stats.userProfilesCount}
          change={`${stats.highRiskUsersCount} High Risk`}
          isPositive={stats.highRiskUsersCount === 0}
          icon={UserX}
          iconColorClass={
            stats.highRiskUsersCount > 0
              ? "bg-rose-50 text-highlight"
              : "bg-emerald-50 text-emerald-600"
          }
        />

        <StatCard
          title="Seller Fraud Monitor"
          value={stats.sellersCount}
          change={`${stats.highRiskSellersCount} Flagged`}
          isPositive={stats.highRiskSellersCount === 0}
          icon={Store}
          iconColorClass={
            stats.highRiskSellersCount > 0
              ? "bg-amber-50 text-amber-600"
              : "bg-blue-50 text-blue-600"
          }
        />

        <StatCard
          title="Bot & Fake Reviews"
          value={stats.reviewsCount}
          change={`${stats.flaggedReviewsCount} Moderated`}
          isPositive={stats.flaggedReviewsCount === 0}
          icon={MessageSquareWarning}
          iconColorClass={
            stats.flaggedReviewsCount > 0
              ? "bg-purple-50 text-purple-600"
              : "bg-slate-100 text-slate-700"
          }
        />

        <StatCard
          title="Security Audit Incidents"
          value={stats.auditLogsCount}
          change={`${stats.unresolvedAuditsCount} Active`}
          isPositive={stats.unresolvedAuditsCount === 0}
          icon={History}
          iconColorClass="bg-primary/10 text-primary"
        />
      </div>

      {/* Navigation Header Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-muted/70 rounded-xl">
          <button
            onClick={() => setActiveTab("USERS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "USERS"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary hover:text-primary"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-highlight" />
            Customer Risk Profiles
            {stats.highRiskUsersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-highlight text-white">
                {stats.highRiskUsersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("SELLERS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "SELLERS"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Store className="w-4 h-4 text-amber-600" />
            Vendor Risk Profiles
            {stats.highRiskSellersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                {stats.highRiskSellersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("REVIEWS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "REVIEWS"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary hover:text-primary"
            }`}
          >
            <MessageSquareWarning className="w-4 h-4 text-purple-600" />
            Review Fraud & Bot Shield
            {stats.flaggedReviewsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white">
                {stats.flaggedReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "AUDIT"
                ? "bg-white text-primary shadow-xs"
                : "text-secondary hover:text-primary"
            }`}
          >
            <History className="w-4 h-4 text-primary" />
            Security Audit Trail
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-secondary">
              {stats.auditLogsCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunComprehensiveScan}
            isLoading={isSeedingOrCalculatingAll}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Full System Risk Scan
          </Button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === "USERS" && <UserFraudTab onRefreshStats={fetchFraudStats} />}
        {activeTab === "SELLERS" && <SellerFraudTab onRefreshStats={fetchFraudStats} />}
        {activeTab === "REVIEWS" && <ReviewFraudTab onRefreshStats={fetchFraudStats} />}
        {activeTab === "AUDIT" && <FraudAuditLogTab onRefreshStats={fetchFraudStats} />}
      </div>
    </div>
  );
};
