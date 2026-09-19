import React from "react";
import Image from "next/image";
import { Eye, CheckCircle, Ban, Trash2, Package, Store } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency } from "@/lib/utils";
import { Product, ProductStatus } from "@/types/product";

export const getStatusBadge = (status: ProductStatus) => {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "OUT_OF_STOCK":
      return <Badge variant="warning">Out of Stock</Badge>;
    case "BLOCKED":
      return <Badge variant="danger">Blocked</Badge>;
    case "DRAFT":
      return <Badge variant="neutral">Draft</Badge>;
    case "REJECTED":
      return <Badge variant="danger">Rejected</Badge>;
    case "ARCHIVED":
      return <Badge variant="neutral">Archived</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

interface GetProductTableColumnsProps {
  page: number;
  pageSize: number;
  onInspect: (product: Product) => void;
  onToggleBlock: (product: Product) => void;
  onDelete: (product: Product) => void;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
}

export const getProductTableColumns = ({
  page,
  pageSize,
  onInspect,
  onToggleBlock,
  onDelete,
  isUpdatingStatus = false,
  isDeleting = false,
}: GetProductTableColumnsProps): ColumnDef<Product>[] => [
  {
    header: "SL",
    cell: (_, idx) => (
      <span className="font-semibold text-slate-500 text-xs">
        {(page - 1) * pageSize + idx + 1}
      </span>
    ),
  },
  {
    header: "Product & Vendor",
    cell: (p) => {
      const firstImg =
        Array.isArray(p.images) && p.images.length > 0
          ? typeof p.images[0] === "string"
            ? p.images[0]
            : p.images[0].url
          : null;

      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
            {firstImg ? (
              <Image
                src={firstImg}
                alt={p.name || p.title || "Product"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                <Package className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-primary text-xs line-clamp-1">
              {p.name || p.title}
            </p>
            <p className="text-[11px] text-secondary font-medium flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400" />
              Sold by{" "}
              <strong className="text-primary">
                {p.vendor?.storeName || "Unknown Vendor"}
              </strong>
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: "Category",
    cell: (p) => (
      <span className="font-medium text-primary text-xs">
        {typeof p.category === "object"
          ? p.category?.name || "General"
          : p.category || "General"}
      </span>
    ),
  },
  {
    header: "Price",
    cell: (p) => (
      <div>
        <span className="font-bold text-primary text-xs block">
          {formatCurrency(Number(p.basePrice) || 0)}
        </span>
        {p.discountPrice && Number(p.discountPrice) < Number(p.basePrice) && (
          <span className="text-[10px] text-emerald-600 font-semibold">
            Sale: {formatCurrency(Number(p.discountPrice))}
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Stock",
    cell: (p) => {
      const stockVal = p.stock ?? p.totalStock ?? 0;
      return (
        <span
          className={
            stockVal === 0
              ? "font-bold text-rose-600 text-xs"
              : stockVal < 15
                ? "font-semibold text-amber-600 text-xs"
                : "font-semibold text-primary text-xs"
          }
        >
          {stockVal} units
        </span>
      );
    },
  },
  {
    header: "Status",
    cell: (p) => getStatusBadge(p.status),
  },
  {
    header: "Actions",
    align: "right",
    cell: (p) => (
      <TableActions>
        <TableActionButton
          onClick={() => onInspect(p)}
          title="Inspect Product"
        >
          <Eye className="w-4 h-4" />
        </TableActionButton>
        {p.status === "BLOCKED" ? (
          <TableActionButton
            hoverVariant="emerald"
            onClick={() => onToggleBlock(p)}
            title="Unblock Product"
            disabled={isUpdatingStatus}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </TableActionButton>
        ) : (
          <TableActionButton
            hoverVariant="danger"
            onClick={() => onToggleBlock(p)}
            title="Block / Moderate Product"
            disabled={isUpdatingStatus}
          >
            <Ban className="w-4 h-4 text-rose-600" />
          </TableActionButton>
        )}
        <TableActionButton
          hoverVariant="danger"
          onClick={() => onDelete(p)}
          title="Delete Product"
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </TableActionButton>
      </TableActions>
    ),
  },
];
