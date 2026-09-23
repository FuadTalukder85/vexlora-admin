"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Ban,
  Search,
  Check,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { AdminReviewDealModal, DealRequestItem } from "./AdminReviewDealModal";
import { AdminDirectDealModal } from "./AdminDirectDealModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { DealsSkeleton } from "./DealsSkeleton";
import { getAdminSocket } from "@/lib/socket";
import { toast } from "sonner";

export interface DealItem {
  id: string;
  title?: string | null;
  dealPrice: number;
  originalPrice: number;
  quantityLimit?: number | null;
  soldCount: number;
  startAt: string;
  endAt: string;
  status: "SCHEDULED" | "ACTIVE" | "EXPIRED" | "SOLD_OUT" | "CANCELLED";
  discountPercent: number;
  soldPercentage: number;
  product: {
    id: string;
    title: string;
    images: string[];
    vendor?: {
      storeName: string;
    };
  };
}

export const DealsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"requests" | "activeDeals">("requests");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<DealRequestItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [reviewingRequest, setReviewingRequest] = useState<DealRequestItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">("APPROVED");

  // Direct Deal Modal State
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Array<{ id: string; title: string; basePrice: number; vendor?: { storeName: string } }>>([]);
  const [cancellingDealId, setCancellingDealId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [reqRes, dealsRes] = await Promise.all([
        apiClient.get("/deals/requests/admin?limit=100"),
        apiClient.get("/deals?limit=100"),
      ]);

      if (reqRes.data?.data) {
        setRequests(reqRes.data.data);
      }
      if (dealsRes.data?.data) {
        setDeals(dealsRes.data.data);
      }
    } catch (err: unknown) {
      if (!silent) {
        console.error("Failed to load admin deals data:", err);
        toast.error("Failed to load deals data");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // 1. Connect to WebSocket & join admin room
    const socket = getAdminSocket();

    const handleNewDealRequest = (payload: any) => {
      fetchData(true);
      toast.info(payload.message || "New vendor deal request submitted!", {
        duration: 4000,
      });
    };

    const handleDealUpdated = () => {
      fetchData(true);
    };

    socket.on("DEAL_REQUEST_CREATED", handleNewDealRequest);
    socket.on("DEAL_REQUEST_REVIEWED", handleDealUpdated);
    socket.on("DEAL_UPDATED", handleDealUpdated);

    return () => {
      socket.off("DEAL_REQUEST_CREATED", handleNewDealRequest);
      socket.off("DEAL_REQUEST_REVIEWED", handleDealUpdated);
      socket.off("DEAL_UPDATED", handleDealUpdated);
    };
  }, [fetchData]);

  const handleOpenDirectModal = async () => {
    setIsDirectModalOpen(true);
    try {
      const res = await apiClient.get("/products?limit=100&status=ACTIVE");
      if (res.data?.data) {
        setAllProducts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleCancelDeal = (dealId: string) => {
    setCancellingDealId(dealId);
  };

  const handleConfirmCancelDeal = async () => {
    if (!cancellingDealId) return;

    setIsCancelling(true);
    try {
      await apiClient.patch(`/deals/${cancellingDealId}/cancel`);
      toast.success("Deal cancelled successfully");
      setCancellingDealId(null);
      fetchData(true);
    } catch {
      toast.error("Failed to cancel deal");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <DealsSkeleton />;
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const liveDeals = deals.filter((d) => d.status === "ACTIVE");
  const scheduledDeals = deals.filter((d) => d.status === "SCHEDULED");
  const totalDealsSoldCount = deals.reduce((acc, d) => acc + (d.soldCount || 0), 0);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendor?.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter deals
  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      d.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.product?.vendor?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.title && d.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Request Columns
  const requestColumns: ColumnDef<DealRequestItem>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Product & Vendor",
      cell: (req) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-muted/60 border border-border shrink-0">
            <Image
              src={req.product?.images?.[0] || "/placeholder-product.png"}
              alt={req.product?.title || "Product"}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
            <p className="text-xs font-bold text-primary truncate">
              {req.product?.title}
            </p>
            <p className="text-[11px] text-secondary">
              Vendor: <span className="font-semibold text-primary">{req.vendor?.storeName}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Price Comparison",
      cell: (req) => {
        const discount = Math.round(
          (((req.product?.basePrice || 0) - req.proposedDealPrice) /
            (req.product?.basePrice || 1)) *
          100
        );
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-primary">
                {formatCurrency(req.proposedDealPrice)}
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-highlight/10 text-highlight">
                -{discount}%
              </span>
            </div>
            <p className="text-[11px] text-secondary line-through">
              {formatCurrency(req.product?.basePrice || 0)}
            </p>
          </div>
        );
      },
    },
    {
      header: "Duration",
      cell: (req) => (
        <div className="text-[11px] text-secondary space-y-0.5">
          <div><span className="font-medium text-primary">From:</span> {formatDate(req.requestedStartAt)}</div>
          <div><span className="font-medium text-primary">To:</span> {formatDate(req.requestedEndAt)}</div>
        </div>
      ),
    },
    {
      header: "Review Status",
      cell: (req) => {
        switch (req.status) {
          case "PENDING":
            return <Badge variant="warning">Pending Review</Badge>;
          case "APPROVED":
            return <Badge variant="success">Approved</Badge>;
          case "REJECTED":
            return <Badge variant="danger">Rejected</Badge>;
          default:
            return <Badge variant="neutral">{req.status}</Badge>;
        }
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (req) =>
        req.status === "PENDING" ? (
          <TableActions>
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => {
                setReviewingRequest(req);
                setReviewAction("APPROVED");
              }}
              title="Approve Proposal"
            >
              <Check className="w-4 h-4 text-success" />
            </TableActionButton>
            <TableActionButton
              hoverVariant="danger"
              onClick={() => {
                setReviewingRequest(req);
                setReviewAction("REJECTED");
              }}
              title="Reject Proposal"
            >
              <X className="w-4 h-4 text-danger" />
            </TableActionButton>
          </TableActions>
        ) : (
          <span className="text-[11px] text-secondary/60 italic">—</span>
        ),
    },
  ];

  // Deal Columns
  const dealColumns: ColumnDef<DealItem>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Deal Title / Product",
      cell: (deal) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-muted/60 border border-border shrink-0">
            <Image
              src={deal.product?.images?.[0] || "/placeholder-product.png"}
              alt={deal.product?.title || "Product"}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
            <p className="text-xs font-bold text-primary truncate">
              {deal.title || deal.product?.title}
            </p>
            <p className="text-[11px] text-secondary">
              Vendor: {deal.product?.vendor?.storeName || "Platform"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Pricing",
      cell: (deal) => (
        <div>
          <span className="text-xs font-bold text-primary">{formatCurrency(deal.dealPrice)}</span>
          <span className="ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-highlight/10 text-highlight">
            -{deal.discountPercent}%
          </span>
          <p className="text-[11px] text-secondary line-through">{formatCurrency(deal.originalPrice)}</p>
        </div>
      ),
    },
    {
      header: "Progress & Quota",
      cell: (deal) => (
        <div className="w-32 space-y-1">
          <div className="flex justify-between text-[10px] text-secondary font-medium">
            <span>Sold: {deal.soldCount}</span>
            <span>{deal.quantityLimit ? `/ ${deal.quantityLimit}` : "(Unlimited)"}</span>
          </div>
          {deal.quantityLimit && (
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-highlight h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(deal.soldPercentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Schedule",
      cell: (deal) => (
        <div className="text-[11px] text-secondary space-y-0.5">
          <div><span className="font-medium text-primary">From:</span> {formatDate(deal.startAt)}</div>
          <div><span className="font-medium text-primary">To:</span> {formatDate(deal.endAt)}</div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (deal) => {
        switch (deal.status) {
          case "ACTIVE":
            return <Badge variant="success">Live Now</Badge>;
          case "SCHEDULED":
            return <Badge variant="warning">Scheduled</Badge>;
          case "EXPIRED":
            return <Badge variant="neutral">Expired</Badge>;
          case "SOLD_OUT":
            return <Badge variant="danger">Sold Out</Badge>;
          case "CANCELLED":
            return <Badge variant="danger">Cancelled</Badge>;
          default:
            return <Badge variant="neutral">{deal.status}</Badge>;
        }
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (deal) =>
        deal.status === "ACTIVE" || deal.status === "SCHEDULED" ? (
          <TableActions>
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleCancelDeal(deal.id)}
              title="Cancel Flash Deal"
            >
              <Ban className="w-4 h-4 text-danger" />
            </TableActionButton>
          </TableActions>
        ) : (
          <span className="text-[11px] text-secondary/60 italic">—</span>
        ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <StatCard
          title="Pending Approvals"
          value={pendingRequests.length}
          icon={Clock}
          iconColorClass="text-warning bg-warning/10"
        />
        <StatCard
          title="Live Flash Deals"
          value={liveDeals.length}
          icon={Flame}
          iconColorClass="text-highlight bg-highlight/10"
        />
        <StatCard
          title="Scheduled Deals"
          value={scheduledDeals.length}
          icon={CheckCircle2}
          iconColorClass="text-success bg-success/10"
        />
        <StatCard
          title="Total Deals Sold"
          value={totalDealsSoldCount}
          icon={Flame}
          iconColorClass="text-primary bg-muted"
        />
      </div>

      {/* 2. Mode Tabs & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white p-3 rounded-2xl border border-border">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab("requests");
              setStatusFilter("ALL");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "requests"
                ? "bg-primary text-white shadow-xs"
                : "text-secondary hover:text-primary hover:bg-muted"
              }`}
          >
            Vendor Proposals ({requests.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("activeDeals");
              setStatusFilter("ALL");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "activeDeals"
                ? "bg-primary text-white shadow-xs"
                : "text-secondary hover:text-primary hover:bg-muted"
              }`}
          >
            Flash Deals Master List ({deals.length})
          </button>
        </div>

        {/* Right Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenDirectModal}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Direct Deal
        </Button>
      </div>

      {/* 3. PaginateTable Area */}
      {activeTab === "requests" ? (
        <PaginateTable
          data={filteredRequests}
          columns={requestColumns}
          keyExtractor={(r) => r.id}
          defaultPageSize={15}
          className="flex-1 min-h-0"
          headerContent={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${statusFilter === st
                        ? "border-primary text-primary"
                        : "border-transparent text-secondary hover:text-primary"
                      }`}
                  >
                    {st === "ALL" ? "All Requests" : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search proposals..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          }
        />
      ) : (
        <PaginateTable
          data={filteredDeals}
          columns={dealColumns}
          keyExtractor={(d) => d.id}
          defaultPageSize={15}
          className="flex-1 min-h-0"
          headerContent={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
                {["ALL", "ACTIVE", "SCHEDULED", "EXPIRED", "SOLD_OUT", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${statusFilter === st
                        ? "border-primary text-primary"
                        : "border-transparent text-secondary hover:text-primary"
                      }`}
                  >
                    {st === "ALL" ? "All Deals" : st.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search deals..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          }
        />
      )}

      {/* Review Modal */}
      <AdminReviewDealModal
        request={reviewingRequest}
        action={reviewAction}
        onClose={() => setReviewingRequest(null)}
        onSuccess={fetchData}
      />

      {/* Direct Deal Creation Modal */}
      <AdminDirectDealModal
        isOpen={isDirectModalOpen}
        onClose={() => setIsDirectModalOpen(false)}
        products={allProducts}
        onSuccess={fetchData}
      />

      {/* Cancel Deal Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancellingDealId}
        onClose={() => {
          if (!isCancelling) {
            setCancellingDealId(null);
          }
        }}
        onConfirm={handleConfirmCancelDeal}
        title="Cancel Promotional Deal"
        confirmText="Cancel Deal"
        variant="danger"
        isLoading={isCancelling}
        description="Are you sure you want to cancel this flash deal immediately? The product pricing will revert back to its standard catalogue price."
      />
    </div>
  );
};
