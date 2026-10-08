import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { getAdminSocket } from "@/lib/socket";
import { toast } from "sonner";
import { DealRequestItem } from "@/app/(dashboard)/deals/components/AdminReviewDealModal";

export interface DealItem {
  id: string;
  title?: string | null;
  dealPrice: number;
  originalPrice: number;
  quantityLimit?: number | null;
  soldCount: number;
  startAt: string;
  endAt: string;
  status: "SCHEDULED" | "ACTIVE" | "EXPIRED" | "SOLD_OUT" | "CANCELLED";
  discountPercent: number;
  soldPercentage: number;
  product: {
    id: string;
    title: string;
    images: string[];
    vendor?: {
      storeName: string;
    };
  };
}

export function useAdminDeals() {
  const [activeTab, setActiveTab] = useState<"requests" | "activeDeals">("requests");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<DealRequestItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [reviewingRequest, setReviewingRequest] = useState<DealRequestItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">("APPROVED");

  // Direct Deal Modal State
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<
    Array<{ id: string; title: string; basePrice: number; vendor?: { storeName: string } }>
  >([]);
  const [cancellingDealId, setCancellingDealId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [reqRes, dealsRes] = await Promise.all([
        apiClient.get("/deals/requests/admin?limit=100"),
        apiClient.get("/deals?limit=100"),
      ]);

      if (reqRes.data?.data) {
        setRequests(reqRes.data.data);
      }
      if (dealsRes.data?.data) {
        setDeals(dealsRes.data.data);
      }
    } catch (err: unknown) {
      if (!silent) {
        console.error("Failed to load admin deals data:", err);
        toast.error("Failed to load deals data");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Connect to WebSocket & join admin room
    const socket = getAdminSocket();

    const handleNewDealRequest = (payload: { message?: string }) => {
      fetchData(true);
      toast.info(payload.message || "New vendor deal request submitted!", {
        duration: 4000,
      });
    };

    const handleDealUpdated = () => {
      fetchData(true);
    };

    socket.on("DEAL_REQUEST_CREATED", handleNewDealRequest);
    socket.on("DEAL_REQUEST_REVIEWED", handleDealUpdated);
    socket.on("DEAL_UPDATED", handleDealUpdated);

    return () => {
      socket.off("DEAL_REQUEST_CREATED", handleNewDealRequest);
      socket.off("DEAL_REQUEST_REVIEWED", handleDealUpdated);
      socket.off("DEAL_UPDATED", handleDealUpdated);
    };
  }, [fetchData]);

  const handleOpenDirectModal = async () => {
    setIsDirectModalOpen(true);
    try {
      const res = await apiClient.get("/products?limit=100&status=ACTIVE");
      if (res.data?.data) {
        setAllProducts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleCancelDeal = (dealId: string) => {
    setCancellingDealId(dealId);
  };

  const handleConfirmCancelDeal = async () => {
    if (!cancellingDealId) return;

    setIsCancelling(true);
    try {
      await apiClient.patch(`/deals/${cancellingDealId}/cancel`);
      toast.success("Deal cancelled successfully");
      setCancellingDealId(null);
      fetchData(true);
    } catch {
      toast.error("Failed to cancel deal");
    } finally {
      setIsCancelling(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const liveDeals = deals.filter((d) => d.status === "ACTIVE");
  const scheduledDeals = deals.filter((d) => d.status === "SCHEDULED");
  const totalDealsSoldCount = deals.reduce((acc, d) => acc + (d.soldCount || 0), 0);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendor?.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter deals
  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      d.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.product?.vendor?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.title && d.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    requests,
    deals,
    isLoading,
    reviewingRequest,
    setReviewingRequest,
    reviewAction,
    setReviewAction,
    isDirectModalOpen,
    setIsDirectModalOpen,
    allProducts,
    cancellingDealId,
    setCancellingDealId,
    isCancelling,
    pendingRequests,
    liveDeals,
    scheduledDeals,
    totalDealsSoldCount,
    filteredRequests,
    filteredDeals,
    fetchData,
    handleOpenDirectModal,
    handleCancelDeal,
    handleConfirmCancelDeal,
  };
}
