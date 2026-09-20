import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { VendorProfile } from "@/types/vendor";

export interface AdminVendorQueryParams {
  searchTerm?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface VendorsResponse {
  vendors: VendorProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchAdminVendors = async (
  params?: AdminVendorQueryParams
): Promise<VendorsResponse> => {
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

  const res = await apiClient.get(`/vendor-profiles/admin?${qParams.toString()}`);
  const rawData = res.data?.data || res.data;
  const rawMeta = res.data?.meta;

  let vendors: VendorProfile[] = [];
  if (Array.isArray(rawData)) {
    vendors = rawData.map((v: any) => ({
      id: v.id,
      userId: v.userId,
      storeName: v.storeName,
      slug: v.storeSlug || v.slug || "",
      storeEmail: v.owner?.email || v.storeEmail || "N/A",
      storePhone: v.owner?.phone || v.storePhone || "N/A",
      storeAddress: v.description || v.storeAddress || "",
      logo: v.storeLogo || v.logo,
      banner: v.storeBanner || v.banner,
      description: v.description,
      commissionRate: Number(v.commissionRate) || 10,
      status: v.status,
      isVerified: v.status === "APPROVED",
      totalSales: Number(v.totalSales) || 0,
      rating: Number(v.ratingAvg) || Number(v.rating) || 0,
      productCount: v._count?.products || v.productCount || 0,
      bankName: v.bankName || "Not configured",
      bankAccountNumber: v.bankAccountNumber,
      bankAccountName: v.bankAccountName,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }

  const limitVal = params?.limit || 20;
  const meta = {
    page: rawMeta?.page ?? (params?.page || 1),
    limit: rawMeta?.limit ?? limitVal,
    total: rawMeta?.total ?? vendors.length,
    totalPages:
      rawMeta?.totalPages ??
      (vendors.length > 0 ? Math.ceil(vendors.length / limitVal) : 1),
  };

  return { vendors, meta };
};

export const useAdminVendors = (params?: AdminVendorQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<VendorsResponse>({
    queryKey: ["admin-vendors", params],
    queryFn: () => fetchAdminVendors(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const currentPage = params?.page || 1;
  const totalPages = query.data?.meta?.totalPages;

  useEffect(() => {
    if (!totalPages || query.isLoading) return;

    const PREFETCH_PAGES_AHEAD = 1;
    for (let offset = 1; offset <= PREFETCH_PAGES_AHEAD; offset++) {
      const targetPage = currentPage + offset;
      if (targetPage <= totalPages) {
        const nextParams: AdminVendorQueryParams = {
          ...params,
          page: targetPage,
        };

        queryClient.prefetchQuery({
          queryKey: ["admin-vendors", nextParams],
          queryFn: () => fetchAdminVendors(nextParams),
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [query.data, currentPage, totalPages, params, queryClient, query.isLoading]);

  return query;
};

export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      commissionRate,
    }: {
      id: string;
      status: VendorProfile["status"];
      commissionRate?: number;
    }) => {
      const res = await apiClient.patch(`/vendor-profiles/${id}/status`, {
        status,
        ...(commissionRate !== undefined && { commissionRate }),
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    },
  });
};
