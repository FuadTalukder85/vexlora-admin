export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  storeEmail: string;
  storePhone: string;
  storeAddress?: string;
  logo?: string;
  banner?: string;
  description?: string;
  commissionRate?: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  isVerified: boolean;
  totalSales?: number;
  rating?: number;
  productCount?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  createdAt: string;
  updatedAt: string;
}
