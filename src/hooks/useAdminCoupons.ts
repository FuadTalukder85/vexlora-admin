import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Coupon, CreateAdminCouponPayload, UpdateAdminCouponPayload } from "@/types/coupon";
import { AdminCouponUsageLog } from "@/types/couponUsageLog";
import { toast } from "sonner";

export interface AdminCouponQueryParams {
  searchTerm?: string;
  scope?: string;
  vendorId?: string;
  isActive?: boolean | string;
  discountType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminCouponsResponse {
  coupons: Coupon[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUsageLogsResponse {
  logs: AdminCouponUsageLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useAdminCoupons = (params?: AdminCouponQueryParams) => {
  return useQuery<AdminCouponsResponse>({
    queryKey: ["admin-coupons", params],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      if (params?.page) qParams.append("page", params.page.toString());
      if (params?.limit) qParams.append("limit", params.limit.toString());
      if (params?.searchTerm && params.searchTerm.trim()) {
        qParams.append("searchTerm", params.searchTerm.trim());
      }
      if (params?.scope && params.scope !== "ALL") {
        qParams.append("scope", params.scope);
      }
      if (params?.vendorId && params.vendorId !== "ALL") {
        qParams.append("vendorId", params.vendorId);
      }
      if (params?.isActive !== undefined && params.isActive !== "ALL") {
        qParams.append("isActive", params.isActive.toString());
      }
      if (params?.discountType && params.discountType !== "ALL") {
        qParams.append("discountType", params.discountType);
      }
      if (params?.sortBy) qParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) qParams.append("sortOrder", params.sortOrder);

      const res = await apiClient.get(`/coupons/admin?${qParams.toString()}`);
      const rawData = res.data?.data || [];
      const rawMeta = res.data?.meta;

      const coupons: Coupon[] = Array.isArray(rawData)
        ? rawData.map((c: any) => ({
            id: c.id,
            code: c.code,
            scope: c.scope,
            vendorId: c.vendorId,
            vendor: c.vendor,
            discountType: c.discountType,
            discountValue: Number(c.discountValue) || 0,
            minPurchase: c.minPurchase !== null ? Number(c.minPurchase) : null,
            expiresAt: c.expiresAt,
            usageLimit: c.usageLimit,
            usedCount: c.usedCount || 0,
            isActive: c.isActive,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            _count: c._count,
          }))
        : [];

      const limit = params?.limit || 20;
      const meta = {
        page: rawMeta?.page ?? (params?.page || 1),
        limit: rawMeta?.limit ?? limit,
        total: rawMeta?.total ?? coupons.length,
        totalPages: rawMeta?.totalPages ?? (coupons.length > 0 ? Math.ceil(coupons.length / limit) : 1),
      };

      return { coupons, meta };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateAdminCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAdminCouponPayload) => {
      const res = await apiClient.post("/coupons", payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success(`Coupon "${data.code || "voucher"}" created successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to create coupon";
      toast.error(msg);
    },
  });
};

export const useUpdateAdminCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAdminCouponPayload }) => {
      const res = await apiClient.patch(`/coupons/${id}`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated successfully!");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to update coupon";
      toast.error(msg);
    },
  });
};

export const useToggleAdminCouponStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }) => {
      const res = await apiClient.patch(`/coupons/${id}/toggle-status`, { isActive });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success(`Coupon status updated to ${data?.isActive ? "Active" : "Inactive"}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to update coupon status";
      toast.error(msg);
    },
  });
};

export const useDeleteAdminCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/coupons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted successfully!");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete coupon";
      toast.error(msg);
    },
  });
};

export const useAdminCouponUsageLogs = (params?: { page?: number; limit?: number; searchTerm?: string }) => {
  return useQuery<AdminUsageLogsResponse>({
    queryKey: ["admin-coupon-usage-logs", params],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      if (params?.page) qParams.append("page", params.page.toString());
      if (params?.limit) qParams.append("limit", params.limit.toString());
      if (params?.searchTerm && params.searchTerm.trim()) {
        qParams.append("searchTerm", params.searchTerm.trim());
      }

      const res = await apiClient.get(`/coupon-usage-logs/admin?${qParams.toString()}`);
      const rawData = res.data?.data || [];
      const rawMeta = res.data?.meta;

      const logs: AdminCouponUsageLog[] = Array.isArray(rawData) ? rawData : [];
      const limit = params?.limit || 20;
      const meta = {
        page: rawMeta?.page ?? (params?.page || 1),
        limit: rawMeta?.limit ?? limit,
        total: rawMeta?.total ?? logs.length,
        totalPages: rawMeta?.totalPages ?? (logs.length > 0 ? Math.ceil(logs.length / limit) : 1),
      };

      return { logs, meta };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
};
