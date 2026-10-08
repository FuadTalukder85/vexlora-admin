"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { Category } from "@/types/category";
import {
  useCreateCategory,
  useUpdateCategory,
  useUploadCategoryImage,
} from "@/hooks/useAdminCategories";
import { toast } from "sonner";

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  treeList?: Category[];
  categories?: Category[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  treeList = [],
  categories = [],
}) => {
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const uploadImageMutation = useUploadCategoryImage();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    commissionOverride: 10.0,
    parentId: "",
    isActive: true,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (category) {
        const initialImage = category.image || "";
        setImagePreviewUrl(initialImage);
        setSelectedImageFile(null);
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          image: initialImage,
          commissionOverride:
            category.commissionOverride !== null && category.commissionOverride !== undefined
              ? Number(category.commissionOverride)
              : category.commissionRate ?? 10.0,
          parentId: category.parentId || "",
          isActive: category.isActive ?? true,
        });
      } else {
        setImagePreviewUrl("");
        setSelectedImageFile(null);
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
    }
  }, [isOpen, category]);

  const handleClose = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    onClose();
  };

  const handleImageSelect = (file: File) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const localBlobUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(localBlobUrl);
    setFormData((prev) => ({ ...prev, image: localBlobUrl }));
  };

  const handleImageRemove = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const isSubmitting =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    uploadImageMutation.isPending;

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

    try {
      let finalImageUrl: string | null = null;

      // Upload file to Cloudinary only when user submits the form
      if (selectedImageFile) {
        toast.loading("Uploading category image to Cloudinary...", { id: "category-upload" });
        finalImageUrl = await uploadImageMutation.mutateAsync(selectedImageFile);
        toast.dismiss("category-upload");
      } else if (formData.image && !formData.image.startsWith("blob:")) {
        finalImageUrl = formData.image.trim() || null;
      }

      const payload = {
        name: formData.name.trim(),
        slug,
        parentId: formData.parentId ? formData.parentId : null,
        image: finalImageUrl,
        commissionOverride:
          formData.commissionOverride !== null && formData.commissionOverride !== undefined
            ? Number(formData.commissionOverride)
            : null,
        isActive: formData.isActive,
      };

      if (category) {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          payload,
        });
        toast.success(`Category "${formData.name}" updated successfully!`);
      } else {
        await createCategoryMutation.mutateAsync(payload);
        toast.success(`Category "${formData.name}" created successfully!`);
      }
      handleClose();
    } catch (err: any) {
      toast.dismiss("category-upload");
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred while saving the category.";
      toast.error(msg);
    }
  };

  const availableParents = (treeList.length > 0 ? treeList : categories).filter(
    (c) => !category || (c.id !== category.id && c.parentId !== category.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={category ? "Edit Category" : "Create New Category"}
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
                slug: category
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
              className="w-full h-10 rounded-xl border border-border bg-white px-3.5 text-sm text-primary focus:border-primary focus:outline-none"
            >
              <option value="">None (Top-Level Root Category)</option>
              {availableParents.map((cat) => (
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

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary">
            Category Image (Optional)
          </label>
          <ImageUploadDropzone
            currentUrl={formData.image || null}
            onUpload={handleImageSelect}
            onRemove={handleImageRemove}
            aspectRatio="square"
            label=""
            helperText="PNG, JPG, WEBP up to 5MB"
            maxSizeMB={5}
            accept="image/png,image/jpeg,image/webp,image/avif"
            disabled={isSubmitting}
          />
          <div className="pt-1">
            <details className="text-xs text-secondary group">
              <summary className="cursor-pointer hover:text-primary font-medium select-none list-none flex items-center gap-1">
                <span>Or enter custom Image URL directly</span>
              </summary>
              <div className="pt-2">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  type="url"
                  value={formData.image && !formData.image.startsWith("blob:") ? formData.image : ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(imagePreviewUrl);
                    }
                    setSelectedImageFile(null);
                    setImagePreviewUrl(url);
                    setFormData((prev) => ({ ...prev, image: url }));
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </details>
          </div>
        </div>

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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
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
              : category
              ? "Save Changes"
              : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
