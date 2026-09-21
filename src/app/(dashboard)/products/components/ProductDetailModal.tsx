import React from "react";
import Image from "next/image";
import { Star, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Product, ProductStatus } from "@/types/product";
import { getStatusBadge } from "./ProductTableColumns";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (product: Product, status: ProductStatus) => void;
  onToggleBlock: (product: Product) => void;
  onDelete: (product: Product) => void;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onStatusChange,
  onToggleBlock,
  onDelete,
  isUpdatingStatus = false,
  isDeleting = false,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Product Details: ${product.name || product.title}`}
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs">
        {/* Image Gallery */}
        {Array.isArray(product.images) && product.images.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {product.images.map((img: any, idx: number) => {
              const url = typeof img === "string" ? img : img.url;
              return (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-xl bg-muted border border-border overflow-hidden relative shrink-0"
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
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-muted border border-border">
          <div>
            <p className="text-[10px] text-secondary font-bold uppercase">
              Vendor & Store
            </p>
            <p className="text-primary font-bold text-sm">
              {product.vendor?.storeName || "Unassigned Store"}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-secondary font-bold uppercase">
              Category
            </p>
            <p className="text-primary font-bold text-sm">
              {typeof product.category === "object"
                ? product.category?.name
                : product.category || "General"}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-secondary font-bold uppercase">
              Status
            </p>
            <div className="pt-0.5">
              {getStatusBadge(product.status)}
            </div>
          </div>
        </div>

        {/* Pricing & Stock Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted rounded-xl">
            <p className="text-secondary font-bold uppercase text-[10px]">
              Base Price
            </p>
            <p className="text-primary font-black text-sm">
              {formatCurrency(Number(product.basePrice) || 0)}
            </p>
          </div>

          <div className="p-3 bg-muted rounded-xl">
            <p className="text-secondary font-bold uppercase text-[10px]">
              Discount Price
            </p>
            <p className="text-emerald-600 font-black text-sm">
              {product.discountPrice
                ? formatCurrency(Number(product.discountPrice))
                : "None"}
            </p>
          </div>

          <div className="p-3 bg-muted rounded-xl">
            <p className="text-secondary font-bold uppercase text-[10px]">
              Total Stock
            </p>
            <p className="text-primary font-black text-sm">
              {product.stock ?? product.totalStock ?? 0} units
            </p>
          </div>

          <div className="p-3 bg-muted rounded-xl">
            <p className="text-secondary font-bold uppercase text-[10px]">
              Rating / Reviews
            </p>
            <p className="text-primary font-black text-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {product.ratingAvg ? Number(product.ratingAvg).toFixed(1) : "0.0"}
              <span className="text-[10px] text-secondary font-normal">
                ({product.ratingCount ?? 0})
              </span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl bg-muted border border-border space-y-1.5">
          <p className="text-secondary font-bold uppercase text-[10px]">
            Product Description
          </p>
          <p className="text-primary leading-relaxed">
            {product.description || "No description provided."}
          </p>
        </div>

        {/* Variants if any */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            <p className="text-secondary font-bold uppercase text-[10px]">
              Product Variants ({product.variants.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
              {product.variants.map((v) => (
                <div
                  key={v.id}
                  className="p-2.5 rounded-lg border border-border bg-white flex items-center justify-between text-xs"
                >
                  <span className="font-mono font-medium text-secondary">
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
        <div className="p-3.5 rounded-xl border border-border bg-muted flex items-center justify-between">
          <div>
            <p className="font-bold text-primary">Admin Status Moderation</p>
            <p className="text-[11px] text-secondary">
              Update product visibility and status across marketplace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={product.status === "ACTIVE" ? "outline" : "primary"}
              onClick={() => onStatusChange(product, "ACTIVE")}
              disabled={isUpdatingStatus || product.status === "ACTIVE"}
            >
              Set Active
            </Button>
            <Button
              size="sm"
              variant={product.status === "BLOCKED" ? "outline" : "danger"}
              onClick={() => onToggleBlock(product)}
              disabled={isUpdatingStatus}
            >
              {product.status === "BLOCKED" ? "Unblock" : "Block"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(product, "REJECTED")}
              disabled={isUpdatingStatus || product.status === "REJECTED"}
            >
              Reject
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="text-highlight hover:bg-highlight/10"
            onClick={() => onDelete(product)}
            disabled={isDeleting}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Listing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
