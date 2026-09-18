"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PaginateTable } from "@/components/ui/PaginateTable";
import { Product, ProductStatus } from "@/types/product";
import { ProductsSkeleton } from "./ProductsSkeleton";
import { ProductDetailModal } from "./ProductDetailModal";
import { getProductTableColumns } from "./ProductTableColumns";
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
        `Product "${product.name || product.title}" is now ${
          newStatus === "BLOCKED" ? "Blocked from Catalog" : "Active"
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

      toast.success(`Product status changed to ${newStatus}`);

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

  const columns = useMemo(
    () =>
      getProductTableColumns({
        page,
        pageSize,
        onInspect: (p) => setSelectedProduct(p),
        onToggleBlock: handleToggleBlock,
        onDelete: handleDelete,
        isUpdatingStatus: updateStatusMutation.isPending,
        isDeleting: deleteProductMutation.isPending,
      }),
    [page, pageSize, updateStatusMutation.isPending, deleteProductMutation.isPending]
  );

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
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === key
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
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onStatusChange={handleStatusChange}
        onToggleBlock={handleToggleBlock}
        onDelete={handleDelete}
        isUpdatingStatus={updateStatusMutation.isPending}
        isDeleting={deleteProductMutation.isPending}
      />
    </div>
  );
};
