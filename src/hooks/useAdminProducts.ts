import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Product, ProductStatus } from "@/types/product";

export interface AdminProductQueryParams {
  searchTerm?: string;
  status?: string;
  categoryId?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchAdminProducts = async (
  params?: AdminProductQueryParams
): Promise<ProductsResponse> => {
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
  if (params?.status && params.status !== "ALL") {
    qParams.append("status", params.status);
  }
  if (params?.categoryId) {
    qParams.append("categoryId", params.categoryId);
  }
  if (params?.vendorId) {
    qParams.append("vendorId", params.vendorId);
  }

  const res = await apiClient.get(`/products/admin?${qParams.toString()}`);
  const rawData = res.data?.data || res.data;
  const rawMeta = res.data?.meta;

  let products: Product[] = [];
  if (Array.isArray(rawData)) {
    products = rawData.map((p: any) => ({
      ...p,
      name: p.title || p.name,
      stock: p.totalStock ?? p.stock ?? 0,
      basePrice: Number(p.basePrice) || 0,
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      images: Array.isArray(p.images)
        ? p.images.map((img: any, idx: number) =>
          typeof img === "string"
            ? { id: `img-${idx}`, url: img, isPrimary: idx === 0 }
            : img
        )
        : [],
    }));
  }

  const limitVal = params?.limit || 20;
  const meta = {
    page: rawMeta?.page ?? (params?.page || 1),
    limit: rawMeta?.limit ?? limitVal,
    total: rawMeta?.total ?? products.length,
    totalPages:
      rawMeta?.totalPages ??
      (products.length > 0 ? Math.ceil(products.length / limitVal) : 1),
  };

  return { products, meta };
};

export const useAdminProducts = (params?: AdminProductQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<ProductsResponse>({
    queryKey: ["admin-products", params],
    queryFn: () => fetchAdminProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for smooth cache hits
  });

  const currentPage = params?.page || 1;
  const totalPages = query.data?.meta?.totalPages;

  // Background prefetching: Prefetches the next 2–5 pages into TanStack Query cache
  useEffect(() => {
    if (!totalPages || query.isLoading) return;

    // Prefetch next 3 pages in advance
    const PREFETCH_PAGES_AHEAD = 3;
    for (let offset = 1; offset <= PREFETCH_PAGES_AHEAD; offset++) {
      const targetPage = currentPage + offset;
      if (targetPage <= totalPages) {
        const nextParams: AdminProductQueryParams = {
          ...params,
          page: targetPage,
        };

        queryClient.prefetchQuery({
          queryKey: ["admin-products", nextParams],
          queryFn: () => fetchAdminProducts(nextParams),
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [query.data, currentPage, totalPages, params, queryClient, query.isLoading]);

  return query;
};

export const useAdminProduct = (id?: string) => {
  return useQuery<Product | null>({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/products/${id}`);
      const p = res.data?.data || res.data;
      if (!p) return null;

      return {
        ...p,
        name: p.title || p.name,
        stock: p.totalStock ?? p.stock ?? 0,
        basePrice: Number(p.basePrice) || 0,
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        images: Array.isArray(p.images)
          ? p.images.map((img: any, idx: number) =>
            typeof img === "string"
              ? { id: `img-${idx}`, url: img, isPrimary: idx === 0 }
              : img
          )
          : [],
      };
    },
    enabled: Boolean(id),
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProductStatus }) => {
      const res = await apiClient.patch(`/products/${id}/status`, { status });
      return res.data?.data || res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};
