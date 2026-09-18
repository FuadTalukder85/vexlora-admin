"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Percent,
  Search,
  FolderTree,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { Category } from "@/types/category";
import { CategoriesSkeleton } from "./CategoriesSkeleton";
import {
  useAdminCategories,
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useAdminCategories";
import { toast } from "sonner";

export const CategoryTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Queries & Mutations with server pagination
  const { data, isLoading, isError, error, refetch } = useAdminCategories({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
  });

  // Query category tree for parent selection and accurate taxonomy hierarchy stats
  const { data: categoryTree } = useCategoryTree();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const categories = data?.categories || [];
  const meta = data?.meta;

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    commissionOverride: 10.0,
    parentId: "",
    isActive: true,
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        commissionOverride:
          category.commissionOverride !== null && category.commissionOverride !== undefined
            ? Number(category.commissionOverride)
            : category.commissionRate ?? 10.0,
        parentId: category.parentId || "",
        isActive: category.isActive ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        image: "",
        commissionOverride: 10.0,
        parentId: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const slug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const payload = {
      name: formData.name.trim(),
      slug,
      parentId: formData.parentId ? formData.parentId : null,
      image: formData.image.trim() || null,
      commissionOverride:
        formData.commissionOverride !== null && formData.commissionOverride !== undefined
          ? Number(formData.commissionOverride)
          : null,
      isActive: formData.isActive,
    };

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          payload,
        });
        toast.success(`Category "${formData.name}" updated successfully!`);
      } else {
        await createCategoryMutation.mutateAsync(payload);
        toast.success(`Category "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred while saving the category.";
      toast.error(msg);
    }
  };

  const handleDelete = async (category: Category) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${category.name}"? Sub-categories will be gracefully re-linked to their parent.`
      )
    ) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success(`Category "${category.name}" deleted successfully.`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete category.";
      toast.error(msg);
    }
  };

  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

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
        <span className="font-semibold text-slate-500 text-xs">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: "Category Name",
      cell: (c) => {
        const parent = categories.find((p) => p.id === c.parentId) || c.parent;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-primary">{c.name}</span>
              {c.parentId && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-secondary font-medium">
                  Sub-category of {parent?.name || "Parent"}
                </span>
              )}
            </div>
            {c.description && (
              <p className="text-[11px] text-secondary line-clamp-1">
                {c.description}
              </p>
            )}
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
        c.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Inactive</Badge>
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
          <TableActionButton
            onClick={() => handleDelete(c)}
            hoverVariant="danger"
            title="Delete Category"
            disabled={deleteCategoryMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </TableActionButton>
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
        <p className="text-rose-600 font-bold text-sm">
          Failed to load category taxonomy.
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
      {/* 1. Taxonomy KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Total Categories
            </span>
            <FolderTree className="w-4 h-4 text-slate-400" />
          </div>
          <h2 className="text-3xl font-black text-primary">
            {totalCategories.toLocaleString()}
          </h2>
          <p className="text-[11px] text-secondary">
            {rootCategoriesCount} Root Taxonomies • {subCategoriesCount} Sub-categories
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
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

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
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

      {/* 2. Search & Paginated Table */}
      <PaginateTable
        title="All Categories"
        subtitle="Manage and organize marketplace category hierarchies"
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex items-center justify-between gap-4">
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create New Category"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category Name *"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: editingCategory
                    ? formData.slug
                    : name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, ""),
                });
              }}
              placeholder="e.g. Mechanical Keyboards"
              required
            />

            <Input
              label="Slug (URL identifier) *"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="e.g. mechanical-keyboards"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-primary">
                Parent Category (Optional)
              </label>
              <select
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-primary focus:border-primary focus:outline-none"
              >
                <option value="">None (Top-Level Root Category)</option>
                {(treeList.length > 0 ? treeList : categories)
                  .filter(
                    (c) =>
                      !editingCategory ||
                      (c.id !== editingCategory.id && c.parentId !== editingCategory.id)
                  )
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <Input
              label="Commission Override (%) *"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.commissionOverride}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  commissionOverride: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="10.0"
              required
            />
          </div>

          <Input
            label="Image URL (Optional)"
            type="url"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            placeholder="https://images.unsplash.com/..."
          />

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              Category is active and visible in marketplace catalog
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingCategory
                ? "Save Changes"
                : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
