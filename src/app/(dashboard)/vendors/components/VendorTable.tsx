"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VendorProfile } from "@/types/vendor";
import { VendorsSkeleton } from "./VendorsSkeleton";
import { useAdminVendors, useUpdateVendorStatus } from "@/hooks/useAdminVendors";
import { toast } from "sonner";

export const VendorTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [statusChangingVendor, setStatusChangingVendor] = useState<{
    vendor: VendorProfile;
    newStatus: VendorProfile["status"];
  } | null>(null);

  const { data, isLoading } = useAdminVendors({
    searchTerm,
    status: activeTab,
    page,
    limit: pageSize,
  });

  const updateStatusMutation = useUpdateVendorStatus();

  const handleStatusChange = (
    vendor: VendorProfile,
    newStatus: VendorProfile["status"]
  ) => {
    if (vendor.status === newStatus) return;
    setStatusChangingVendor({ vendor, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangingVendor) return;
    const { vendor, newStatus } = statusChangingVendor;
    try {
      await updateStatusMutation.mutateAsync({
        id: vendor.id,
        status: newStatus,
      });
      toast.success(
        `Vendor "${vendor.storeName}" status updated to ${newStatus}`
      );
      setStatusChangingVendor(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update vendor status"
      );
    }
  };

  const vendors = data?.vendors || [];
  const meta = data?.meta;

  const columns: ColumnDef<VendorProfile>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: "Store & Brand",
      cell: (v) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-primary">{v.storeName}</span>
            {v.isVerified && (
              <span title="Verified Merchant">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-secondary">{v.storeEmail}</p>
        </div>
      ),
    },
    {
      header: "Sales Volume",
      cell: (v) => (
        <span className="font-bold text-emerald-600">
          {formatCurrency(v.totalSales || 0)}
        </span>
      ),
    },
    {
      header: "Commission",
      cell: (v) => <span className="font-bold text-primary">{v.commissionRate || 10}%</span>,
    },
    {
      header: "Products",
      cell: (v) => <span className="font-medium text-primary">{v.productCount || 0} active</span>,
    },
    {
      header: "Status",
      cell: (v) => {
        if (v.status === "APPROVED") return <Badge variant="success">Approved</Badge>;
        if (v.status === "PENDING") return <Badge variant="warning">Pending Review</Badge>;
        if (v.status === "SUSPENDED") return <Badge variant="danger">Suspended</Badge>;
        return <Badge variant="neutral">{v.status}</Badge>;
      },
    },
    {
      header: "Joined",
      cell: (v) => <span className="text-primary">{formatDate(v.createdAt)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (v) => (
        <TableActions>
          <TableActionButton onClick={() => setSelectedVendor(v)} title="Inspect Store Profile">
            <Eye className="w-4 h-4" />
          </TableActionButton>
          {v.status === "PENDING" ? (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleStatusChange(v, "APPROVED")}
              title="Approve Store"
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          ) : v.status === "APPROVED" ? (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleStatusChange(v, "SUSPENDED")}
              title="Suspend Store"
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="w-4 h-4 text-highlight" />
            </TableActionButton>
          ) : (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleStatusChange(v, "APPROVED")}
              title="Reinstate Store"
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading && !data) {
    return <VendorsSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={vendors}
        columns={columns}
        keyExtractor={(v) => v.id}
        page={page}
        pageSize={pageSize}
        totalItems={meta?.total ?? vendors.length}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "APPROVED", "PENDING", "SUSPENDED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab === "ALL" ? "All Vendors" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search store name or email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <Modal
          isOpen={!!selectedVendor}
          onClose={() => setSelectedVendor(null)}
          title={`Merchant Profile: ${selectedVendor.storeName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted border border-border">
              <div>
                <p className="text-secondary font-bold uppercase">Store Slug</p>
                <p className="font-mono text-primary font-semibold">{selectedVendor.slug}</p>
              </div>
              <div>
                <p className="text-secondary font-bold uppercase">Phone</p>
                <p className="text-primary font-semibold">{selectedVendor.storePhone}</p>
              </div>
              <div>
                <p className="text-secondary font-bold uppercase">Bank Account</p>
                <p className="text-primary font-semibold">{selectedVendor.bankName}</p>
              </div>
              <div>
                <p className="text-secondary font-bold uppercase">Total Lifetime Sales</p>
                <p className="text-emerald-600 font-bold text-sm">
                  {formatCurrency(selectedVendor.totalSales || 0)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedVendor(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Vendor Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!statusChangingVendor}
        onClose={() => {
          if (!updateStatusMutation.isPending) {
            setStatusChangingVendor(null);
          }
        }}
        onConfirm={handleConfirmStatusChange}
        title={
          statusChangingVendor?.newStatus === "SUSPENDED" ||
          statusChangingVendor?.newStatus === "REJECTED"
            ? `Suspend / Reject Merchant "${statusChangingVendor?.vendor.storeName}"`
            : `Set Merchant Status to ${statusChangingVendor?.newStatus}`
        }
        confirmText={
          statusChangingVendor?.newStatus === "SUSPENDED" ||
          statusChangingVendor?.newStatus === "REJECTED"
            ? "Confirm Suspension"
            : "Confirm Status Change"
        }
        variant={
          statusChangingVendor?.newStatus === "SUSPENDED" ||
          statusChangingVendor?.newStatus === "REJECTED"
            ? "danger"
            : "primary"
        }
        isLoading={updateStatusMutation.isPending}
        description={
          statusChangingVendor ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to change the status of store{" "}
                <span className="font-bold text-primary">
                  &quot;{statusChangingVendor.vendor.storeName}&quot;
                </span>{" "}
                to <span className="font-bold">{statusChangingVendor.newStatus}</span>?
              </p>
              <p className="text-[11px] text-secondary">
                {statusChangingVendor.newStatus === "APPROVED"
                  ? "The vendor will be authorized to manage products, process orders, and withdraw payouts."
                  : statusChangingVendor.newStatus === "SUSPENDED"
                  ? "Suspending this merchant will temporarily freeze their active store products from checkout."
                  : `Merchant status will update to ${statusChangingVendor.newStatus}.`}
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

