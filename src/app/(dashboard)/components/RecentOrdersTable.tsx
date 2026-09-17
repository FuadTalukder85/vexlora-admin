"use client";

import React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminOrder } from "@/types/order";

const mockRecentOrders: AdminOrder[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-9082",
    customerName: "Alex Montgomery",
    customerEmail: "alex.m@example.com",
    vendorName: "Apex Gaming Gear",
    items: [
      {
        id: "item-1",
        productId: "p-1",
        productName: "Pro Wireless Gaming Headset",
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99,
      },
    ],
    subtotal: 199.99,
    tax: 16.0,
    shipping: 10.0,
    discount: 0,
    total: 225.99,
    commissionTotal: 19.99,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentMethod: "Credit Card (Stripe)",
    createdAt: "2026-09-17T14:30:00Z",
    updatedAt: "2026-09-17T14:30:00Z",
  },
  {
    id: "ord-102",
    orderNumber: "ORD-9081",
    customerName: "Sophia Chen",
    customerEmail: "sophia.c@example.com",
    vendorName: "Nordic Living Co.",
    items: [
      {
        id: "item-2",
        productId: "p-2",
        productName: "Solid Oak Minimalist Desk",
        quantity: 1,
        unitPrice: 450.0,
        totalPrice: 450.0,
      },
    ],
    subtotal: 450.0,
    tax: 36.0,
    shipping: 50.0,
    discount: 25.0,
    total: 511.0,
    commissionTotal: 45.0,
    status: "PROCESSING",
    paymentStatus: "PAID",
    paymentMethod: "Apple Pay",
    createdAt: "2026-09-17T12:15:00Z",
    updatedAt: "2026-09-17T12:15:00Z",
  },
  {
    id: "ord-103",
    orderNumber: "ORD-9080",
    customerName: "Marcus Vance",
    customerEmail: "marcus.v@example.com",
    vendorName: "Aura Audio Labs",
    items: [
      {
        id: "item-3",
        productId: "p-3",
        productName: "Studio Monitor Reference Speakers",
        quantity: 2,
        unitPrice: 299.0,
        totalPrice: 598.0,
      },
    ],
    subtotal: 598.0,
    tax: 47.84,
    shipping: 0,
    discount: 50.0,
    total: 595.84,
    commissionTotal: 59.8,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "PayPal",
    createdAt: "2026-09-16T18:40:00Z",
    updatedAt: "2026-09-17T09:00:00Z",
  },
  {
    id: "ord-104",
    orderNumber: "ORD-9079",
    customerName: "Elena Rostova",
    customerEmail: "elena.r@example.com",
    vendorName: "Silk & Canvas Apparel",
    items: [
      {
        id: "item-4",
        productId: "p-4",
        productName: "Merino Wool Trench Coat",
        quantity: 1,
        unitPrice: 320.0,
        totalPrice: 320.0,
      },
    ],
    subtotal: 320.0,
    tax: 25.6,
    shipping: 15.0,
    discount: 0,
    total: 360.6,
    commissionTotal: 32.0,
    status: "SHIPPED",
    paymentStatus: "PAID",
    paymentMethod: "Credit Card (Stripe)",
    createdAt: "2026-09-16T15:20:00Z",
    updatedAt: "2026-09-16T20:00:00Z",
  },
];

const getStatusBadge = (status: AdminOrder["status"]) => {
  switch (status) {
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "CONFIRMED":
    case "PROCESSING":
      return <Badge variant="primary">{status}</Badge>;
    case "SHIPPED":
      return <Badge variant="info">Shipped</Badge>;
    case "CANCELLED":
    case "REFUNDED":
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const RecentOrdersTable: React.FC = () => {
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
          <span className="font-bold text-primary">{o.orderNumber}</span>
          <p className="text-[10px] text-secondary font-mono">{o.paymentMethod}</p>
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
      header: "Vendor",
      cell: (o) => <span className="font-medium text-primary">{o.vendorName || "Platform"}</span>,
    },
    {
      header: "Total GMV",
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
      cell: (o) => getStatusBadge(o.status),
    },
    {
      header: "Date",
      cell: (o) => <span className="text-primary">{formatDate(o.createdAt)}</span>,
    },
    {
      header: "Action",
      align: "right",
      cell: () => (
        <TableActions>
          <TableActionButton as={Link} href="/orders" title="View Order Details">
            <Eye className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  return (
    <PaginateTable
      title="Live Marketplace Orders"
      subtitle="Recent customer purchases and commission deductions across all active vendors"
      data={mockRecentOrders}
      columns={columns}
      keyExtractor={(o) => o.id}
      defaultPageSize={5}
      action={
        <Link href="/orders">
          <Button variant="outline" size="sm">
            View All Orders
          </Button>
        </Link>
      }
    />
  );
};
