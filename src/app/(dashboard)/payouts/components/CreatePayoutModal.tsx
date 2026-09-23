"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAdminVendors } from "@/hooks/useAdminVendors";
import { useCreatePayoutAdmin } from "@/hooks/useAdminPayouts";
import { PayoutStatus } from "@/types/payout";
import { toast } from "sonner";
import { Store, Plus } from "lucide-react";

interface CreatePayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePayoutModal: React.FC<CreatePayoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [subOrderIdsText, setSubOrderIdsText] = useState("");
  const [status, setStatus] = useState<PayoutStatus>("UNPAID");
  const [stripeTransferId, setStripeTransferId] = useState("");

  const { data: vendorData, isLoading: isLoadingVendors } = useAdminVendors({
    limit: 100,
    status: "APPROVED",
  });

  const createPayoutMutation = useCreatePayoutAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVendorId) {
      toast.error("Please select a vendor store");
      return;
    }

    const subOrderIds = subOrderIdsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (subOrderIds.length === 0) {
      toast.error("Please provide at least one delivered SubOrder ID");
      return;
    }

    try {
      await createPayoutMutation.mutateAsync({
        vendorId: selectedVendorId,
        subOrderIds,
        status,
        stripeTransferId: stripeTransferId.trim() || undefined,
      });

      toast.success("Payout generated successfully!");
      setSelectedVendorId("");
      setSubOrderIdsText("");
      setStripeTransferId("");
      setStatus("UNPAID");
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create payout record"
      );
    }
  };

  const vendors = vendorData?.vendors || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manual Vendor Payout"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vendor Selection */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Select Vendor Store <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
              required
            >
              <option value="">-- Choose Approved Merchant --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.storeName} ({v.storeEmail})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-orders Input */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Sub-Order IDs (Delivered) <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={subOrderIdsText}
            onChange={(e) => setSubOrderIdsText(e.target.value)}
            rows={3}
            placeholder="Paste sub-order ID(s), separated by commas or line breaks"
            className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs font-mono text-primary focus:outline-none focus:border-primary transition-all"
            required
          />
          <p className="text-[11px] text-secondary mt-1">
            Only DELIVERED sub-orders with UNPAID status can be grouped into this payout.
          </p>
        </div>

        {/* Initial Payout Status */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Initial Settlement Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PayoutStatus)}
            className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="UNPAID">UNPAID (Pending Clearance)</option>
            <option value="PROCESSING">PROCESSING (In Escrow Transfer)</option>
            <option value="PAID">PAID (Settled)</option>
          </select>
        </div>

        {/* Optional Stripe / Bank Transfer ID */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Transfer Reference / Transaction Hash (Optional)
          </label>
          <input
            type="text"
            value={stripeTransferId}
            onChange={(e) => setStripeTransferId(e.target.value)}
            placeholder="e.g. tr_1Nxxxx or WIRE_BATCH_99"
            className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs font-mono text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={createPayoutMutation.isPending}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Generate Payout
          </Button>
        </div>
      </form>
    </Modal>
  );
};
