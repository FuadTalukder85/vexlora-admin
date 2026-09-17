export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  commissionRate: number;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  productCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
