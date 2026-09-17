import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category";

export interface CategoryQueryParams {
  searchTerm?: string;
  limit?: number;
  page?: number;
  parentId?: string | null;
}

export interface CategoriesResponse {
  categories: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useAdminCategories = (params?: CategoryQueryParams) => {
  return useQuery<CategoriesResponse>({
    queryKey: ["admin-categories", params],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      if (params?.page) {
        qParams.append("page", params.page.toString());
      }
      if (params?.limit) {
        qParams.append("limit", params.limit.toString());
      }
      if (params?.searchTerm && params.searchTerm.trim()) {
        qParams.append("searchTerm", params.searchTerm.trim());
      }
      if (params?.parentId !== undefined && params?.parentId !== null) {
        qParams.append("parentId", params.parentId);
      }

      const res = await apiClient.get(`/categories?${qParams.toString()}`);
      const rawData = res.data?.data || res.data;
      const rawMeta = res.data?.meta;

      let categories: Category[] = [];
      if (Array.isArray(rawData)) {
        categories = rawData.map((c: any) => ({
          ...c,
          commissionRate: c.commissionOverride !== null && c.commissionOverride !== undefined
            ? Number(c.commissionOverride)
            : (c.commissionRate ?? 10.0),
          productCount: c._count?.products ?? c.productCount ?? 0,
        }));
      }

      const meta = {
        page: rawMeta?.page ?? (params?.page || 1),
        limit: rawMeta?.limit ?? (params?.limit || categories.length || 20),
        total: rawMeta?.total ?? categories.length,
        totalPages: rawMeta?.totalPages ?? (categories.length > 0 ? Math.ceil(categories.length / (params?.limit || 20)) : 1),
      };

      return { categories, meta };
    },
    staleTime: 60 * 1000,
  });
};

export const useCategoryTree = () => {
  return useQuery<Category[]>({
    queryKey: ["admin-category-tree"],
    queryFn: async () => {
      const res = await apiClient.get("/categories/tree");
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const res = await apiClient.post("/categories", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-category-tree"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
      const res = await apiClient.patch(`/categories/${id}`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-category-tree"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-category-tree"] });
    },
  });
};
