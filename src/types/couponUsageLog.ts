export interface AdminCouponUsageLog {
  id: string;
  couponCode: string;
  userId: string;
  orderId?: string | null;
  discountAmount?: number | null;
  deviceId?: string | null;
  ipAddress?: string | null;
  phone?: string | null;
  paymentFingerprint?: string | null;
  deliveryAddress?: string | null;
  usedAt: string;
  createdAt: string;
  updatedAt: string;
  coupon?: {
    id: string;
    code: string;
    scope: string;
    vendorId?: string | null;
    discountType: string;
    discountValue: number;
    vendor?: {
      id: string;
      storeName: string;
    } | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paymentStatus: string;
  };
}
