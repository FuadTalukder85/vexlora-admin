"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface AdminDirectDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Array<{
    id: string;
    title: string;
    basePrice: number;
    images?: string[];
    vendor?: { storeName: string };
  }>;
  onSuccess: () => void;
}

export const AdminDirectDealModal: React.FC<AdminDirectDealModalProps> = ({
  isOpen,
  onClose,
  products,
  onSuccess,
}) => {
  const [directProductId, setDirectProductId] = useState("");
  const [directTitle, setDirectTitle] = useState("");
  const [directPrice, setDirectPrice] = useState("");
  const [directStartAt, setDirectStartAt] = useState("");
  const [directEndAt, setDirectEndAt] = useState("");
  const [directQuota, setDirectQuota] = useState("");
  const [isCreatingDirect, setIsCreatingDirect] = useState(false);

  const selectedProduct = products.find((p) => p.id === directProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directProductId || !directPrice || !directStartAt || !directEndAt) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(directStartAt) >= new Date(directEndAt)) {
      toast.error("End time must be after start time");
      return;
    }

    setIsCreatingDirect(true);
    try {
      await apiClient.post("/deals/admin/direct", {
        productId: directProductId,
        title: directTitle.trim() || undefined,
        dealPrice: Number(directPrice),
        startAt: new Date(directStartAt).toISOString(),
        endAt: new Date(directEndAt).toISOString(),
        quantityLimit: directQuota ? Number(directQuota) : null,
      });

      toast.success("Platform Flash Deal launched successfully!");
      onClose();

      // Reset form
      setDirectProductId("");
      setDirectTitle("");
      setDirectPrice("");
      setDirectStartAt("");
      setDirectEndAt("");
      setDirectQuota("");

      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create platform deal";
      toast.error(msg);
    } finally {
      setIsCreatingDirect(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Platform Direct Deal"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Product Select */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">
            Select Product <span className="text-danger">*</span>
          </label>
          <select
            value={directProductId}
            onChange={(e) => setDirectProductId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="">-- Choose a product for direct deal --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} (Vendor: {p.vendor?.storeName || "Platform"} | Regular: {formatCurrency(p.basePrice)})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Product Snapshot */}
        {selectedProduct && (
          <div className="p-3 bg-muted/60 rounded-xl border border-border flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white border border-border shrink-0">
              <Image
                src={selectedProduct.images?.[0] || "/placeholder-product.png"}
                alt={selectedProduct.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary truncate">{selectedProduct.title}</p>
              <p className="text-[11px] text-secondary mt-0.5">
                Regular: <b className="text-primary">{formatCurrency(selectedProduct.basePrice)}</b> • Vendor: {selectedProduct.vendor?.storeName || "Platform"}
              </p>
            </div>
          </div>
        )}

        {/* Custom Deal Title */}
        <Input
          label="Deal Campaign Title (Optional)"
          value={directTitle}
          onChange={(e) => setDirectTitle(e.target.value)}
          placeholder="e.g. Midnight Mega Sale, Weekend Special..."
        />

        {/* Deal Price */}
        <Input
          label="Deal Promotional Price ($)"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={directPrice}
          onChange={(e) => setDirectPrice(e.target.value)}
          placeholder="e.g. 29.99"
          helperText={
            selectedProduct && directPrice
              ? `Discount: ${Math.round(
                  ((selectedProduct.basePrice - Number(directPrice)) /
                    selectedProduct.basePrice) *
                    100
                )}% off regular price`
              : undefined
          }
        />

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date & Time"
            type="datetime-local"
            required
            value={directStartAt}
            onChange={(e) => setDirectStartAt(e.target.value)}
          />
          <Input
            label="End Date & Time"
            type="datetime-local"
            required
            value={directEndAt}
            onChange={(e) => setDirectEndAt(e.target.value)}
          />
        </div>

        {/* Quota */}
        <Input
          label="Total Deal Quota / Quantity Limit (Optional)"
          type="number"
          min="1"
          value={directQuota}
          onChange={(e) => setDirectQuota(e.target.value)}
          placeholder="Unlimited if empty"
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isCreatingDirect}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isCreatingDirect}
          >
            Create Flash Deal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
