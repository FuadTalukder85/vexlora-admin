"use client";

import React, { useMemo, useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PaginateTable } from "@/components/ui/PaginateTable";
import { Product, ProductStatus } from "@/types/product";
import { ProductsSkeleton } from "./ProductsSkeleton";
import { ProductDetailModal } from "./ProductDetailModal";
import { getProductTableColumns } from "./ProductTableColumns";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  useAdminProducts,
  useUpdateProductStatus,
  useDeleteProduct,
} from "@/hooks/useAdminProducts";
import { toast } from "sonner";

export const ProductTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [statusChangingProduct, setStatusChangingProduct] = useState<{
    product: Product;
    newStatus: ProductStatus;
  } | null>(null);

  // Queries & Mutations with server pagination
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminProducts({
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

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  const handleToggleBlock = (product: Product) => {
    const newStatus: ProductStatus =
      product.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setStatusChangingProduct({ product, newStatus });
  };

  const handleStatusChange = (product: Product, newStatus: ProductStatus) => {
    if (product.status === newStatus) return;
    setStatusChangingProduct({ product, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangingProduct) return;
    const { product, newStatus } = statusChangingProduct;
    try {
      await updateStatusMutation.mutateAsync({
        id: product.id,
        status: newStatus,
      });

      toast.success(
        `Product "${product.name || product.title}" is now ${
          newStatus === "BLOCKED" ? "Blocked from Catalog" : newStatus
        }`
      );

      if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct({ ...selectedProduct, status: newStatus });
      }
      setStatusChangingProduct(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update product status.";
      toast.error(msg);
    }
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProductMutation.mutateAsync(deletingProduct.id);
      toast.success(`Product "${deletingProduct.name || deletingProduct.title}" deleted.`);
      if (selectedProduct?.id === deletingProduct.id) {
        setSelectedProduct(null);
      }
      setDeletingProduct(null);
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
        <p className="text-highlight font-bold text-sm">
          Failed to load marketplace products.
        </p>
        <p className="text-xs text-secondary">
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
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
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
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                placeholder="Search product title or brand… Press Enter"
                className="w-full pl-4 pr-10 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={
                  Boolean(searchTerm.trim()) && !isFetching
                    ? handleClearSearch
                    : handleSearchSubmit
                }
                disabled={isFetching}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors cursor-pointer disabled:cursor-default"
                aria-label={
                  Boolean(searchTerm.trim()) && !isFetching
                    ? "Clear search"
                    : "Search products"
                }
              >
                {isFetching && searchTerm.trim() ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : searchTerm.trim() ? (
                  <X className="w-4 h-4 text-secondary hover:text-secondary transition-colors" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
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

      {/* Delete Product Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingProduct}
        onClose={() => {
          if (!deleteProductMutation.isPending) {
            setDeletingProduct(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Marketplace Product"
        confirmText="Delete Product"
        variant="danger"
        isLoading={deleteProductMutation.isPending}
        description={
          deletingProduct ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-primary">
                  &quot;{deletingProduct.name || deletingProduct.title}&quot;
                </span>
                ?
              </p>
              <p className="text-[11px] text-highlight font-medium">
                This action cannot be undone and will permanently remove this product from the marketplace.
              </p>
            </div>
          ) : undefined
        }
      />

      {/* Change Product Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!statusChangingProduct}
        onClose={() => {
          if (!updateStatusMutation.isPending) {
            setStatusChangingProduct(null);
          }
        }}
        onConfirm={handleConfirmStatusChange}
        title={
          statusChangingProduct?.newStatus === "BLOCKED"
            ? "Block Product from Storefront"
            : `Change Product Status to ${statusChangingProduct?.newStatus}`
        }
        confirmText={
          statusChangingProduct?.newStatus === "BLOCKED"
            ? "Block Product"
            : "Confirm Status Change"
        }
        variant={statusChangingProduct?.newStatus === "BLOCKED" ? "danger" : "primary"}
        isLoading={updateStatusMutation.isPending}
        description={
          statusChangingProduct ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to change the status of{" "}
                <span className="font-bold text-primary">
                  &quot;{statusChangingProduct.product.name || statusChangingProduct.product.title}&quot;
                </span>{" "}
                to <span className="font-bold">{statusChangingProduct.newStatus}</span>?
              </p>
              <p className="text-[11px] text-secondary">
                {statusChangingProduct.newStatus === "BLOCKED"
                  ? "Blocking this product will instantly hide it from customer searches and storefront listings."
                  : `This product will be updated to ${statusChangingProduct.newStatus} immediately across the platform.`}
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};
