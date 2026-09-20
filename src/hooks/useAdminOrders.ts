import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminOrder, OrderStatus } from "@/types/order";

export interface AdminOrderQueryParams {
  searchTerm?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchAdminOrders = async (
  params?: AdminOrderQueryParams
): Promise<AdminOrdersResponse> => {
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
  if (params?.paymentStatus && params.paymentStatus !== "ALL") {
    qParams.append("paymentStatus", params.paymentStatus);
  }
  if (params?.paymentMethod) {
    qParams.append("paymentMethod", params.paymentMethod);
  }

  const res = await apiClient.get(`/orders/admin/all?${qParams.toString()}`);
  const rawData = res.data?.data || res.data;
  const rawMeta = res.data?.meta;

  let orders: AdminOrder[] = [];
  if (Array.isArray(rawData)) {
    orders = rawData.map((o: any) => {
      // Gather all vendor names
      const vendorNames = Array.isArray(o.subOrders)
        ? Array.from(
            new Set(
              o.subOrders
                .map((so: any) => so.vendor?.storeName)
                .filter(Boolean)
            )
          ).join(", ")
        : "";

      // Gather all order items from sub-orders
      const items = Array.isArray(o.subOrders)
        ? o.subOrders.flatMap((so: any) =>
            Array.isArray(so.items)
              ? so.items.map((it: any) => ({
                  id: it.id,
                  productId: it.productId,
                  productName: it.name || it.product?.title || "Product Item",
                  productImage:
                    it.product?.images?.[0] ||
                    it.variant?.image ||
                    undefined,
                  quantity: it.quantity || 1,
                  unitPrice: Number(it.price) || 0,
                  totalPrice: (Number(it.price) || 0) * (it.quantity || 1),
                }))
              : []
          )
        : [];

      // Calculate total commission
      const commissionTotal = Array.isArray(o.subOrders)
        ? o.subOrders.reduce(
            (acc: number, so: any) => acc + (Number(so.commissionAmount) || 0),
            0
          )
        : 0;

      // Determine synthesized order status based on suborders & paymentStatus
      let computedStatus: OrderStatus = "PENDING";
      if (Array.isArray(o.subOrders) && o.subOrders.length > 0) {
        const statuses = o.subOrders.map((so: any) => so.status);
        if (statuses.every((s: string) => s === "DELIVERED")) {
          computedStatus = "DELIVERED";
        } else if (statuses.some((s: string) => s === "SHIPPED")) {
          computedStatus = "SHIPPED";
        } else if (statuses.some((s: string) => s === "CONFIRMED")) {
          computedStatus = "CONFIRMED";
        } else if (statuses.every((s: string) => s === "CANCELLED")) {
          computedStatus = "CANCELLED";
        } else {
          computedStatus = "PROCESSING";
        }
      } else if (o.paymentStatus === "PAID") {
        computedStatus = "CONFIRMED";
      }

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer?.name || "Customer",
        customerEmail: o.customer?.email || "N/A",
        vendorName: vendorNames || "Platform Store",
        items,
        subtotal: Number(o.totalAmount) || 0,
        tax: 0,
        shipping: 0,
        discount: Number(o.couponDiscount) || 0,
        total: Number(o.totalAmount) || 0,
        commissionTotal,
        status: computedStatus,
        paymentStatus: o.paymentStatus || "PENDING",
        paymentMethod: o.paymentMethod || "Standard",
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      };
    });
  }

  const limitVal = params?.limit || 20;
  const meta = {
    page: rawMeta?.page ?? (params?.page || 1),
    limit: rawMeta?.limit ?? limitVal,
    total: rawMeta?.total ?? orders.length,
    totalPages:
      rawMeta?.totalPages ??
      (orders.length > 0 ? Math.ceil(orders.length / limitVal) : 1),
  };

  return { orders, meta };
};

export const useAdminOrders = (params?: AdminOrderQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<AdminOrdersResponse>({
    queryKey: ["admin-orders", params],
    queryFn: () => fetchAdminOrders(params),
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
        const nextParams: AdminOrderQueryParams = {
          ...params,
          page: targetPage,
        };

        queryClient.prefetchQuery({
          queryKey: ["admin-orders", nextParams],
          queryFn: () => fetchAdminOrders(nextParams),
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [query.data, currentPage, totalPages, params, queryClient, query.isLoading]);

  return query;
};

export const useUpdatePaymentStatusAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
    }) => {
      const res = await apiClient.patch(`/orders/admin/${id}/payment-status`, {
        paymentStatus,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};
