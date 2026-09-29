"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Store,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Star,
  Truck,
  TrendingDown,
  ShieldCheck,
  AlertOctagon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { SellerFraudProfile, RiskLevel } from "@/types/fraud";
import { toast } from "sonner";

interface SellerFraudTabProps {
  onRefreshStats?: () => void;
}

export const SellerFraudTab: React.FC<SellerFraudTabProps> = ({ onRefreshStats }) => {
  const [profiles, setProfiles] = useState<SellerFraudProfile[]>([]);
  const [activeRiskFilter, setActiveRiskFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<SellerFraudProfile | null>(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  const [editingProfile, setEditingProfile] = useState<SellerFraudProfile | null>(null);
  const [complaints, setComplaints] = useState<number>(0);
  const [fakeProductReports, setFakeProductReports] = useState<number>(0);
  const [reviewAbuseCount, setReviewAbuseCount] = useState<number>(0);
  const [suspiciousOrders, setSuspiciousOrders] = useState<number>(0);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("LOW");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deletingProfile, setDeletingProfile] = useState<SellerFraudProfile | null>(null);
  const [isRecalculatingId, setIsRecalculatingId] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/seller-fraud-profiles", {
        params: { limit: 100 },
      });
      const data = res.data?.data || res.data?.sellerProfiles || res.data || [];
      if (Array.isArray(data)) {
        setProfiles(data);
      }
    } catch {
      toast.error("Failed to load seller risk profiles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRecalculateSingle = async (vendorId: string, storeName?: string) => {
    try {
      setIsRecalculatingId(vendorId);
      const res = await apiClient.post(`/seller-fraud-profiles/recalculate/${vendorId}`);
      const updated = res.data?.data || res.data;
      setProfiles((prev) =>
        prev.map((p) => (p.vendorId === vendorId ? { ...p, ...updated } : p))
      );
      toast.success(`Risk analysis refreshed for ${storeName || "vendor"}`);
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to recalculate seller risk");
    } finally {
      setIsRecalculatingId(null);
    }
  };

  const handleBatchRecalculate = async () => {
    try {
      setIsBatchRunning(true);
      const res = await apiClient.post("/seller-fraud-profiles/batch-recalculate");
      const count = res.data?.data?.recalculatedCount ?? "all";
      toast.success(`Batch seller risk recalculation finished for ${count} vendors`);
      await fetchProfiles();
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to trigger batch seller calculation");
    } finally {
      setIsBatchRunning(false);
    }
  };

  const handleOpenEdit = (profile: SellerFraudProfile) => {
    setEditingProfile(profile);
    setComplaints(profile.complaints || 0);
    setFakeProductReports(profile.fakeProductReports || 0);
    setReviewAbuseCount(profile.reviewAbuseCount || 0);
    setSuspiciousOrders(profile.suspiciousOrders || 0);
    setRiskScore(profile.riskScore || 0);
    setRiskLevel(profile.riskLevel || "LOW");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      setIsSavingEdit(true);
      const res = await apiClient.patch(`/seller-fraud-profiles/${editingProfile.id}`, {
        complaints: Number(complaints),
        fakeProductReports: Number(fakeProductReports),
        reviewAbuseCount: Number(reviewAbuseCount),
        suspiciousOrders: Number(suspiciousOrders),
        riskScore: Number(riskScore),
        riskLevel,
      });

      const updated = res.data?.data || res.data;
      setProfiles((prev) =>
        prev.map((p) => (p.id === editingProfile.id ? { ...p, ...updated } : p))
      );
      toast.success("Seller fraud profile flags updated successfully");
      setEditingProfile(null);
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to update seller fraud profile");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProfile) return;
    try {
      await apiClient.delete(`/seller-fraud-profiles/${deletingProfile.id}`);
      setProfiles((prev) => prev.filter((p) => p.id !== deletingProfile.id));
      toast.success("Seller fraud record deleted");
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast.error("Failed to delete seller fraud record");
    } finally {
      setDeletingProfile(null);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const storeName = p.vendor?.storeName || "";
    const matchesSearch =
      storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendorId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      activeRiskFilter === "ALL" || p.riskLevel === activeRiskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadgeVariant = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
      default:
        return "success";
    }
  };

  const columns: ColumnDef<SellerFraudProfile>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Vendor & Store",
      cell: (p) => (
        <div>
          <div className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-secondary" />
            <span className="font-bold text-primary text-xs">
              {p.vendor?.storeName || "Merchant Store"}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-secondary font-mono">
              {p.vendor?.status || "ACTIVE"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-secondary">
            <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {Number(p.customerRating || p.vendor?.ratingAvg || 0).toFixed(1)}
            </span>
            <span>• {p.totalOrders} fulfilled sub-orders</span>
          </div>
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
      header: "Performance & Dispute",
      cell: (p) => (
        <div className="text-[11px] space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-secondary">Refund Rate:</span>
            <span
              className={`font-semibold ${
                Number(p.refundRate) > 15 ? "text-highlight" : "text-primary"
              }`}
            >
              {Number(p.refundRate).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-secondary">Late Shipping:</span>
            <span
              className={`font-semibold ${
                Number(p.lateShipmentRate) > 20 ? "text-amber-600" : "text-primary"
              }`}
            >
              {Number(p.lateShipmentRate).toFixed(1)}%
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Abuse Flags",
      cell: (p) => {
        const hasFlags =
          p.complaints > 0 ||
          p.fakeProductReports > 0 ||
          p.reviewAbuseCount > 0 ||
          p.suspiciousOrders > 0;

        if (!hasFlags) {
          return (
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Clean Record
            </span>
          );
        }

        return (
          <div className="flex flex-wrap gap-1 text-[10px]">
            {p.fakeProductReports > 0 && (
              <span className="px-1.5 py-0.5 rounded font-bold bg-red-50 text-highlight border border-highlight/20">
                {p.fakeProductReports} Fake Reports
              </span>
            )}
            {p.complaints > 0 && (
              <span className="px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {p.complaints} Complaints
              </span>
            )}
            {p.reviewAbuseCount > 0 && (
              <span className="px-1.5 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {p.reviewAbuseCount} Review Abuse
              </span>
            )}
            {p.suspiciousOrders > 0 && (
              <span className="px-1.5 py-0.5 rounded font-bold bg-orange-50 text-orange-700 border border-orange-200">
                {p.suspiciousOrders} Suspicious
              </span>
            )}
          </div>
        );
      },
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
            title="Inspect Seller Audit"
          >
            <Eye className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="emerald"
            disabled={isRecalculatingId === p.vendorId}
            onClick={() =>
              handleRecalculateSingle(p.vendorId, p.vendor?.storeName)
            }
            title="Recalculate Seller Risk"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isRecalculatingId === p.vendorId
                  ? "animate-spin text-emerald-600"
                  : ""
              }`}
            />
          </TableActionButton>
          <TableActionButton
            hoverVariant="primary"
            onClick={() => handleOpenEdit(p)}
            title="Adjust Fraud Flags"
          >
            <Edit2 className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="danger"
            onClick={() => setDeletingProfile(p)}
            title="Delete Record"
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
                  {tab === "ALL" ? "All Vendors" : `${tab} Risk`}
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
                  placeholder="Search store name or ID..."
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

      {/* Inspect Seller Risk Modal */}
      <Modal
        isOpen={isInspectOpen && !!selectedProfile}
        onClose={() => {
          setIsInspectOpen(false);
          setSelectedProfile(null);
        }}
        title="Merchant Fraud Risk & Health Dossier"
        maxWidth="lg"
      >
        {selectedProfile && (
          <div className="space-y-4">
            {/* Header Summary */}
            <div className="p-4 rounded-xl bg-muted border border-border flex items-start justify-between">
              <div>
                <h4 className="font-bold text-primary text-sm flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-secondary" />
                  {selectedProfile.vendor?.storeName || "Merchant Store"}
                </h4>
                <p className="text-xs text-secondary font-mono mt-0.5">
                  Vendor ID: {selectedProfile.vendorId}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-secondary flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    Rating:{" "}
                    <b>
                      {Number(
                        selectedProfile.customerRating ||
                          selectedProfile.vendor?.ratingAvg ||
                          0
                      ).toFixed(1)}
                      /5.0
                    </b>
                  </span>
                  <span className="text-[11px] text-secondary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Store Status:{" "}
                    <b>{selectedProfile.vendor?.status || "ACTIVE"}</b>
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

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">
                  Fulfilled Orders
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {selectedProfile.totalOrders}
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  Cancelled: {selectedProfile.cancelledOrders}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">Refund Rate</p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    Number(selectedProfile.refundRate) > 15
                      ? "text-highlight"
                      : "text-primary"
                  }`}
                >
                  {Number(selectedProfile.refundRate).toFixed(1)}%
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  Returns: {selectedProfile.returnedOrders}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">
                  Late Shipment Rate
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    Number(selectedProfile.lateShipmentRate) > 20
                      ? "text-amber-600"
                      : "text-primary"
                  }`}
                >
                  {Number(selectedProfile.lateShipmentRate).toFixed(1)}%
                </p>
                <p className="text-[10px] text-secondary mt-0.5">Threshold: 20%</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-secondary">
                  Fake Product Reports
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    selectedProfile.fakeProductReports > 0
                      ? "text-highlight"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedProfile.fakeProductReports}
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  Complaints: {selectedProfile.complaints}
                </p>
              </div>
            </div>

            {/* Suspicious Patterns */}
            <div className="p-4 bg-muted rounded-xl border border-border">
              <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-highlight" />
                Abuse & Policy Breach Counters
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="p-2.5 bg-white rounded-lg border border-border text-center">
                  <span className="text-[10px] text-secondary uppercase font-semibold">
                    Customer Complaints
                  </span>
                  <p className="text-base font-bold text-primary mt-0.5">
                    {selectedProfile.complaints}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-border text-center">
                  <span className="text-[10px] text-secondary uppercase font-semibold">
                    Fake Item Claims
                  </span>
                  <p className="text-base font-bold text-highlight mt-0.5">
                    {selectedProfile.fakeProductReports}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-border text-center">
                  <span className="text-[10px] text-secondary uppercase font-semibold">
                    Review Sybil Abuse
                  </span>
                  <p className="text-base font-bold text-purple-700 mt-0.5">
                    {selectedProfile.reviewAbuseCount}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-border text-center">
                  <span className="text-[10px] text-secondary uppercase font-semibold">
                    Suspicious Orders
                  </span>
                  <p className="text-base font-bold text-orange-700 mt-0.5">
                    {selectedProfile.suspiciousOrders}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsInspectOpen(false);
                  handleRecalculateSingle(
                    selectedProfile.vendorId,
                    selectedProfile.vendor?.storeName
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
                Adjust Risk Flags
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Adjust Seller Flags Modal */}
      <Modal
        isOpen={!!editingProfile}
        onClose={() => setEditingProfile(null)}
        title="Adjust Merchant Fraud Indicators"
        maxWidth="md"
      >
        {editingProfile && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Merchant Store
              </label>
              <input
                type="text"
                readOnly
                value={editingProfile.vendor?.storeName || editingProfile.vendorId}
                className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs text-secondary cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Customer Complaints Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={complaints}
                  onChange={(e) => setComplaints(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Fake Product Reports
                </label>
                <input
                  type="number"
                  min={0}
                  value={fakeProductReports}
                  onChange={(e) => setFakeProductReports(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Review Manipulation Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={reviewAbuseCount}
                  onChange={(e) => setReviewAbuseCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Suspicious Orders Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={suspiciousOrders}
                  onChange={(e) => setSuspiciousOrders(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Override Risk Score (0 - 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Override Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
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
                Save Adjustments
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
        title="Delete Seller Risk Profile"
        confirmText="Delete Record"
        variant="danger"
        description={
          deletingProfile ? (
            <p>
              Are you sure you want to delete the seller fraud profile record for{" "}
              <span className="font-bold text-primary">
                {deletingProfile.vendor?.storeName || deletingProfile.vendorId}
              </span>
              ?
            </p>
          ) : undefined
        }
      />
    </div>
  );
};
