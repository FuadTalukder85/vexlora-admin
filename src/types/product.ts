import { Category } from "./category";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  stock: number;
  salesCount: number;
  status: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "ARCHIVED" | "BLOCKED";
  categoryId?: string | null;
  category?: Category | { id: string; name: string } | null;
  vendorId?: string;
  vendor?: {
    id: string;
    storeName: string;
    logo?: string;
  };
  images: { id: string; url: string; isPrimary?: boolean }[];
  createdAt: string;
  updatedAt: string;
}
