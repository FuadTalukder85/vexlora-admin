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

const mockOrders: AdminOrder[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-9021",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@example.com",
    vendorName: "Apex Gaming Gear",
    items: [
      {
        id: "i-1",
        productId: "p-101",
        productName: "Pro Wireless Mechanical Gaming Keyboard",
        quantity: 1,
        unitPrice: 149.99,
        totalPrice: 149.99,
      },
    ],
    subtotal: 149.99,
    tax: 12.0,
    shipping: 10.0,
    discount: 0,
    total: 171.99,
    commissionTotal: 12.75,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentMethod: "Stripe Card (**** 4242)",
    createdAt: "2026-09-17T10:00:00Z",
    updatedAt: "2026-09-17T10:00:00Z",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-9020",
    customerName: "David Miller",
    customerEmail: "david.m@example.com",
    vendorName: "Nordic Living Co.",
    items: [
      {
        id: "i-2",
        productId: "p-102",
        productName: "Ergonomic Walnut Desk Riser",
        quantity: 1,
        unitPrice: 220.0,
        totalPrice: 220.0,
      },
    ],
    subtotal: 220.0,
    tax: 17.6,
    shipping: 15.0,
    discount: 20.0,
    total: 232.6,
    commissionTotal: 26.4,
    status: "PROCESSING",
    paymentStatus: "PAID",
    paymentMethod: "Apple Pay",
    createdAt: "2026-09-16T16:30:00Z",
    updatedAt: "2026-09-16T18:00:00Z",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-9019",
    customerName: "Emily Zhang",
    customerEmail: "emily.z@example.com",
    vendorName: "Silk & Canvas Apparel",
    items: [
      {
        id: "i-3",
        productId: "p-103",
        productName: "Oversized Minimalist Jacket",
        quantity: 2,
        unitPrice: 180.0,
        totalPrice: 360.0,
      },
    ],
    subtotal: 360.0,
    tax: 28.8,
    shipping: 0,
    discount: 0,
    total: 388.8,
    commissionTotal: 54.0,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "PayPal",
    createdAt: "2026-09-15T11:20:00Z",
    updatedAt: "2026-09-17T08:30:00Z",
  },
];

export const OrderTable: React.FC = () => {
  const [orders] = useState<AdminOrder[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isLoading] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "ALL" || o.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<AdminOrder>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Order Number",
      cell: (o) => (
        <div>
          <span className="font-bold text-primary block">{o.orderNumber}</span>
          <span className="text-[10px] text-secondary font-mono">{o.paymentMethod}</span>
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

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(o) => o.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "CONFIRMED", "PROCESSING", "DELIVERED", "CANCELLED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "ALL" ? "All Orders" : tab.charAt(0) + tab.slice(1).toLowerCase()}
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
                placeholder="Search order number, customer name, email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
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
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <p className="font-bold text-primary">Items Ordered:</p>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1 border-b border-slate-200/50">
                  <span>
                    {item.productName} (x{item.quantity})
                  </span>
                  <span className="font-bold text-primary">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-secondary">Total Commission Deducted</span>
              <span className="font-bold text-emerald-600 text-sm">
                {formatCurrency(selectedOrder.commissionTotal)}
              </span>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
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
