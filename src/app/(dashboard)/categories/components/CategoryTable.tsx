"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Percent,
  Search,
  FolderTree,
  Package,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { CategoryModal } from "./CategoryModal";
import { formatDate } from "@/lib/utils";
import { Category } from "@/types/category";
import { CategoriesSkeleton } from "./CategoriesSkeleton";
import {
  useAdminCategories,
  useCategoryTree,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useAdminCategories";
import { toast } from "sonner";

export const CategoryTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "ARCHIVE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Queries & Mutations with server pagination & status filter tabs
  const { data, isLoading, isError, error, refetch } = useAdminCategories({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
    status: activeTab !== "ALL" ? activeTab : undefined,
  });

  // Query category tree for parent selection and accurate taxonomy hierarchy stats
  const { data: categoryTree } = useCategoryTree();

  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const categories = data?.categories || [];
  const meta = data?.meta;

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleOpenModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      toast.success(`Category "${deletingCategory.name}" archived successfully.`);
      setDeletingCategory(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to archive category.";
      toast.error(msg);
    }
  };

  const handleRestore = async (category: Category) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        payload: { isDeleted: false, isActive: true },
      });
      toast.success(`Category "${category.name}" restored from archive.`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to restore category.";
      toast.error(msg);
    }
  };

  // KPI Calculations
  const totalCategories = meta?.total ?? categories.length;
  const treeList = categoryTree || [];
  const rootCategoriesCount = treeList.length > 0 ? treeList.length : categories.filter((c) => !c.parentId).length;
  const subCategoriesCount = totalCategories > rootCategoriesCount ? totalCategories - rootCategoriesCount : 0;

  const avgCommission =
    categories.length > 0
      ? (
          categories.reduce((acc, c) => acc + (c.commissionRate ?? 10), 0) /
          categories.length
        ).toFixed(1)
      : "10.0";

  const totalProducts = categories.reduce(
    (acc, c) => acc + (c.productCount ?? 0),
    0
  );

  const columns: ColumnDef<Category>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: "Category Name",
      cell: (c) => {
        const parent = categories.find((p) => p.id === c.parentId) || c.parent;
        return (
          <div className="flex items-center gap-3">
            {c.image ? (
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-border shrink-0 bg-muted/30">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl border border-border shrink-0 bg-muted/40 flex items-center justify-center text-secondary">
                <FolderTree className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-primary truncate">{c.name}</span>
                {c.parentId && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-secondary font-medium shrink-0">
                    Sub of {parent?.name || "Parent"}
                  </span>
                )}
              </div>
              {c.description && (
                <p className="text-[11px] text-secondary line-clamp-1">
                  {c.description}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Slug",
      cell: (c) => (
        <span className="font-mono text-xs text-primary font-medium">
          {c.slug}
        </span>
      ),
    },
    {
      header: "Commission Rate",
      cell: (c) => (
        <span className="font-bold text-highlight flex items-center gap-0.5">
          <Percent className="w-3.5 h-3.5" />
          {c.commissionRate ?? c.commissionOverride ?? 10}%
        </span>
      ),
    },
    {
      header: "Catalog Products",
      cell: (c) => (
        <span className="font-semibold text-primary">
          {c.productCount || 0} products
        </span>
      ),
    },
    {
      header: "Status",
      cell: (c) =>
        c.isDeleted ? (
          <Badge variant="danger">Archived</Badge>
        ) : c.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="neutral">Inactive</Badge>
        ),
    },
    {
      header: "Updated",
      cell: (c) => (
        <span className="text-primary text-xs">
          {c.updatedAt ? formatDate(c.updatedAt) : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (c) => (
        <TableActions>
          <TableActionButton
            onClick={() => handleOpenModal(c)}
            title="Edit Category Details"
          >
            <Edit className="w-4 h-4" />
          </TableActionButton>
          {c.isDeleted ? (
            <TableActionButton
              onClick={() => handleRestore(c)}
              hoverVariant="primary"
              title="Restore Category from Archive"
              disabled={updateCategoryMutation.isPending}
            >
              <RotateCcw className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          ) : (
            <TableActionButton
              onClick={() => handleDelete(c)}
              hoverVariant="danger"
              title="Archive Category"
              disabled={deleteCategoryMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading && categories.length === 0) {
    return <CategoriesSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-xs space-y-3">
        <p className="text-highlight font-bold text-sm">
          Failed to load category taxonomy.
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
      {/* 1. Taxonomy KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Total Categories
            </span>
            <FolderTree className="w-4 h-4 text-secondary" />
          </div>
          <h2 className="text-3xl font-black text-primary">
            {totalCategories.toLocaleString()}
          </h2>
          <p className="text-[11px] text-secondary">
            {rootCategoriesCount} Root Taxonomies • {subCategoriesCount} Sub-categories
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Avg Platform Commission
            </span>
            <Percent className="w-4 h-4 text-highlight" />
          </div>
          <h2 className="text-3xl font-black text-highlight">{avgCommission}%</h2>
          <p className="text-[11px] text-secondary">
            Global standard & category overrides
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Categorized Products
            </span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-emerald-600">
            {totalProducts.toLocaleString()}
          </h2>
          <p className="text-[11px] text-secondary">
            Assigned across active vendor listings
          </p>
        </div>
      </div>

      {/* 2. Search & Paginated Table with Status Tabs */}
      <PaginateTable
        title="All Categories"
        subtitle="Manage and organize marketplace category hierarchies"
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col gap-4">
            {/* Status Filter Tabs: All, Active, Archive */}
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
              {[
                { key: "ALL", label: "All Categories" },
                { key: "ACTIVE", label: "Active" },
                { key: "ARCHIVE", label: "Archive" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveTab(key as "ALL" | "ACTIVE" | "ARCHIVE");
                    setPage(1);
                  }}
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="max-w-md w-full">
                <Input
                  placeholder="Search category name, slug..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenModal()}
              >
                <Plus className="w-4 h-4" />
                Create Category
              </Button>
            </div>
          </div>
        }
        data={categories}
        columns={columns}
        keyExtractor={(c) => c.id}
        page={page}
        pageSize={pageSize}
        totalItems={meta?.total ?? categories.length}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        defaultPageSize={20}
      />

      {/* 3. Category Creation / Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
        treeList={treeList}
        categories={categories}
      />

      {/* Archive / Soft Delete Category Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => {
          if (!deleteCategoryMutation.isPending) {
            setDeletingCategory(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Archive Taxonomy Category"
        confirmText="Archive Category"
        variant="danger"
        isLoading={deleteCategoryMutation.isPending}
        description={
          deletingCategory ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to archive category{" "}
                <span className="font-bold text-primary">
                  &quot;{deletingCategory.name}&quot;
                </span>
                ?
              </p>
              <p className="text-[11px] text-secondary">
                The category will be soft-deleted and moved to the Archive tab. Existing catalog products will remain intact, and you can restore this category anytime.
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};
