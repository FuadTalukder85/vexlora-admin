"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Coupon, CreateAdminCouponPayload, UpdateAdminCouponPayload } from "@/types/coupon";
import { useAdminVendors } from "@/hooks/useAdminVendors";
import { Sparkles, AlertCircle, ShieldCheck, Store } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AdminCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  onSave: (payload: CreateAdminCouponPayload | { id: string; payload: UpdateAdminCouponPayload }) => Promise<void>;
  isSaving: boolean;
}

export const AdminCouponModal: React.FC<AdminCouponModalProps> = ({
  isOpen,
  onClose,
  coupon,
  onSave,
  isSaving,
}) => {
  const [code, setCode] = useState("");
  const [scope, setScope] = useState<"platform" | "vendor">("platform");
  const [vendorId, setVendorId] = useState<string>("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const { data: vendorData, isLoading: isLoadingVendors } = useAdminVendors({ limit: 100 });
  const vendors = vendorData?.vendors || [];

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setScope(coupon.scope);
      setVendorId(coupon.vendorId || "");
      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue);
      setMinPurchase(coupon.minPurchase !== null && coupon.minPurchase !== undefined ? coupon.minPurchase.toString() : "");
      setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "");
      setUsageLimit(coupon.usageLimit !== null && coupon.usageLimit !== undefined ? coupon.usageLimit.toString() : "");
      setIsActive(coupon.isActive);
    } else {
      setCode("");
      setScope("platform");
      setVendorId("");
      setDiscountType("percentage");
      setDiscountValue(10);
      setMinPurchase("");
      setExpiresAt("");
      setUsageLimit("");
      setIsActive(true);
    }
    setError("");
  }, [coupon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Coupon code is required");
      return;
    }
    if (cleanCode.length < 3) {
      setError("Coupon code must be at least 3 characters");
      return;
    }
    if (scope === "vendor" && !vendorId) {
      setError("Please select a vendor store for vendor-scoped coupon");
      return;
    }
    if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
      setError("Percentage discount must be between 1% and 100%");
      return;
    }
    if (discountType === "flat" && discountValue <= 0) {
      setError("Discount value must be greater than 0");
      return;
    }

    const payload: any = {
      code: cleanCode,
      scope,
      vendorId: scope === "vendor" ? vendorId : null,
      discountType,
      discountValue: Number(discountValue),
      minPurchase: minPurchase.trim() ? Number(minPurchase) : null,
      expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.999Z`).toISOString() : null,
      usageLimit: usageLimit.trim() ? parseInt(usageLimit, 10) : null,
      isActive,
    };

    if (coupon) {
      await onSave({ id: coupon.id, payload });
    } else {
      await onSave(payload);
    }
  };

  const selectedVendor = vendors.find((v) => v.id === vendorId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? "Edit Platform Coupon" : "Create New Coupon Campaign"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Preview Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/[0.04] via-highlight/[0.04] to-primary/[0.04] border border-primary/20 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-xs px-2.5 py-1 bg-primary text-white rounded-lg tracking-wider shadow-2xs">
                {code.trim() ? code.trim().toUpperCase() : "PROMO_CODE"}
              </span>
              {scope === "platform" ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Platform-Wide
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Store className="w-2.5 h-2.5" />
                  {selectedVendor?.storeName || "Store Exclusive"}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-primary">
              {discountType === "percentage"
                ? `${discountValue || 0}% OFF`
                : `${formatCurrency(discountValue || 0)} OFF`}
            </p>
            <p className="text-[11px] text-secondary">
              {minPurchase && Number(minPurchase) > 0
                ? `Min spend: ${formatCurrency(Number(minPurchase))}`
                : "No minimum spend required"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-highlight" />
          </div>
        </div>

        {/* Scope and Vendor Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">Coupon Scope *</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer h-10"
            >
              <option value="platform">Platform-Wide (All Stores)</option>
              <option value="vendor">Vendor-Specific Store</option>
            </select>
          </div>

          {scope === "vendor" ? (
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">Target Vendor Store *</label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                disabled={isLoadingVendors}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer h-10"
                required
              >
                <option value="">Select a vendor store...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.storeName} ({v.slug || v.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">Status</label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer h-10"
              >
                <option value="true">Active (Live)</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {/* Coupon Code & Active Status (if vendor scope selected) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={scope === "vendor" ? "sm:col-span-2" : "sm:col-span-3"}>
            <Input
              label="Promo Code *"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
              placeholder="e.g. MEGA2026"
              required
            />
          </div>
          {scope === "vendor" && (
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">Status</label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer h-10"
              >
                <option value="true">Active (Live)</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">Discount Type *</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer h-10"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Cash Discount ($)</option>
            </select>
          </div>
          <div>
            <Input
              label={discountType === "percentage" ? "Discount Percentage (%) *" : "Flat Amount ($) *"}
              type="number"
              min="1"
              max={discountType === "percentage" ? "100" : undefined}
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Min Spend & Usage Limit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Min Order Amount ($)"
              type="number"
              min="0"
              step="0.01"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              placeholder="0 (No Minimum)"
            />
          </div>
          <div>
            <Input
              label="Max Redemptions Limit"
              type="number"
              min="1"
              step="1"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Unlimited"
            />
          </div>
        </div>

        {/* Expiration Date */}
        <div>
          <Input
            label="Expiry Date"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
