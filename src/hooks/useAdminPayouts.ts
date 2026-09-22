import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  AdminPayoutQueryParams,
  AdminPayoutStatistics,
  CreatePayoutAdminPayload,
  PayoutRecord,
  PayoutRequest,
  UpdatePayoutStatusPayload,
} from "@/types/payout";

export interface PayoutsResponse {
  payouts: PayoutRequest[];
  rawPayouts: PayoutRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchAdminPayouts = async (
  params?: AdminPayoutQueryParams
): Promise<PayoutsResponse> => {
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
  if (params?.vendorId) {
    qParams.append("vendorId", params.vendorId);
  }
  if (params?.sortBy) {
    qParams.append("sortBy", params.sortBy);
  }
  if (params?.sortOrder) {
    qParams.append("sortOrder", params.sortOrder);
  }

  const res = await apiClient.get(`/payouts/admin/all?${qParams.toString()}`);
  const rawData = res.data?.data || res.data || [];
  const rawMeta = res.data?.meta;

  let rawPayouts: PayoutRecord[] = [];
  if (Array.isArray(rawData)) {
    rawPayouts = rawData;
  }

  const payouts: PayoutRequest[] = rawPayouts.map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendor?.storeName || "Unknown Vendor",
    amount: Number(p.amount) || 0,
    status: p.status,
    bankName: p.vendor?.bankName || "Not configured",
    bankAccountNumber: p.vendor?.bankAccountNumber || "N/A",
    bankAccountName: p.vendor?.bankAccountName || p.vendor?.storeName || "N/A",
    stripeAccountId: p.vendor?.stripeAccountId || null,
    stripeTransferId: p.stripeTransferId || null,
    requestedAt: p.createdAt,
    processedAt: p.processedAt || null,
    subOrdersCount: p.subOrders?.length || 0,
    subOrders: p.subOrders || [],
    vendor: p.vendor,
  }));

  const limitVal = params?.limit || 20;
  const meta = {
    page: rawMeta?.page ?? (params?.page || 1),
    limit: rawMeta?.limit ?? limitVal,
    total: rawMeta?.total ?? payouts.length,
    totalPages:
      rawMeta?.totalPages ??
      (payouts.length > 0 ? Math.ceil(payouts.length / limitVal) : 1),
  };

  return { payouts, rawPayouts, meta };
};

export const fetchAdminPayoutStats = async (): Promise<AdminPayoutStatistics> => {
  const res = await apiClient.get("/payouts/admin/statistics");
  const data = res.data?.data || res.data || {};

  return {
    totalPlatformVolume: Number(data.totalPlatformVolume) || 0,
    totalCommissionEarned: Number(data.totalCommissionEarned) || 0,
    totalVendorEarnings: Number(data.totalVendorEarnings) || 0,
    totalPaidOut: Number(data.totalPaidOut) || 0,
    pendingPayoutsAmount: Number(data.pendingPayoutsAmount) || 0,
    pendingPayoutsCount: Number(data.pendingPayoutsCount) || 0,
    paidPayoutsCount: Number(data.paidPayoutsCount) || 0,
    failedPayoutsCount: Number(data.failedPayoutsCount) || 0,
  };
};

export const useAdminPayouts = (params?: AdminPayoutQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<PayoutsResponse>({
    queryKey: ["admin-payouts", params],
    queryFn: () => fetchAdminPayouts(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const currentPage = params?.page || 1;
  const totalPages = query.data?.meta?.totalPages;

  useEffect(() => {
    if (!totalPages || query.isLoading) return;

    const PREFETCH_PAGES_AHEAD = 1;
    for (let offset = 1; offset <= PREFETCH_PAGES_AHEAD; offset++) {
      const targetPage = currentPage + offset;
      if (targetPage <= totalPages) {
        const nextParams: AdminPayoutQueryParams = {
          ...params,
          page: targetPage,
        };

        queryClient.prefetchQuery({
          queryKey: ["admin-payouts", nextParams],
          queryFn: () => fetchAdminPayouts(nextParams),
          staleTime: 30 * 1000,
        });
      }
    }
  }, [query.data, currentPage, totalPages, params, queryClient, query.isLoading]);

  return query;
};

export const useAdminPayoutStats = () => {
  return useQuery<AdminPayoutStatistics>({
    queryKey: ["admin-payout-stats"],
    queryFn: fetchAdminPayoutStats,
    staleTime: 30 * 1000,
  });
};

export interface StripePlatformBalance {
  available: number;
  pending: number;
  currency: string;
}

export const useStripePlatformBalance = () => {
  return useQuery<StripePlatformBalance>({
    queryKey: ["stripe-platform-balance"],
    queryFn: async () => {
      const res = await apiClient.get("/payouts/admin/stripe/balance");
      return res.data?.data || res.data || { available: 0, pending: 0, currency: "USD" };
    },
    staleTime: 60 * 1000,
  });
};

export const useAdminPayoutDetails = (payoutId: string | null) => {
  return useQuery<PayoutRecord>({
    queryKey: ["admin-payout-details", payoutId],
    queryFn: async () => {
      if (!payoutId) throw new Error("Payout ID is required");
      const res = await apiClient.get(`/payouts/admin/${payoutId}`);
      return res.data?.data || res.data;
    },
    enabled: !!payoutId,
    staleTime: 30 * 1000,
  });
};

export const useUpdatePayoutStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePayoutStatusPayload;
    }) => {
      const res = await apiClient.patch(`/payouts/admin/${id}/status`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-details"] });
    },
  });
};

export const useDisburseStripePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/payouts/admin/${id}/disburse-stripe`);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-details"] });
    },
  });
};

export const useCreatePayoutAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePayoutAdminPayload) => {
      const res = await apiClient.post("/payouts/admin", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-stats"] });
    },
  });
};
