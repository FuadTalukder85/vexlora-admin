"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  CheckCircle,
  Ban,
  Eye,
  Trash2,
  Package,
  Store,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency } from "@/lib/utils";
import { Product, ProductStatus } from "@/types/product";
import { ProductsSkeleton } from "./ProductsSkeleton";
import {
  useAdminProducts,
  useUpdateProductStatus,
  useDeleteProduct,
} from "@/hooks/useAdminProducts";
import { toast } from "sonner";

export const ProductTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Queries & Mutations with server pagination
  const { data, isLoading, isError, error, refetch } = useAdminProducts({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
    status: activeTab !== "ALL" ? activeTab : undefined,
  });

  const updateStatusMutation = useUpdateProductStatus();
  const deleteProductMutation = useDeleteProduct();

  const products = data?.products || [];
  const meta = data?.meta;

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleToggleBlock = async (product: Product) => {
    const newStatus: ProductStatus =
      product.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";

    try {
      await updateStatusMutation.mutateAsync({
        id: product.id,
        status: newStatus,
      });

      toast.success(
        `Product "${product.name || product.title}" is now ${newStatus === "BLOCKED" ? "Blocked from Catalog" : "Active"
        }`
      );

      if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct({ ...selectedProduct, status: newStatus });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update product status.";
      toast.error(msg);
    }
  };

  const handleStatusChange = async (product: Product, newStatus: ProductStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: product.id,
        status: newStatus,
      });

      toast.success(
        `Product status changed to ${newStatus}`
      );

      if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct({ ...selectedProduct, status: newStatus });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update product status.";
      toast.error(msg);
    }
  };

  const handleDelete = async (product: Product) => {
    if (
      !confirm(
        `Are you sure you want to delete product "${product.name || product.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(product.id);
      toast.success(`Product "${product.name || product.title}" deleted.`);
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete product.";
      toast.error(msg);
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
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

  const columns: ColumnDef<Product>[] = [
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
            onClick={() => setSelectedProduct(p)}
            title="Inspect Product"
          >
            <Eye className="w-4 h-4" />
          </TableActionButton>
          {p.status === "BLOCKED" ? (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleToggleBlock(p)}
              title="Unblock Product"
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          ) : (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleToggleBlock(p)}
              title="Block / Moderate Product"
              disabled={updateStatusMutation.isPending}
            >
              <Ban className="w-4 h-4 text-rose-600" />
            </TableActionButton>
          )}
          <TableActionButton
            hoverVariant="danger"
            onClick={() => handleDelete(p)}
            title="Delete Product"
            disabled={deleteProductMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading && products.length === 0) {
    return <ProductsSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-xs space-y-3">
        <p className="text-rose-600 font-bold text-sm">
          Failed to load marketplace products.
        </p>
        <p className="text-xs text-slate-500">
          {(error as any)?.message || "Please check your network and API connection."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={products}
        columns={columns}
        keyExtractor={(p) => p.id}
        page={page}
        pageSize={pageSize}
        totalItems={meta?.total ?? products.length}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {[
                { key: "ALL", label: "All Products" },
                { key: "ACTIVE", label: "Active" },
                { key: "OUT_OF_STOCK", label: "Out of Stock" },
                { key: "BLOCKED", label: "Blocked" },
                { key: "DRAFT", label: "Draft" },
                { key: "REJECTED", label: "Rejected" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search product title, vendor store, or brand..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Product Details: ${selectedProduct.name || selectedProduct.title}`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-xs">
            {/* Image Gallery */}
            {Array.isArray(selectedProduct.images) &&
              selectedProduct.images.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {selectedProduct.images.map((img: any, idx: number) => {
                    const url = typeof img === "string" ? img : img.url;
                    return (
                      <div
                        key={idx}
                        className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0"
                      >
                        <Image
                          src={url}
                          alt={`Product image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Vendor & Category Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase">
                  Vendor & Store
                </p>
                <p className="text-primary font-bold text-sm">
                  {selectedProduct.vendor?.storeName || "Unassigned Store"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-secondary font-bold uppercase">
                  Category
                </p>
                <p className="text-primary font-bold text-sm">
                  {typeof selectedProduct.category === "object"
                    ? selectedProduct.category?.name
                    : selectedProduct.category || "General"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-secondary font-bold uppercase">
                  Status
                </p>
                <div className="pt-0.5">
                  {getStatusBadge(selectedProduct.status)}
                </div>
              </div>
            </div>

            {/* Pricing & Stock Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-secondary font-bold uppercase text-[10px]">
                  Base Price
                </p>
                <p className="text-primary font-black text-sm">
                  {formatCurrency(Number(selectedProduct.basePrice) || 0)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-secondary font-bold uppercase text-[10px]">
                  Discount Price
                </p>
                <p className="text-emerald-600 font-black text-sm">
                  {selectedProduct.discountPrice
                    ? formatCurrency(Number(selectedProduct.discountPrice))
                    : "None"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-secondary font-bold uppercase text-[10px]">
                  Total Stock
                </p>
                <p className="text-primary font-black text-sm">
                  {selectedProduct.stock ?? selectedProduct.totalStock ?? 0} units
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-secondary font-bold uppercase text-[10px]">
                  Rating / Reviews
                </p>
                <p className="text-primary font-black text-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {selectedProduct.ratingAvg ? Number(selectedProduct.ratingAvg).toFixed(1) : "0.0"}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({selectedProduct.ratingCount ?? 0})
                  </span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <p className="text-secondary font-bold uppercase text-[10px]">
                Product Description
              </p>
              <p className="text-primary leading-relaxed">
                {selectedProduct.description || "No description provided."}
              </p>
            </div>

            {/* Variants if any */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-secondary font-bold uppercase text-[10px]">
                  Product Variants ({selectedProduct.variants.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {selectedProduct.variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-medium text-slate-700">
                        {v.sku}
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(Number(v.price))} • {v.stock} in stock
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Status Moderation */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">Admin Status Moderation</p>
                <p className="text-[11px] text-secondary">
                  Update product visibility and status across marketplace
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={selectedProduct.status === "ACTIVE" ? "outline" : "primary"}
                  onClick={() => handleStatusChange(selectedProduct, "ACTIVE")}
                  disabled={updateStatusMutation.isPending || selectedProduct.status === "ACTIVE"}
                >
                  Set Active
                </Button>
                <Button
                  size="sm"
                  variant={selectedProduct.status === "BLOCKED" ? "outline" : "danger"}
                  onClick={() => handleToggleBlock(selectedProduct)}
                  disabled={updateStatusMutation.isPending}
                >
                  {selectedProduct.status === "BLOCKED" ? "Unblock" : "Block"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(selectedProduct, "REJECTED")}
                  disabled={updateStatusMutation.isPending || selectedProduct.status === "REJECTED"}
                >
                  Reject
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => handleDelete(selectedProduct)}
                disabled={deleteProductMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Listing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
