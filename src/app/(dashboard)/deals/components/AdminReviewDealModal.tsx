"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface DealRequestItem {
  id: string;
  productId: string;
  proposedDealPrice: number;
  requestedStartAt: string;
  requestedEndAt: string;
  quantityLimit?: number | null;
  maxPerCustomer?: number | null;
  note?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    basePrice: number;
    images: string[];
  };
  vendor: {
    id: string;
    storeName: string;
    storeSlug: string;
    storeLogo?: string | null;
  };
  deal?: {
    id: string;
    status: string;
  } | null;
}

interface AdminReviewDealModalProps {
  request: DealRequestItem | null;
  action: "APPROVED" | "REJECTED";
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminReviewDealModal: React.FC<AdminReviewDealModalProps> = ({
  request,
  action,
  onClose,
  onSuccess,
}) => {
  const [reviewNote, setReviewNote] = useState("");
  const [approvedPrice, setApprovedPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setApprovedPrice(String(request.proposedDealPrice));
      setReviewNote(
        action === "APPROVED"
          ? "Approved for featured flash deal promotion"
          : "Price reduction does not meet minimum campaign discount threshold"
      );
    }
  }, [request, action]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/deals/requests/${request.id}/review`, {
        status: action,
        reviewNote: reviewNote.trim() || undefined,
        approvedDealPrice:
          action === "APPROVED" && approvedPrice ? Number(approvedPrice) : undefined,
      });

      toast.success(
        action === "APPROVED"
          ? "Deal request approved and scheduled!"
          : "Deal request rejected"
      );
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to review deal request";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const discount = Math.round(
    (((request.product.basePrice - Number(approvedPrice || request.proposedDealPrice)) /
      request.product.basePrice) *
      100)
  );

  return (
    <Modal
      isOpen={!!request}
      onClose={onClose}
      title={action === "APPROVED" ? "Approve Deal Proposal" : "Reject Deal Proposal"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Product & Vendor Summary */}
        <div className="p-3 bg-muted/60 rounded-xl border border-border flex items-center gap-3">
          <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white border border-border shrink-0">
            <Image
              src={request.product.images?.[0] || "/placeholder-product.png"}
              alt={request.product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-primary truncate">
              {request.product.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-secondary">
              <span>Vendor: <b className="text-primary">{request.vendor.storeName}</b></span>
              <span>•</span>
              <span>Regular: <b className="text-primary">{formatCurrency(request.product.basePrice)}</b></span>
            </div>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-xl border border-border">
          <div>
            <span className="text-secondary text-[11px]">Start Date:</span>
            <p className="font-semibold text-primary">{formatDate(request.requestedStartAt)}</p>
          </div>
          <div>
            <span className="text-secondary text-[11px]">End Date:</span>
            <p className="font-semibold text-primary">{formatDate(request.requestedEndAt)}</p>
          </div>
        </div>

        {/* Vendor's Proposal Note */}
        {request.note && (
          <div className="text-xs bg-muted/30 p-2.5 rounded-xl border border-border">
            <span className="font-bold text-secondary text-[10px] uppercase tracking-wider block mb-1">
              Vendor Pitch / Notes:
            </span>
            <p className="text-primary italic text-[11px]">"{request.note}"</p>
          </div>
        )}

        {/* Price Override (If approving) */}
        {action === "APPROVED" ? (
          <div>
            <Input
              label="Final Approved Flash Deal Price ($)"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={approvedPrice}
              onChange={(e) => setApprovedPrice(e.target.value)}
              helperText={`Discount: ${discount}% OFF regular price (${formatCurrency(request.product.basePrice)})`}
            />
          </div>
        ) : (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
            You are rejecting this promotion request. Please provide feedback below so the vendor understands why.
          </div>
        )}

        {/* Admin Feedback / Rejection reason */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">
            Admin Feedback to Vendor <span className="text-danger">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Feedback note..."
            className="w-full px-3.5 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={action === "APPROVED" ? "primary" : "danger"}
            size="sm"
            isLoading={isSubmitting}
          >
            {action === "APPROVED" ? "Confirm Approval" : "Reject Proposal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
