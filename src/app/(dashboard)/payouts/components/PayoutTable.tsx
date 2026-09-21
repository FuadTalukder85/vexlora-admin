"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Eye, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PayoutRequest } from "@/types/payout";
import { PayoutsSkeleton } from "./PayoutsSkeleton";
import { toast } from "sonner";

const mockPayouts: PayoutRequest[] = [
  {
    id: "pay-101",
    vendorId: "v-1",
    vendorName: "Apex Gaming Gear",
    amount: 14250.0,
    status: "PENDING",
    bankName: "Chase Bank",
    bankAccountNumber: "**** 4892",
    bankAccountName: "Apex Gaming Gear LLC",
    period: "Aug 01 - Aug 31, 2026",
    requestedAt: "2026-09-02T00:00:00Z",
  },
  {
    id: "pay-102",
    vendorId: "v-2",
    vendorName: "Nordic Living Co.",
    amount: 8340.2,
    status: "PAID",
    bankName: "Bank of America",
    bankAccountNumber: "**** 9123",
    bankAccountName: "Nordic Living Corp",
    period: "Jul 01 - Jul 31, 2026",
    requestedAt: "2026-08-02T00:00:00Z",
    processedAt: "2026-08-03T00:00:00Z",
  },
  {
    id: "pay-103",
    vendorId: "v-4",
    vendorName: "Velvet & Stone Studio",
    amount: 3200.0,
    status: "REJECTED",
    bankName: "Citibank",
    bankAccountNumber: "**** 7765",
    bankAccountName: "Velvet Stone Studio LLC",
    period: "Aug 01 - Aug 31, 2026",
    requestedAt: "2026-09-05T00:00:00Z",
    notes: "Account under risk review due to chargebacks",
  },
];

export const PayoutTable: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>(mockPayouts);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading] = useState(false);

  const handleAction = (payout: PayoutRequest, status: PayoutRequest["status"]) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === payout.id ? { ...p, status } : p))
    );
    toast.success(`Payout for ${payout.vendorName} marked as ${status}`);
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "ALL" || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<PayoutRequest>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Vendor & Period",
      cell: (p) => (
        <div>
          <p className="font-bold text-primary">{p.vendorName}</p>
          <p className="text-[11px] text-secondary">{p.period}</p>
        </div>
      ),
    },
    {
      header: "Bank & Account",
      cell: (p) => (
        <div>
          <p className="font-semibold text-primary">{p.bankName}</p>
          <p className="font-mono text-[11px] text-secondary">{p.bankAccountNumber}</p>
        </div>
      ),
    },
    {
      header: "Payout Amount",
      cell: (p) => (
        <span className="font-bold text-emerald-600 text-sm">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (p) => {
        if (p.status === "PAID") return <Badge variant="success">Transferred</Badge>;
        if (p.status === "PENDING") return <Badge variant="warning">Pending Approval</Badge>;
        if (p.status === "REJECTED") return <Badge variant="danger">Rejected</Badge>;
        return <Badge variant="neutral">{p.status}</Badge>;
      },
    },
    {
      header: "Requested",
      cell: (p) => <span className="text-primary">{formatDate(p.requestedAt)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (p) => (
        <TableActions>
          {p.status === "PENDING" && (
            <>
              <TableActionButton
                hoverVariant="emerald"
                onClick={() => handleAction(p, "PAID")}
                title="Approve Bank Wire"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </TableActionButton>
              <TableActionButton
                hoverVariant="danger"
                onClick={() => handleAction(p, "REJECTED")}
                title="Reject Transfer"
              >
                <XCircle className="w-4 h-4 text-highlight" />
              </TableActionButton>
            </>
          )}
          {p.status !== "PENDING" && (
            <TableActionButton
              onClick={() => toast.info(`Viewing wire confirmation for ${p.vendorName}`)}
              title="View Transfer Details"
            >
              <Eye className="w-4 h-4" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <PayoutsSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Pending Escrow Queue
          </span>
          <h2 className="text-3xl font-black text-amber-600">{formatCurrency(14250.0)}</h2>
          <p className="text-[11px] text-secondary">Awaiting Admin Wire Confirmation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Cleared Disbursements (MTD)
          </span>
          <h2 className="text-3xl font-black text-emerald-600">{formatCurrency(8340.2)}</h2>
          <p className="text-[11px] text-secondary">Settled to vendor accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Total Retained Commission
          </span>
          <h2 className="text-3xl font-black text-primary">{formatCurrency(2450.8)}</h2>
          <p className="text-[11px] text-secondary">Platform revenue</p>
        </div>
      </div>

      <PaginateTable
        data={filteredPayouts}
        columns={columns}
        keyExtractor={(p) => p.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "PENDING", "PAID", "REJECTED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab === "ALL" ? "All Payouts" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendor or bank..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};
