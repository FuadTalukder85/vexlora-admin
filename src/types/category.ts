export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  commissionOverride?: number | string | null;
  commissionRate?: number;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  productCount?: number;
  _count?: {
    products?: number;
    children?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parentId?: string | null;
  image?: string | null;
  commissionOverride?: number | null;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  parentId?: string | null;
  image?: string | null;
  commissionOverride?: number | null;
  isActive?: boolean;
}
