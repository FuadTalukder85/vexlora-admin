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
import { useAdminOrders } from "@/hooks/useAdminOrders";

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
  const { data } = useAdminOrders({ limit: 5 });
  const orders = data?.orders || [];

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
          <p className="text-[10px] text-secondary font-mono capitalize">{o.paymentMethod}</p>
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
      data={orders}
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

