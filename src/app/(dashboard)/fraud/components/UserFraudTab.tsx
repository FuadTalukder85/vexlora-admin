"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  UserCheck,
  CreditCard,
  ShoppingBag,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { UserFraudProfile, RiskLevel } from "@/types/fraud";
import { toast } from "sonner";

interface UserFraudTabProps {
  onRefreshStats?: () => void;
}

export const UserFraudTab: React.FC<UserFraudTabProps> = ({ onRefreshStats }) => {
  const [profiles, setProfiles] = useState<UserFraudProfile[]>([]);
  const [activeRiskFilter, setActiveRiskFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<UserFraudProfile | null>(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserFraudProfile | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editRiskLevel, setEditRiskLevel] = useState<RiskLevel>("LOW");
  const [editFraudTypes, setEditFraudTypes] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deletingProfile, setDeletingProfile] = useState<UserFraudProfile | null>(null);
  const [isRecalculatingId, setIsRecalculatingId] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/fraud-profiles", {
        params: { limit: 100 },
      });
      const data = res.data?.data || res.data?.profiles || res.data || [];
      if (Array.isArray(data)) {
        setProfiles(data);
      }
    } catch {
      toast.error("Failed to load customer fraud profiles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRecalculateSingle = async (userId: string, userName?: string | null) => {
    try {
      setIsRecalculatingId(userId);
      const res = await apiClient.post(`/fraud-profiles/recalculate/${userId}`);
      const updated = res.data?.data || res.data;
      setProfiles((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, ...updated } : p))
      );
      toast.success(`Risk profile recalculation completed for ${userName || userId}`);
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to recalculate user risk profile");
    } finally {
      setIsRecalculatingId(null);
    }
  };

  const handleBatchRecalculate = async () => {
    try {
      setIsBatchRunning(true);
      const res = await apiClient.post("/fraud-profiles/batch-recalculate");
      const count = res.data?.data?.recalculatedCount ?? "all";
      toast.success(`Batch risk recalculation completed for ${count} users`);
      await fetchProfiles();
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to trigger batch risk calculation");
    } finally {
      setIsBatchRunning(false);
    }
  };

  const handleOpenEdit = (profile: UserFraudProfile) => {
    setEditingProfile(profile);
    setEditScore(profile.riskScore);
    setEditRiskLevel(profile.riskLevel);
    setEditFraudTypes((profile.fraudTypes || []).join(", "));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      setIsSavingEdit(true);
      const fraudTypesArray = editFraudTypes
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await apiClient.patch(`/fraud-profiles/${editingProfile.id}`, {
        riskScore: Number(editScore),
        riskLevel: editRiskLevel,
        fraudTypes: fraudTypesArray,
      });

      const updated = res.data?.data || res.data;
      setProfiles((prev) =>
        prev.map((p) => (p.id === editingProfile.id ? { ...p, ...updated } : p))
      );
      toast.success("User risk profile updated successfully");
      setEditingProfile(null);
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to update user risk profile");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProfile) return;
    try {
      await apiClient.delete(`/fraud-profiles/${deletingProfile.id}`);
      setProfiles((prev) => prev.filter((p) => p.id !== deletingProfile.id));
      toast.success("Fraud profile record deleted");
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to delete fraud profile");
    } finally {
      setDeletingProfile(null);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      (p.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.fraudTypes || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRisk =
      activeRiskFilter === "ALL" || p.riskLevel === activeRiskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadgeVariant = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
        return "danger";
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
      default:
        return "success";
    }
  };

  const columns: ColumnDef<UserFraudProfile>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Customer / Account",
      cell: (p) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-primary text-xs">
              {p.user?.name || "Customer User"}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-secondary font-mono">
              {p.user?.role || "CUSTOMER"}
            </span>
          </div>
          <p className="text-[11px] text-secondary font-mono mt-0.5">
            {p.user?.email || p.userId}
          </p>
        </div>
      ),
    },
    {
      header: "Risk Score",
      cell: (p) => (
        <div className="flex items-center gap-2">
          <span
            className={
              p.riskScore >= 75
                ? "font-extrabold text-highlight text-sm"
                : p.riskScore >= 40
                ? "font-extrabold text-amber-600 text-sm"
                : "font-extrabold text-emerald-600 text-sm"
            }
          >
            {p.riskScore}/100
          </span>
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div
              className={`h-full rounded-full ${
                p.riskScore >= 75
                  ? "bg-highlight"
                  : p.riskScore >= 40
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, p.riskScore))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Risk Level",
      cell: (p) => (
        <Badge variant={getRiskBadgeVariant(p.riskLevel)}>{p.riskLevel}</Badge>
      ),
    },
    {
      header: "Order Activity",
      cell: (p) => (
        <div className="text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 text-primary">
            <ShoppingBag className="w-3 h-3 text-secondary" />
            <span>Total: <b>{p.totalOrders}</b></span>
            <span className="text-secondary">(Delivered: {p.completedOrders})</span>
          </div>
          {(p.cancelledOrders > 0 || p.returnedOrders > 0 || p.totalRefunds > 0) && (
            <div className="flex items-center gap-2 text-[10px]">
              {p.cancelledOrders > 0 && (
                <span className="text-amber-600 font-semibold">
                  Canc: {p.cancelledOrders}
                </span>
              )}
              {p.returnedOrders > 0 && (
                <span className="text-highlight font-semibold">
                  Ret: {p.returnedOrders}
                </span>
              )}
              {p.totalRefunds > 0 && (
                <span className="text-red-700 font-semibold">
                  Ref: {p.totalRefunds}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Detected Flags",
      cell: (p) => {
        const types = p.fraudTypes || [];
        if (types.length === 0) {
          return <span className="text-xs text-secondary italic">No threat flags</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {types.map((type) => (
              <span
                key={type}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-highlight border border-highlight/20"
              >
                {type.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: "Last Scan",
      cell: (p) => (
        <span className="text-xs text-secondary">
          {p.lastCalculatedAt ? formatDate(p.lastCalculatedAt) : "Never"}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (p) => (
        <TableActions>
          <TableActionButton
            onClick={() => {
              setSelectedProfile(p);
              setIsInspectOpen(true);
            }}
            title="Inspect Risk Breakdown"
          >
            <Eye className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="emerald"
            disabled={isRecalculatingId === p.userId}
            onClick={() => handleRecalculateSingle(p.userId, p.user?.name)}
            title="Recalculate Heuristic Score"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isRecalculatingId === p.userId ? "animate-spin text-emerald-600" : ""
              }`}
            />
          </TableActionButton>
          <TableActionButton
            hoverVariant="primary"
            onClick={() => handleOpenEdit(p)}
            title="Manual Adjustment"
          >
            <Edit2 className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="danger"
            onClick={() => setDeletingProfile(p)}
            title="Delete Profile"
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
        data={filteredProfiles}
        columns={columns}
        keyExtractor={(p) => p.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Risk Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-5 overflow-x-auto">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRiskFilter(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeRiskFilter === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab === "ALL" ? "All Customer Profiles" : `${tab} Risk`}
                </button>
              ))}
            </div>

            {/* Search & Batch Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user name, email, risk..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchRecalculate}
                isLoading={isBatchRunning}
                className="shrink-0 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Batch Recalculate
              </Button>
            </div>
          </div>
        }
      />

      {/* Inspect Customer Risk Breakdown Modal */}
      <Modal
        isOpen={isInspectOpen && !!selectedProfile}
        onClose={() => {
          setIsInspectOpen(false);
          setSelectedProfile(null);
        }}
        title="Customer Risk Assessment Dossier"
        maxWidth="lg"
      >
        {selectedProfile && (
          <div className="space-y-4">
            {/* Header Summary */}
            <div className="p-4 rounded-xl bg-muted border border-border flex items-start justify-between">
              <div>
                <h4 className="font-bold text-primary text-sm">
                  {selectedProfile.user?.name || "Customer Account"}
                </h4>
                <p className="text-xs text-secondary font-mono mt-0.5">
                  {selectedProfile.user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-secondary flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Account Age:{" "}
                    <b>{selectedProfile.accountAgeDays} days</b>
                  </span>
                  <span className="text-[11px] text-secondary flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Status:{" "}
                    <b>{selectedProfile.user?.status || "ACTIVE"}</b>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-2xl font-black ${
                    selectedProfile.riskScore >= 75
                      ? "text-highlight"
                      : selectedProfile.riskScore >= 40
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedProfile.riskScore}/100
                </span>
                <div className="mt-1">
                  <Badge variant={getRiskBadgeVariant(selectedProfile.riskLevel)}>
                    {selectedProfile.riskLevel} RISK
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">Total Orders</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {selectedProfile.totalOrders}
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  Completed: {selectedProfile.completedOrders}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">Cancellations</p>
                <p className="text-lg font-bold text-amber-600 mt-1">
                  {selectedProfile.cancelledOrders}
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  Rate:{" "}
                  {selectedProfile.totalOrders > 0
                    ? `${Math.round(
                        (selectedProfile.cancelledOrders / selectedProfile.totalOrders) * 100
                      )}%`
                    : "0%"}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">Returns & Disputes</p>
                <p className="text-lg font-bold text-highlight mt-1">
                  {selectedProfile.returnedOrders}
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  Total Refunds: {selectedProfile.totalRefunds}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">Payment Failures</p>
                <p className="text-lg font-bold text-red-700 mt-1">
                  {selectedProfile.failedPayments}
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  Chargebacks: {selectedProfile.chargebacks}
                </p>
              </div>
            </div>

            {/* Identified Risk Factors */}
            <div className="p-4 bg-muted rounded-xl border border-border">
              <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Heuristic Risk Indicators
              </h5>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(selectedProfile.fraudTypes || []).length > 0 ? (
                  selectedProfile.fraudTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-highlight border border-highlight/30 shadow-2xs"
                    >
                      ⚠️ {type.replace(/_/g, " ").toUpperCase()}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 font-medium">
                    ✓ No abusive patterns detected for this user.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsInspectOpen(false);
                  handleRecalculateSingle(
                    selectedProfile.userId,
                    selectedProfile.user?.name
                  );
                }}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Recalculate Now
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsInspectOpen(false);
                  handleOpenEdit(selectedProfile);
                }}
              >
                Edit Risk Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Edit Risk Profile Modal */}
      <Modal
        isOpen={!!editingProfile}
        onClose={() => setEditingProfile(null)}
        title="Adjust User Risk Profile"
        maxWidth="md"
      >
        {editingProfile && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Target Customer
              </label>
              <input
                type="text"
                readOnly
                value={`${editingProfile.user?.name || "Customer"} (${
                  editingProfile.user?.email || editingProfile.userId
                })`}
                className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs text-secondary cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Risk Score (0 - 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editScore}
                  onChange={(e) => setEditScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Risk Level
                </label>
                <select
                  value={editRiskLevel}
                  onChange={(e) => setEditRiskLevel(e.target.value as RiskLevel)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Fraud Flags (comma separated)
              </label>
              <input
                type="text"
                value={editFraudTypes}
                onChange={(e) => setEditFraudTypes(e.target.value)}
                placeholder="e.g. multi_account, coupon_abuse, return_abuse"
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] text-secondary mt-1">
                Common types: <code>multi_account</code>, <code>coupon_abuse</code>,{" "}
                <code>return_abuse</code>, <code>chargeback_risk</code>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(null)}
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
        isOpen={!!deletingProfile}
        onClose={() => setDeletingProfile(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User Fraud Profile"
        confirmText="Delete Record"
        variant="danger"
        description={
          deletingProfile ? (
            <p>
              Are you sure you want to delete the fraud profile record for{" "}
              <span className="font-bold text-primary">
                {deletingProfile.user?.name || deletingProfile.userId}
              </span>
              ? The system will regenerate metrics on subsequent checks.
            </p>
          ) : undefined
        }
      />
    </div>
  );
};
