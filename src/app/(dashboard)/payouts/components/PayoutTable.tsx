"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Zap,
  Clock,
  Plus,
  Building,
  CreditCard,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PayoutRequest, PayoutStatus } from "@/types/payout";
import { PayoutsSkeleton } from "./PayoutsSkeleton";
import { FinanceStatsGrid } from "./FinanceStatsGrid";
import { PayoutDetailsModal } from "./PayoutDetailsModal";
import { CreatePayoutModal } from "./CreatePayoutModal";
import {
  useAdminPayouts,
  useAdminPayoutStats,
  useDisburseStripePayout,
  useStripePlatformBalance,
  useUpdatePayoutStatus,
} from "@/hooks/useAdminPayouts";
import { toast } from "sonner";

export const PayoutTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries
  const {
    data: payoutData,
    isLoading: isLoadingPayouts,
    refetch: refetchPayouts,
    isRefetching,
  } = useAdminPayouts({
    searchTerm,
    status: activeTab,
    page,
    limit: pageSize,
  });

  const { data: stats, isLoading: isLoadingStats } = useAdminPayoutStats();
  const { data: stripeBalance } = useStripePlatformBalance();

  // Mutations
  const updateStatusMutation = useUpdatePayoutStatus();
  const disburseStripeMutation = useDisburseStripePayout();

  const handleUpdateStatus = async (
    payout: PayoutRequest,
    status: PayoutStatus
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: payout.id,
        payload: { status },
      });
      toast.success(
        `Payout #${payout.id.slice(-6)} for ${payout.vendorName} updated to ${status}`
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update payout status"
      );
    }
  };

  const handleDisburseStripe = async (payout: PayoutRequest) => {
    try {
      await disburseStripeMutation.mutateAsync(payout.id);
      toast.success(
        `Automated Stripe Transfer for ${payout.vendorName} executed successfully!`
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Stripe Connect payout transfer failed"
      );
    }
  };

  const payouts = payoutData?.payouts || [];
  const meta = payoutData?.meta;

  const columns: ColumnDef<PayoutRequest>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: "Vendor & Account",
      cell: (p) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-primary">{p.vendorName}</span>
            {p.stripeAccountId ? (
              <span
                title={`Stripe Connect Active (${p.stripeAccountId})`}
                className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <CreditCard className="w-3 h-3 mr-0.5" />
                Stripe
              </span>
            ) : (
              <span
                title="Bank Account Settlement"
                className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-secondary border border-border"
              >
                <Building className="w-3 h-3 mr-0.5" />
                Wire
              </span>
            )}
          </div>
          <p className="text-[11px] text-secondary">
            {p.bankName} &bull; <span className="font-mono">{p.bankAccountNumber}</span>
          </p>
        </div>
      ),
    },
    {
      header: "Sub-Orders",
      cell: (p) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
          <Layers className="w-3.5 h-3.5 text-secondary" />
          {p.subOrdersCount} {p.subOrdersCount === 1 ? "order" : "orders"}
        </span>
      ),
    },
    {
      header: "Net Settlement",
      cell: (p) => (
        <div>
          <span className="font-bold text-emerald-600 text-sm">
            {formatCurrency(p.amount)}
          </span>
          {p.stripeTransferId && (
            <p
              className="text-[10px] font-mono text-secondary truncate max-w-[120px]"
              title={p.stripeTransferId}
            >
              Tx: {p.stripeTransferId}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (p) => {
        if (p.status === "PAID")
          return <Badge variant="success">PAID & SETTLED</Badge>;
        if (p.status === "PROCESSING")
          return <Badge variant="primary">PROCESSING</Badge>;
        if (p.status === "UNPAID")
          return <Badge variant="warning">PENDING APPROVAL</Badge>;
        if (p.status === "FAILED")
          return <Badge variant="danger">REVERTED</Badge>;
        return <Badge variant="neutral">{p.status}</Badge>;
      },
    },
    {
      header: "Requested",
      cell: (p) => (
        <div>
          <span className="text-primary font-medium text-xs">
            {formatDate(p.requestedAt)}
          </span>
          {p.processedAt && (
            <p className="text-[10px] text-secondary">
              Paid: {formatDate(p.processedAt)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (p) => (
        <TableActions>
          {/* Direct Stripe Disburse */}
          {p.status !== "PAID" && p.stripeAccountId && (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleDisburseStripe(p)}
              title={
                (stripeBalance?.available ?? 0) >= p.amount
                  ? "Disburse Funds via Stripe Connect (Instant Transfer)"
                  : `Awaiting Stripe Clearance (Available: ${formatCurrency(stripeBalance?.available ?? 0)} / Needed: ${formatCurrency(p.amount)})`
              }
            >
              <Zap
                className={`w-4 h-4 ${
                  (stripeBalance?.available ?? 0) >= p.amount
                    ? "text-indigo-600"
                    : "text-amber-500"
                }`}
              />
            </TableActionButton>
          )}

          {/* Mark as Paid */}
          {p.status !== "PAID" && (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleUpdateStatus(p, "PAID")}
              title="Confirm Bank Wire (Mark Paid)"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          )}

          {/* Move to Processing */}
          {p.status === "UNPAID" && (
            <TableActionButton
              onClick={() => handleUpdateStatus(p, "PROCESSING")}
              title="Mark as In Processing"
            >
              <Clock className="w-4 h-4 text-amber-600" />
            </TableActionButton>
          )}

          {/* Revert / Mark Failed */}
          {p.status !== "PAID" && p.status !== "FAILED" && (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleUpdateStatus(p, "FAILED")}
              title="Reject / Revert to Unpaid Queue"
            >
              <XCircle className="w-4 h-4 text-highlight" />
            </TableActionButton>
          )}

          {/* Inspect Details */}
          <TableActionButton
            onClick={() => setSelectedPayout(p)}
            title="Inspect Settlement Details"
          >
            <Eye className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoadingPayouts && !payoutData) {
    return <PayoutsSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      {/* Financial Overview Cards */}
      <FinanceStatsGrid stats={stats} isLoading={isLoadingStats} />

      {/* Main Table Container */}
      <PaginateTable
        data={payouts}
        columns={columns}
        keyExtractor={(p) => p.id}
        defaultPageSize={pageSize}
        page={page}
        totalItems={meta?.total}
        totalPages={meta?.totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
              {[
                { key: "ALL", label: "All Payouts" },
                { key: "UNPAID", label: "Pending Approval" },
                { key: "PROCESSING", label: "Processing" },
                { key: "PAID", label: "Settled" },
                { key: "FAILED", label: "Failed / Reverted" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Action Tools: Search, Refresh, Create */}
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search vendor, bank, tx..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchPayouts()}
                disabled={isRefetching}
                title="Refresh Payouts"
                className="px-2.5"
              >
                <RefreshCw
                  className={`w-4 h-4 text-secondary ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>New Payout</span>
              </Button>
            </div>
          </div>
        }
      />

      {/* Details Breakdown Modal */}
      <PayoutDetailsModal
        payout={selectedPayout}
        isOpen={Boolean(selectedPayout)}
        onClose={() => setSelectedPayout(null)}
      />

      {/* Create Manual Payout Modal */}
      <CreatePayoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
