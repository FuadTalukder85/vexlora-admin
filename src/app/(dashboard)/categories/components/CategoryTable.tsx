"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Percent,
  Search,
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
import { toast } from "sonner";

const initialCategories: Category[] = [
  {
    id: "cat-1",
    name: "Consumer Electronics",
    slug: "consumer-electronics",
    description: "Smartphones, audio, smart home devices, and computing peripherals",
    commissionRate: 8.5,
    parentId: null,
    productCount: 342,
    isActive: true,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Computer Peripherals & Audio",
    slug: "peripherals-audio",
    description: "Mechanical keyboards, gaming mice, studio monitors, DACs",
    commissionRate: 10.0,
    parentId: "cat-1",
    productCount: 184,
    isActive: true,
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-09-12T00:00:00Z",
  },
  {
    id: "cat-3",
    name: "Home & Ergonomic Furniture",
    slug: "home-furniture",
    description: "Standing desks, ergonomic chairs, studio organizers",
    commissionRate: 12.0,
    parentId: null,
    productCount: 128,
    isActive: true,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-08-25T00:00:00Z",
  },
  {
    id: "cat-4",
    name: "Apparel & Streetwear",
    slug: "apparel-streetwear",
    description: "Designer hoodies, jackets, accessories, and shoes",
    commissionRate: 15.0,
    parentId: null,
    productCount: 295,
    isActive: true,
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "cat-5",
    name: "Health & Wearables",
    slug: "health-wearables",
    description: "Fitness trackers, smartwatches, and wellness monitors",
    commissionRate: 9.0,
    parentId: "cat-1",
    productCount: 76,
    isActive: true,
    createdAt: "2026-03-05T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
  {
    id: "cat-6",
    name: "Photography & Video Gear",
    slug: "photo-video",
    description: "Lenses, lighting kits, gimbal stabilizers, and mics",
    commissionRate: 11.5,
    parentId: "cat-1",
    productCount: 63,
    isActive: false,
    createdAt: "2026-03-20T00:00:00Z",
    updatedAt: "2026-09-15T00:00:00Z",
  },
];

export const CategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    commissionRate: 10.0,
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
        commissionRate: category.commissionRate,
        parentId: category.parentId || "",
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        commissionRate: 10.0,
        parentId: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                ...formData,
                slug,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      toast.success(`Category "${formData.name}" updated successfully!`);
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        ...formData,
        slug,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCategories((prev) => [newCategory, ...prev]);
      toast.success(`Category "${formData.name}" created successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success(`Category "${category.name}" removed.`);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: ColumnDef<Category>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Category Name",
      cell: (c) => {
        const parent = categories.find((p) => p.id === c.parentId);
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
            <p className="text-[11px] text-secondary line-clamp-1">{c.description}</p>
          </div>
        );
      },
    },
    {
      header: "Slug",
      cell: (c) => <span className="font-mono text-xs text-primary font-medium">{c.slug}</span>,
    },
    {
      header: "Commission Rate",
      cell: (c) => (
        <span className="font-bold text-highlight flex items-center gap-0.5">
          <Percent className="w-3.5 h-3.5" />
          {c.commissionRate}%
        </span>
      ),
    },
    {
      header: "Catalog Products",
      cell: (c) => (
        <span className="font-semibold text-primary">{c.productCount || 0} products</span>
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
      cell: (c) => <span className="text-primary">{formatDate(c.updatedAt)}</span>,
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
          >
            <Trash2 className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      {/* 1. Taxonomy KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Total Categories
          </span>
          <h2 className="text-3xl font-black text-primary">{categories.length}</h2>
          <p className="text-[11px] text-secondary">
            {categories.filter((c) => !c.parentId).length} Root Taxonomies • {categories.filter((c) => c.parentId).length} Sub-categories
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Avg Platform Commission
          </span>
          <h2 className="text-3xl font-black text-highlight">11.0%</h2>
          <p className="text-[11px] text-secondary">Ranges from 8.5% to 15.0% across verticals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Categorized Products
          </span>
          <h2 className="text-3xl font-black text-emerald-600">1,088</h2>
          <p className="text-[11px] text-secondary">Assigned across active vendor listings</p>
        </div>
      </div>

      {/* 2. Search & Paginated Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <PaginateTable
          title="All Categories"
          subtitle="Manage and organize marketplace category hierarchies"
          headerContent={
            <div className="flex items-center justify-between gap-4">
              <div className="max-w-md w-full">
                <Input
                  placeholder="Search category name, slug, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4" />
                Create Category
              </Button>
            </div>
          }
          data={filteredCategories}
          columns={columns}
          keyExtractor={(c) => c.id}
          defaultPageSize={10}
        />
      </div>

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
                    : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                });
              }}
              placeholder="e.g. Mechanical Keyboards"
              required
            />

            <Input
              label="Slug (URL identifier) *"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-primary focus:border-primary focus:outline-none"
              >
                <option value="">None (Top-Level Category)</option>
                {categories
                  .filter((c) => !editingCategory || c.id !== editingCategory.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <Input
              label="Commission Rate (%) *"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.commissionRate}
              onChange={(e) =>
                setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })
              }
              placeholder="10.0"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-primary">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of items in this category"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              Category is active and visible in catalog
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
