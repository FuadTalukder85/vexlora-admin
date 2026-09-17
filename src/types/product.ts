import { Category } from "./category";

export type ProductStatus =
  | "ACTIVE"
  | "DRAFT"
  | "OUT_OF_STOCK"
  | "ARCHIVED"
  | "BLOCKED"
  | "REJECTED";

export interface ProductVariant {
  id: string;
  sku: string;
  attributes?: Record<string, unknown> | string | unknown;
  price: number | string;
  stock: number;
  image?: string | null;
}

export interface Product {
  id: string;
  vendorId: string;
  title: string;
  name?: string; // Compatibility alias with title
  slug: string;
  description?: string | null;
  categoryId?: string | null;
  brand?: string | null;
  images: string[] | { id: string; url: string; isPrimary?: boolean }[];
  basePrice: number | string;
  discountPrice?: number | string | null;
  totalStock: number;
  stock?: number; // Compatibility alias with totalStock
  salesCount?: number;
  status: ProductStatus;
  ratingAvg?: number | string;
  ratingCount?: number;
  tags?: string[];
  category?: Category | { id: string; name: string; slug?: string } | null;
  vendor?: {
    id: string;
    userId?: string;
    storeName: string;
    storeSlug?: string;
    storeLogo?: string | null;
    status?: string;
  };
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductStatusPayload {
  status: ProductStatus;
}
