"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquareWarning,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Star,
  ShieldCheck,
  ShieldX,
  Trash2,
  Package,
  User,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { ReviewFraudLog, ReviewFraudStatus } from "@/types/fraud";
import { toast } from "sonner";

interface ReviewFraudTabProps {
  onRefreshStats?: () => void;
}

export const ReviewFraudTab: React.FC<ReviewFraudTabProps> = ({ onRefreshStats }) => {
  const [logs, setLogs] = useState<ReviewFraudLog[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Modals state
  const [selectedLog, setSelectedLog] = useState<ReviewFraudLog | null>(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  const [statusChangingLog, setStatusChangingLog] = useState<ReviewFraudLog | null>(null);
  const [newStatus, setNewStatus] = useState<ReviewFraudStatus>("CLEAN");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [deletingLog, setDeletingLog] = useState<ReviewFraudLog | null>(null);
  const [isAnalyzingId, setIsAnalyzingId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/review-fraud-logs", {
        params: { limit: 100 },
      });
      const data = res.data?.data || res.data?.reviewLogs || res.data || [];
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch {
      toast.error("Failed to load review fraud logs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleAnalyzeSingle = async (reviewId: string) => {
    try {
      setIsAnalyzingId(reviewId);
      const res = await apiClient.post(`/review-fraud-logs/analyze/${reviewId}`);
      const updated = res.data?.data || res.data;
      setLogs((prev) =>
        prev.map((l) => (l.reviewId === reviewId ? { ...l, ...updated } : l))
      );
      toast.success("AI review fraud verification completed");
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to analyze review");
    } finally {
      setIsAnalyzingId(null);
    }
  };

  const handleBatchAnalyze = async () => {
    try {
      setIsBatchRunning(true);
      const res = await apiClient.post("/review-fraud-logs/batch-analyze");
      const count = res.data?.data?.analyzedCount ?? "all";
      toast.success(`Batch bot & fraud analysis scanned ${count} reviews`);
      await fetchLogs();
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to trigger batch review scan");
    } finally {
      setIsBatchRunning(false);
    }
  };

  const handleOpenStatusModal = (log: ReviewFraudLog) => {
    setStatusChangingLog(log);
    setNewStatus(log.status);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangingLog) return;

    try {
      setIsUpdatingStatus(true);
      const res = await apiClient.patch(`/review-fraud-logs/${statusChangingLog.id}`, {
        status: newStatus,
      });
      const updated = res.data?.data || res.data;
      setLogs((prev) =>
        prev.map((l) => (l.id === statusChangingLog.id ? { ...l, ...updated } : l))
      );
      toast.success(`Review status updated to ${newStatus}`);
      setStatusChangingLog(null);
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to update review fraud status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLog) return;
    try {
      await apiClient.delete(`/review-fraud-logs/${deletingLog.id}`);
      setLogs((prev) => prev.filter((l) => l.id !== deletingLog.id));
      toast.success("Review fraud log deleted");
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to delete review fraud log");
    } finally {
      setDeletingLog(null);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const productTitle = l.product?.title || "";
    const comment = l.review?.comment || "";
    const matchesSearch =
      productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reviewId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reviewerId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      activeStatusFilter === "ALL" || l.status === activeStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ReviewFraudStatus) => {
    switch (status) {
      case "REMOVED":
        return <Badge variant="danger">REMOVED</Badge>;
      case "FLAGGED":
        return <Badge variant="warning">FLAGGED</Badge>;
      case "INVESTIGATING":
        return <Badge variant="neutral">INVESTIGATING</Badge>;
      case "CLEAN":
      default:
        return <Badge variant="success">CLEAN</Badge>;
    }
  };

  const columns: ColumnDef<ReviewFraudLog>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Product & Review Content",
      cell: (l) => (
        <div className="max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="font-bold text-primary text-xs truncate">
              {l.product?.title || "Product Review"}
            </span>
          </div>
          <p className="text-[11px] text-secondary italic mt-1 line-clamp-2">
            &ldquo;{l.review?.comment || "No written text comment provided"}&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
              <Star className="w-3 h-3 fill-amber-400" />
              {l.review?.rating || 5} Stars
            </span>
            {l.hasVerifiedPurchase ? (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                ✓ Verified Purchase
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Unverified Purchase
              </span>
            )}
            {l.sellerRelationshipFlag && (
              <span className="text-[10px] font-bold text-highlight bg-red-50 px-1.5 py-0.5 rounded">
                ⚠️ Seller Self-Review
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Suspicion Score",
      cell: (l) => (
        <div className="flex items-center gap-2">
          <span
            className={
              l.suspicionScore >= 70
                ? "font-extrabold text-highlight text-sm"
                : l.suspicionScore >= 35
                ? "font-extrabold text-amber-600 text-sm"
                : "font-extrabold text-emerald-600 text-sm"
            }
          >
            {l.suspicionScore}/100
          </span>
          <div className="w-14 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div
              className={`h-full rounded-full ${
                l.suspicionScore >= 70
                  ? "bg-highlight"
                  : l.suspicionScore >= 35
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, l.suspicionScore))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (l) => getStatusBadge(l.status),
    },
    {
      header: "Reviewer Details",
      cell: (l) => (
        <div className="text-[11px] text-secondary space-y-0.5">
          <p className="font-semibold text-primary">
            {l.review?.customer?.name || "Customer"}
          </p>
          <p className="font-mono text-[10px]">
            {l.reviewerAccountAgeDays !== null && l.reviewerAccountAgeDays !== undefined
              ? `Account age: ${l.reviewerAccountAgeDays} days`
              : "Active User"}
          </p>
          {l.ipAddress && (
            <p className="font-mono text-[10px] text-secondary">IP: {l.ipAddress}</p>
          )}
        </div>
      ),
    },
    {
      header: "Scanned At",
      cell: (l) => (
        <span className="text-xs text-secondary">{formatDate(l.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (l) => (
        <TableActions>
          <TableActionButton
            onClick={() => {
              setSelectedLog(l);
              setIsInspectOpen(true);
            }}
            title="Inspect Review Audit"
          >
            <Eye className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="emerald"
            disabled={isAnalyzingId === l.reviewId}
            onClick={() => handleAnalyzeSingle(l.reviewId)}
            title="Re-run AI Analysis"
          >
            <Bot
              className={`w-4 h-4 ${
                isAnalyzingId === l.reviewId ? "animate-spin text-emerald-600" : ""
              }`}
            />
          </TableActionButton>
          <TableActionButton
            hoverVariant="primary"
            onClick={() => handleOpenStatusModal(l)}
            title="Change Moderation Status"
          >
            <CheckCircle2 className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="danger"
            onClick={() => setDeletingLog(l)}
            title="Delete Log"
          >
            <Trash2 className="w-4 h-4 text-highlight" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 w-full space-y-4 animate-pulse">
        <div className="h-64 bg-white rounded-2xl border border-border p-6" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={(l) => l.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-5 overflow-x-auto">
              {["ALL", "FLAGGED", "REMOVED", "INVESTIGATING", "CLEAN"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveStatusFilter(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeStatusFilter === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab === "ALL" ? "All Reviews" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search comment, product, reviewer..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchAnalyze}
                isLoading={isBatchRunning}
                className="shrink-0 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan All Reviews
              </Button>
            </div>
          </div>
        }
      />

      {/* Inspect Review Fraud Details Modal */}
      <Modal
        isOpen={isInspectOpen && !!selectedLog}
        onClose={() => {
          setIsInspectOpen(false);
          setSelectedLog(null);
        }}
        title="Review Moderation & Fraud Breakdown"
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Top Product Header */}
            <div className="p-4 rounded-xl bg-muted border border-border flex items-start justify-between">
              <div>
                <h4 className="font-bold text-primary text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-secondary" />
                  {selectedLog.product?.title || "Product"}
                </h4>
                <p className="text-xs text-secondary font-mono mt-0.5">
                  Review ID: {selectedLog.reviewId}
                </p>
                <div className="flex items-center gap-1 text-amber-500 mt-2 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{selectedLog.review?.rating || 5} Stars Rating</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-2xl font-black ${
                    selectedLog.suspicionScore >= 70
                      ? "text-highlight"
                      : selectedLog.suspicionScore >= 35
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedLog.suspicionScore}/100
                </span>
                <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
              </div>
            </div>

            {/* Review Comment Content */}
            <div className="p-4 bg-white rounded-xl border border-border">
              <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Submitted Feedback Text
              </h5>
              <p className="text-xs text-primary bg-muted/60 p-3 rounded-lg leading-relaxed">
                {selectedLog.review?.comment || "No comment text entered by user."}
              </p>
            </div>

            {/* Heuristic Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">
                  Purchase Verification
                </p>
                <p
                  className={`text-sm font-bold mt-1 ${
                    selectedLog.hasVerifiedPurchase ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {selectedLog.hasVerifiedPurchase ? "✓ Verified Buyer" : "⚠️ Unverified Order"}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">
                  Vendor Sybil Check
                </p>
                <p
                  className={`text-sm font-bold mt-1 ${
                    selectedLog.sellerRelationshipFlag
                      ? "text-highlight"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedLog.sellerRelationshipFlag
                    ? "⚠️ Vendor Self-Review"
                    : "✓ No Conflict Found"}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">
                  Account Age at Review
                </p>
                <p className="text-sm font-bold text-primary mt-1">
                  {selectedLog.reviewerAccountAgeDays ?? 0} days old
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsInspectOpen(false);
                  handleAnalyzeSingle(selectedLog.reviewId);
                }}
              >
                <Bot className="w-3.5 h-3.5 mr-1.5" />
                Re-Analyze
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsInspectOpen(false);
                  handleOpenStatusModal(selectedLog);
                }}
              >
                Change Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={!!statusChangingLog}
        onClose={() => setStatusChangingLog(null)}
        title="Update Review Moderation Status"
        maxWidth="sm"
      >
        {statusChangingLog && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Moderation Action
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReviewFraudStatus)}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
              >
                <option value="CLEAN">CLEAN (Approved & Public)</option>
                <option value="INVESTIGATING">INVESTIGATING (Under Review)</option>
                <option value="FLAGGED">FLAGGED (Hidden / Suspicious)</option>
                <option value="REMOVED">REMOVED (Blocked as Bot/Fraud)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusChangingLog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingStatus}>
                Update Status
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingLog}
        onClose={() => setDeletingLog(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Review Fraud Log"
        confirmText="Delete Record"
        variant="danger"
        description={
          deletingLog ? (
            <p>
              Are you sure you want to delete the fraud log for review{" "}
              <span className="font-bold text-primary font-mono">
                {deletingLog.reviewId}
              </span>
              ?
            </p>
          ) : undefined
        }
      />
    </div>
  );
};
