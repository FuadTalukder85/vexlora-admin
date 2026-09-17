"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency } from "@/lib/utils";
import { Coupon } from "@/types/coupon";
import { CouponsSkeleton } from "./CouponsSkeleton";
import { toast } from "sonner";

const mockCoupons: Coupon[] = [
  {
    id: "cp-1",
    code: "WELCOME20",
    description: "20% off for all newly registered shoppers",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderAmount: 50,
    maxDiscount: 40,
    usageLimit: 1000,
    usageCount: 420,
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-12-31T23:59:59Z",
    isActive: true,
  },
  {
    id: "cp-2",
    code: "SUMMER50",
    description: "$50 flat discount on premium furniture",
    discountType: "FIXED",
    discountValue: 50,
    minOrderAmount: 300,
    usageLimit: 200,
    usageCount: 185,
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-09-30T23:59:59Z",
    isActive: true,
  },
  {
    id: "cp-3",
    code: "EXPIRED10",
    description: "10% flash promo code",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 20,
    usageCount: 500,
    usageLimit: 500,
    startDate: "2026-05-01T00:00:00Z",
    endDate: "2026-05-15T23:59:59Z",
    isActive: false,
  },
];

export const CouponTable: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: 10,
    minOrderAmount: 0,
    usageLimit: 100,
  });

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount || 0,
        usageLimit: coupon.usageLimit || 100,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 0,
        usageLimit: 100,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error("Coupon code is required");
      return;
    }

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...formData } : c))
      );
      toast.success(`Coupon "${formData.code}" updated successfully!`);
    } else {
      const newCoupon: Coupon = {
        id: `cp-${Date.now()}`,
        ...formData,
        usageCount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        isActive: true,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      toast.success(`Coupon "${formData.code}" created successfully!`);
    }
    setIsModalOpen(false);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "ACTIVE" && c.isActive) ||
      (activeTab === "EXPIRED" && !c.isActive);
    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<Coupon>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Promo Code",
      cell: (c) => (
        <div>
          <span className="font-mono font-bold text-highlight tracking-wider text-xs px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
            {c.code}
          </span>
          <p className="text-[11px] text-secondary mt-1">{c.description}</p>
        </div>
      ),
    },
    {
      header: "Discount Value",
      cell: (c) => (
        <span className="font-bold text-primary">
          {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
        </span>
      ),
    },
    {
      header: "Min Spend",
      cell: (c) => <span className="text-primary font-medium">{formatCurrency(c.minOrderAmount || 0)}</span>,
    },
    {
      header: "Redemptions",
      cell: (c) => (
        <span className="font-semibold text-primary">
          {c.usageCount} / {c.usageLimit || "∞"} used
        </span>
      ),
    },
    {
      header: "Status",
      cell: (c) =>
        c.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Expired</Badge>
        ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (c) => (
        <TableActions>
          <TableActionButton onClick={() => handleOpenModal(c)} title="Edit Promo Code">
            <Edit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="danger"
            onClick={() => {
              setCoupons((prev) => prev.filter((item) => item.id !== c.id));
              toast.success(`Coupon ${c.code} deleted`);
            }}
            title="Delete Promo"
          >
            <Trash2 className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <CouponsSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredCoupons}
        columns={columns}
        keyExtractor={(c) => c.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "ACTIVE", "EXPIRED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "ALL" ? "All Coupons" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Right: Search & Create Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search promo code..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4" />
                New Coupon
              </Button>
            </div>
          </div>
        }
      />

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCoupon ? "Edit Coupon" : "Create New Coupon"}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <Input
              label="Coupon Code *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. DISCOUNT20"
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 20% off all gaming accessories"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Discount Value"
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                required
              />
              <Input
                label="Min Order Amount"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
