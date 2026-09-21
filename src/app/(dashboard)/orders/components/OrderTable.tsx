"use client";

import React, { useState } from "react";
import { Search, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminOrder } from "@/types/order";
import { OrdersSkeleton } from "./OrdersSkeleton";
import { useAdminOrders } from "@/hooks/useAdminOrders";

export const OrderTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data, isLoading } = useAdminOrders({
    searchTerm,
    paymentStatus: activeTab === "ALL" ? undefined : activeTab === "CONFIRMED" || activeTab === "PROCESSING" || activeTab === "DELIVERED" ? undefined : activeTab,
    page,
    limit: pageSize,
  });

  const rawOrders = data?.orders || [];
  const meta = data?.meta;

  const filteredOrders = rawOrders.filter((o) => {
    if (activeTab === "ALL") return true;
    return o.status === activeTab || o.paymentStatus === activeTab;
  });

  const columns: ColumnDef<AdminOrder>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: "Order Number",
      cell: (o) => (
        <div>
          <span className="font-bold text-primary block">{o.orderNumber}</span>
          <span className="text-[10px] text-secondary font-mono capitalize">{o.paymentMethod}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (o) => (
        <div>
          <p className="font-semibold text-primary">{o.customerName}</p>
          <p className="text-[11px] text-secondary">{o.customerEmail}</p>
        </div>
      ),
    },
    {
      header: "Seller",
      cell: (o) => <span className="font-medium text-primary">{o.vendorName}</span>,
    },
    {
      header: "Order Total",
      cell: (o) => <span className="font-bold text-primary">{formatCurrency(o.total)}</span>,
    },
    {
      header: "Platform Cut",
      cell: (o) => (
        <span className="font-bold text-emerald-600">
          +{formatCurrency(o.commissionTotal)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (o) => (
        <Badge
          variant={
            o.status === "DELIVERED"
              ? "success"
              : o.status === "CONFIRMED"
              ? "primary"
              : o.status === "CANCELLED"
              ? "danger"
              : "neutral"
          }
        >
          {o.status}
        </Badge>
      ),
    },
    {
      header: "Date",
      cell: (o) => <span className="text-primary">{formatDate(o.createdAt)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (o) => (
        <TableActions>
          <TableActionButton onClick={() => setSelectedOrder(o)} title="Inspect Full Order">
            <Eye className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading && !data) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(o) => o.id}
        page={page}
        pageSize={pageSize}
        totalItems={meta?.total ?? filteredOrders.length}
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
              {["ALL", "CONFIRMED", "PROCESSING", "DELIVERED", "CANCELLED"].map((tab) => (
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
                  {tab === "ALL" ? "All Orders" : tab.charAt(0) + tab.slice(1).toLowerCase()}
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
                placeholder="Search order number, customer name, email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Inspection: ${selectedOrder.orderNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-muted border border-border space-y-2">
              <p className="font-bold text-primary">Items Ordered:</p>
              {selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-border/50">
                    <span>
                      {item.productName} (x{item.quantity})
                    </span>
                    <span className="font-bold text-primary">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))
              ) : (
                <p className="text-secondary">No items details found</p>
              )}
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-xl">
              <span className="font-bold text-secondary">Total Commission Deducted</span>
              <span className="font-bold text-emerald-600 text-sm">
                {formatCurrency(selectedOrder.commissionTotal)}
              </span>
            </div>
            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

