"use client";

import React, { useState } from "react";
import { Plus, Search, Tag, Sparkles, History, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import {
  useAdminCoupons,
  useCreateAdminCoupon,
  useUpdateAdminCoupon,
  useToggleAdminCouponStatus,
  useDeleteAdminCoupon,
  useAdminCouponUsageLogs,
} from "@/hooks/useAdminCoupons";
import { CouponTable } from "./components/CouponTable";
import { AdminCouponModal } from "./components/AdminCouponModal";
import { AdminCouponUsageLogs } from "./components/AdminCouponUsageLogs";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Coupon } from "@/types/coupon";

export default function AdminCouponsPage() {
  const [activeTab, setActiveTab] = useState<"COUPONS" | "LOGS">("COUPONS");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "platform" | "vendor">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusChangingCoupon, setStatusChangingCoupon] = useState<Coupon | null>(null);

  const { data: couponData, isLoading: isCouponsLoading } = useAdminCoupons({
    searchTerm: searchTerm.trim() || undefined,
    scope: scopeFilter !== "ALL" ? scopeFilter : undefined,
    isActive: statusFilter === "ACTIVE" ? true : statusFilter === "INACTIVE" ? false : undefined,
  });

  const { data: logsData, isLoading: isLogsLoading } = useAdminCouponUsageLogs({
    searchTerm: searchTerm.trim() || undefined,
  });

  const createCouponMutation = useCreateAdminCoupon();
  const updateCouponMutation = useUpdateAdminCoupon();
  const toggleStatusMutation = useToggleAdminCouponStatus();
  const deleteCouponMutation = useDeleteAdminCoupon();

  const coupons = couponData?.coupons || [];
  const logs = logsData?.logs || [];

  // Metrics
  const totalCoupons = coupons.length;
  const platformCoupons = coupons.filter((c) => c.scope === "platform").length;
  const vendorCoupons = coupons.filter((c) => c.scope === "vendor").length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (payload: any) => {
    if (editingCoupon) {
      await updateCouponMutation.mutateAsync({ id: editingCoupon.id, payload: payload.payload || payload });
    } else {
      await createCouponMutation.mutateAsync(payload);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (coupon: Coupon) => {
    setStatusChangingCoupon(coupon);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusChangingCoupon) return;
    try {
      await toggleStatusMutation.mutateAsync({
        id: statusChangingCoupon.id,
        isActive: !statusChangingCoupon.isActive,
      });
      setStatusChangingCoupon(null);
    } catch {
      // Error handled by mutation hook toast
    }
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setDeletingCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;
    try {
      await deleteCouponMutation.mutateAsync(deletingCoupon.id);
      setIsDeleteModalOpen(false);
      setDeletingCoupon(null);
    } catch {
      // Error handled by mutation hook toast
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      {/* 1. Page Header (Shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Coupons & Campaigns</h1>
          <p className="text-xs text-secondary mt-1">
            Create platform-wide discount vouchers, manage vendor promotions, and audit redemption metrics.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Create New Campaign
        </Button>
      </div>

      {/* 2. Metric Stat Cards (Shrink-0) */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campaigns"
          value={totalCoupons}
          icon={Tag}
          iconColorClass="bg-primary/10 text-primary"
        />
        <StatCard
          title="Platform Vouchers"
          value={platformCoupons}
          icon={ShieldCheck}
          iconColorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Vendor Promotions"
          value={vendorCoupons}
          icon={Store}
          iconColorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Total Redemptions"
          value={totalRedemptions}
          icon={Sparkles}
          iconColorClass="bg-highlight/10 text-highlight"
        />
      </div>

      {/* 3. Main Switcher & Table Area (Flex-1 Min-h-0) */}
      <div className="flex-1 min-h-0 flex flex-col space-y-3">
        {/* Main Tab Switcher */}
        <div className="shrink-0 flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("COUPONS")}
              className={`flex items-center gap-2 text-xs font-bold transition-all border-b-2 pb-2 -mb-2.5 cursor-pointer ${
                activeTab === "COUPONS"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>All Coupons ({totalCoupons})</span>
            </button>
            <button
              onClick={() => setActiveTab("LOGS")}
              className={`flex items-center gap-2 text-xs font-bold transition-all border-b-2 pb-2 -mb-2.5 cursor-pointer ${
                activeTab === "LOGS"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Redemption Audit Logs ({logs.length})</span>
            </button>
          </div>
        </div>

        {/* Table View with Header Filter Content */}
        {activeTab === "COUPONS" ? (
          <CouponTable
            coupons={coupons}
            isLoading={isCouponsLoading}
            onEdit={handleOpenEditModal}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteCoupon}
            headerContent={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Scope filter */}
                  <div className="flex items-center gap-1 bg-white border border-border p-1 rounded-xl">
                    {[
                      { label: "All Scopes", val: "ALL" },
                      { label: "Platform", val: "platform" },
                      { label: "Vendor", val: "vendor" },
                    ].map((sc) => (
                      <button
                        key={sc.val}
                        onClick={() => setScopeFilter(sc.val as any)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          scopeFilter === sc.val
                            ? "bg-primary text-white shadow-2xs"
                            : "text-secondary hover:text-primary"
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-1 bg-white border border-border p-1 rounded-xl">
                    {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          statusFilter === st
                            ? "bg-primary text-white shadow-2xs"
                            : "text-secondary hover:text-primary"
                        }`}
                      >
                        {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search promo code..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            }
          />
        ) : (
          <AdminCouponUsageLogs
            logs={logs}
            isLoading={isLogsLoading}
            headerContent={
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-secondary font-medium">
                  Showing historical redemptions logged across all customer checkouts
                </p>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search voucher code..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            }
          />
        )}
      </div>

      {/* Admin Create / Edit Modal */}
      <AdminCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={editingCoupon}
        onSave={handleSaveCoupon}
        isSaving={createCouponMutation.isPending || updateCouponMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleteCouponMutation.isPending) {
            setIsDeleteModalOpen(false);
            setDeletingCoupon(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon Campaign"
        confirmText="Delete Coupon"
        variant="danger"
        isLoading={deleteCouponMutation.isPending}
        description={
          deletingCoupon ? (
            <div className="space-y-3">
              <p>
                Are you sure you want to permanently delete coupon{" "}
                <span className="font-bold text-primary font-mono">{deletingCoupon.code}</span>?
              </p>
              <div className="p-3 bg-muted rounded-xl border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-primary">
                    {deletingCoupon.discountType === "percentage"
                      ? `${deletingCoupon.discountValue}% OFF`
                      : `$${deletingCoupon.discountValue} OFF`}
                  </span>
                  <span className="text-secondary ml-2 capitalize">({deletingCoupon.scope} voucher)</span>
                </div>
                <span className="text-secondary font-medium">
                  {deletingCoupon.usedCount} redemptions
                </span>
              </div>
              <p className="text-[11px] text-highlight font-medium">
                This action cannot be undone. Customers will no longer be able to use this promo code at checkout.
              </p>
            </div>
          ) : undefined
        }
      />

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!statusChangingCoupon}
        onClose={() => {
          if (!toggleStatusMutation.isPending) {
            setStatusChangingCoupon(null);
          }
        }}
        onConfirm={handleConfirmToggleStatus}
        title={statusChangingCoupon?.isActive ? "Deactivate Coupon" : "Activate Coupon"}
        confirmText={statusChangingCoupon?.isActive ? "Deactivate Coupon" : "Activate Coupon"}
        variant={statusChangingCoupon?.isActive ? "warning" : "primary"}
        isLoading={toggleStatusMutation.isPending}
        description={
          statusChangingCoupon ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to{" "}
                <span className="font-bold">
                  {statusChangingCoupon.isActive ? "deactivate" : "activate"}
                </span>{" "}
                coupon{" "}
                <span className="font-bold text-primary font-mono">{statusChangingCoupon.code}</span>?
              </p>
              <p className="text-[11px] text-secondary">
                {statusChangingCoupon.isActive
                  ? "Customers will temporarily not be able to apply this discount code during checkout."
                  : "This coupon will become live and eligible for customer redemptions immediately."}
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
