"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Trash2,
  Edit2,
  FileCode2,
  Lock,
  User,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { FraudAuditLog } from "@/types/fraud";
import { toast } from "sonner";

interface FraudAuditLogTabProps {
  onRefreshStats?: () => void;
}

export const FraudAuditLogTab: React.FC<FraudAuditLogTabProps> = ({ onRefreshStats }) => {
  const [logs, setLogs] = useState<FraudAuditLog[]>([]);
  const [activeActionFilter, setActiveActionFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Snapshot modal
  const [selectedSnapshotLog, setSelectedSnapshotLog] = useState<FraudAuditLog | null>(null);

  // Create Audit Log Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [triggerType, setTriggerType] = useState("manual_flag");
  const [reasonSummary, setReasonSummary] = useState("");
  const [scoreAtEvent, setScoreAtEvent] = useState<number>(50);
  const [action, setAction] = useState("manual_review");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Available users for dropdown
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string | null; email: string }>>([]);

  // Edit Action Modal
  const [editingLog, setEditingLog] = useState<FraudAuditLog | null>(null);
  const [editReasonSummary, setEditReasonSummary] = useState("");
  const [editAction, setEditAction] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete modal
  const [deletingLog, setDeletingLog] = useState<FraudAuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/fraud-audit-logs", {
        params: { limit: 100 },
      });
      const data = res.data?.data || res.data?.auditLogs || res.data || [];
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch {
      toast.error("Failed to load security audit logs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsersForDropdown = useCallback(async () => {
    try {
      const res = await apiClient.get("/users", { params: { limit: 50 } });
      const data = res.data?.data || res.data?.users || res.data || [];
      if (Array.isArray(data)) {
        setAvailableUsers(data);
        if (data.length > 0 && !targetUserId) {
          setTargetUserId(data[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchLogs();
    fetchUsersForDropdown();
  }, [fetchLogs, fetchUsersForDropdown]);

  const handleCreateAuditLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !reasonSummary) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmittingCreate(true);
      const res = await apiClient.post("/fraud-audit-logs", {
        targetUserId,
        triggerType,
        reasonSummary,
        scoreAtEvent: Number(scoreAtEvent),
        action,
        metricsSnapshot: {
          timestamp: new Date().toISOString(),
          actor: "ADMIN_PORTAL",
          securityAssessment: `Manual audit logging event trigger: ${triggerType}`,
        },
      });

      const newEntry = res.data?.data || res.data;
      setLogs((prev) => [newEntry, ...prev]);
      toast.success("Security audit event recorded successfully");
      setIsCreateOpen(false);
      setReasonSummary("");
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to create audit log entry");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleOpenEdit = (log: FraudAuditLog) => {
    setEditingLog(log);
    setEditReasonSummary(log.reasonSummary);
    setEditAction(log.action);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    try {
      setIsSavingEdit(true);
      const res = await apiClient.patch(`/fraud-audit-logs/${editingLog.id}`, {
        reasonSummary: editReasonSummary,
        action: editAction,
      });

      const updated = res.data?.data || res.data;
      setLogs((prev) =>
        prev.map((l) => (l.id === editingLog.id ? { ...l, ...updated } : l))
      );
      toast.success("Audit incident updated");
      setEditingLog(null);
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to update audit log");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLog) return;
    try {
      await apiClient.delete(`/fraud-audit-logs/${deletingLog.id}`);
      setLogs((prev) => prev.filter((l) => l.id !== deletingLog.id));
      toast.success("Audit log record deleted");
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to delete audit log");
    } finally {
      setDeletingLog(null);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const userName = l.targetUser?.name || "";
    const userEmail = l.targetUser?.email || "";
    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reasonSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.triggerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      activeActionFilter === "ALL" ||
      l.action.toLowerCase() === activeActionFilter.toLowerCase();

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (act: string) => {
    const lower = act.toLowerCase();
    if (lower.includes("suspend") || lower.includes("block")) {
      return <Badge variant="danger">{act.toUpperCase()}</Badge>;
    }
    if (lower.includes("hold") || lower.includes("review") || lower.includes("flag")) {
      return <Badge variant="warning">{act.toUpperCase()}</Badge>;
    }
    if (lower.includes("resolved") || lower.includes("cleared")) {
      return <Badge variant="success">{act.toUpperCase()}</Badge>;
    }
    return <Badge variant="neutral">{act.toUpperCase()}</Badge>;
  };

  const columns: ColumnDef<FraudAuditLog>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Target Entity / User",
      cell: (l) => (
        <div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-secondary" />
            <span className="font-bold text-primary text-xs">
              {l.targetUser?.name || "System User"}
            </span>
          </div>
          <p className="text-[11px] text-secondary font-mono mt-0.5">
            {l.targetUser?.email || l.targetUserId}
          </p>
        </div>
      ),
    },
    {
      header: "Trigger Type",
      cell: (l) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-primary border border-border">
          {l.triggerType.replace(/_/g, " ").toUpperCase()}
        </span>
      ),
    },
    {
      header: "Reason & Assessment",
      cell: (l) => (
        <p className="text-xs text-primary max-w-sm leading-snug">{l.reasonSummary}</p>
      ),
    },
    {
      header: "Score at Event",
      cell: (l) => (
        <span
          className={
            l.scoreAtEvent >= 75
              ? "font-extrabold text-highlight text-xs"
              : l.scoreAtEvent >= 40
                ? "font-extrabold text-amber-600 text-xs"
                : "font-extrabold text-emerald-600 text-xs"
          }
        >
          {l.scoreAtEvent}/100
        </span>
      ),
    },
    {
      header: "Action Taken",
      cell: (l) => getActionBadge(l.action),
    },
    {
      header: "Logged At",
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
            onClick={() => setSelectedSnapshotLog(l)}
            title="View Frozen Snapshot"
          >
            <FileCode2 className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="primary"
            onClick={() => handleOpenEdit(l)}
            title="Update Status / Notes"
          >
            <Edit2 className="w-4 h-4" />
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
            {/* Action Filter Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-5 overflow-x-auto">
              {[
                { label: "All Audit Trail", val: "ALL" },
                { label: "Flagged", val: "flagged" },
                { label: "Order Hold", val: "order_hold" },
                { label: "Manual Review", val: "manual_review" },
                { label: "Auto Suspend", val: "auto_suspend" },
                { label: "Resolved", val: "resolved" },
              ].map((tab) => (
                <button
                  key={tab.val}
                  onClick={() => setActiveActionFilter(tab.val)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${activeActionFilter === tab.val
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & New Entry */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user, trigger, reason..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Security Incident
              </Button>
            </div>
          </div>
        }
      />

      {/* Snapshot Inspector Modal */}
      <Modal
        isOpen={!!selectedSnapshotLog}
        onClose={() => setSelectedSnapshotLog(null)}
        title="Frozen Metrics & Heuristics Snapshot"
        maxWidth="lg"
      >
        {selectedSnapshotLog && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl border border-border flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-primary">
                  {selectedSnapshotLog.targetUser?.name || "System User"}
                </p>
                <p className="text-[11px] text-secondary font-mono">
                  {selectedSnapshotLog.targetUser?.email || selectedSnapshotLog.targetUserId}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-highlight">
                  Score: {selectedSnapshotLog.scoreAtEvent}/100
                </span>
                <div className="mt-1">{getActionBadge(selectedSnapshotLog.action)}</div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Metrics JSON Payload
              </h5>
              <div className="p-4 bg-slate-900 rounded-xl text-slate-100 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
                <pre>
                  {JSON.stringify(
                    selectedSnapshotLog.metricsSnapshot || {},
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSnapshotLog(null)}
              >
                Close Snapshot
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Manual Security Audit Entry Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log Security & Fraud Audit Incident"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAuditLog} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Target User / Subject
            </label>
            {availableUsers.length > 0 ? (
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                required
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Enter target user ID..."
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Trigger Category
              </label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
              >
                <option value="multi_account">Multi-Account Detection</option>
                <option value="coupon_abuse">Coupon Promo Abuse</option>
                <option value="seller_risk">Seller Non-Compliance</option>
                <option value="fake_review">Fake / Bot Review</option>
                <option value="payment_abuse">Payment / Chargeback Risk</option>
                <option value="account_takeover">Account Takeover / IP</option>
                <option value="manual_flag">Manual Admin Escalation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Enforcement Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
              >
                <option value="flagged">Flag Account</option>
                <option value="order_hold">Place Orders on Hold</option>
                <option value="manual_review">Flag for Manual Review</option>
                <option value="auto_suspend">Suspend User / Vendor</option>
                <option value="resolved">Mark as Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Risk Score at Event (0 - 100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={scoreAtEvent}
              onChange={(e) => setScoreAtEvent(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Reason & Assessment Summary
            </label>
            <textarea
              rows={3}
              value={reasonSummary}
              onChange={(e) => setReasonSummary(e.target.value)}
              placeholder="Detail reasons for audit flag (e.g. repeated checkout failures from proxy, suspicious refund claims)..."
              className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingCreate}
            >
              Record Incident
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Action / Reason Modal */}
      <Modal
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        title="Update Security Audit Log"
        maxWidth="md"
      >
        {editingLog && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Action Status
              </label>
              <select
                value={editAction}
                onChange={(e) => setEditAction(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
              >
                <option value="flagged">flagged</option>
                <option value="order_hold">order_hold</option>
                <option value="manual_review">manual_review</option>
                <option value="auto_suspend">auto_suspend</option>
                <option value="resolved">resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Reason & Findings Notes
              </label>
              <textarea
                rows={3}
                value={editReasonSummary}
                onChange={(e) => setEditReasonSummary(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingLog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingEdit}>
                Save Changes
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
        title="Delete Audit Log Entry"
        confirmText="Delete Record"
        variant="danger"
        description={
          deletingLog ? (
            <p>
              Are you sure you want to delete this security audit record for{" "}
              <span className="font-bold text-primary">
                {deletingLog.targetUser?.name || deletingLog.targetUserId}
              </span>
              ?
            </p>
          ) : undefined
        }
      />
    </div>
  );
};
