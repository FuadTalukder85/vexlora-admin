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
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VendorProfile } from "@/types/vendor";
import { VendorsSkeleton } from "./VendorsSkeleton";
import { toast } from "sonner";

const mockVendors: VendorProfile[] = [
  {
    id: "v-1",
    userId: "u-101",
    storeName: "Apex Gaming Gear",
    slug: "apex-gaming-gear",
    storeEmail: "contact@apexgaming.io",
    storePhone: "+1 (555) 234-5678",
    storeAddress: "101 Cyber Way, Austin, TX",
    status: "APPROVED",
    isVerified: true,
    totalSales: 48920.0,
    rating: 4.9,
    productCount: 42,
    commissionRate: 8.5,
    bankName: "Chase Bank (**** 4892)",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-09-12T00:00:00Z",
  },
  {
    id: "v-2",
    userId: "u-102",
    storeName: "Nordic Living Co.",
    slug: "nordic-living",
    storeEmail: "sales@nordicliving.se",
    storePhone: "+1 (555) 876-5432",
    storeAddress: "404 Fjord Blvd, Seattle, WA",
    status: "APPROVED",
    isVerified: true,
    totalSales: 94300.5,
    rating: 4.8,
    productCount: 28,
    commissionRate: 12.0,
    bankName: "Bank of America (**** 9123)",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
  {
    id: "v-3",
    userId: "u-103",
    storeName: "Quantum Soundworks",
    slug: "quantum-soundworks",
    storeEmail: "hi@quantumsound.com",
    storePhone: "+1 (555) 998-1122",
    storeAddress: "22 Audio St, Nashville, TN",
    status: "PENDING",
    isVerified: false,
    totalSales: 0,
    rating: 0,
    productCount: 6,
    commissionRate: 10.0,
    bankName: "Wells Fargo (**** 3321)",
    createdAt: "2026-09-15T00:00:00Z",
    updatedAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "v-4",
    userId: "u-104",
    storeName: "Velvet & Stone Studio",
    slug: "velvet-stone",
    storeEmail: "hello@velvetstone.co",
    storePhone: "+1 (555) 345-6789",
    storeAddress: "88 Fashion Ave, New York, NY",
    status: "SUSPENDED",
    isVerified: false,
    totalSales: 12400.0,
    rating: 3.2,
    productCount: 14,
    commissionRate: 15.0,
    bankName: "Citibank (**** 7765)",
    createdAt: "2026-03-10T00:00:00Z",
    updatedAt: "2026-09-08T00:00:00Z",
  },
];

export const VendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>(mockVendors);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (vendor: VendorProfile, newStatus: VendorProfile["status"]) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendor.id ? { ...v, status: newStatus } : v))
    );
    toast.success(`Vendor "${vendor.storeName}" status updated to ${newStatus}`);
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.storeEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "ALL" || v.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<VendorProfile>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>
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
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          ) : v.status === "APPROVED" ? (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleStatusChange(v, "SUSPENDED")}
              title="Suspend Store"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
            </TableActionButton>
          ) : (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleStatusChange(v, "APPROVED")}
              title="Reinstate Store"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <VendorsSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredVendors}
        columns={columns}
        keyExtractor={(v) => v.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "APPROVED", "PENDING", "SUSPENDED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "ALL" ? "All Vendors" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search store name or email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
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
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
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

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedVendor(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
