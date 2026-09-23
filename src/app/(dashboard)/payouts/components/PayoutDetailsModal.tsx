"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  Building,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Package,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PayoutRequest, PayoutStatus } from "@/types/payout";
import {
  useAdminPayoutDetails,
  useDisburseStripePayout,
  useStripePlatformBalance,
  useUpdatePayoutStatus,
} from "@/hooks/useAdminPayouts";
import { toast } from "sonner";

interface PayoutDetailsModalProps {
  payout: PayoutRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayoutDetailsModal: React.FC<PayoutDetailsModalProps> = ({
  payout,
  isOpen,
  onClose,
}) => {
  const [customTransferRef, setCustomTransferRef] = useState("");
  const [showRefInput, setShowRefInput] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<{
    type: "DISBURSE_STRIPE" | "STATUS_CHANGE";
    targetStatus?: PayoutStatus;
  } | null>(null);

  const { data: details, isLoading } = useAdminPayoutDetails(payout?.id || null);
  const { data: stripeBalance } = useStripePlatformBalance();
  const disburseStripeMutation = useDisburseStripePayout();
  const updateStatusMutation = useUpdatePayoutStatus();

  if (!payout) return null;

  const currentPayout = details || payout;
  const subOrders = details?.subOrders || payout.subOrders || [];
  const isStripeBalanceAvailable = (stripeBalance?.available ?? 0) >= Number(payout.amount);

  const handleTriggerDisburseStripe = () => {
    setConfirmingAction({ type: "DISBURSE_STRIPE" });
  };

  const handleTriggerUpdateStatus = (status: PayoutStatus) => {
    setConfirmingAction({ type: "STATUS_CHANGE", targetStatus: status });
  };

  const handleConfirmAction = async () => {
    if (!confirmingAction) return;

    if (confirmingAction.type === "DISBURSE_STRIPE") {
      try {
        await disburseStripeMutation.mutateAsync(payout.id);
        toast.success(
          `Disbursement to ${payout.vendorName} executed successfully via Stripe Connect!`
        );
        setConfirmingAction(null);
        onClose();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Stripe Connect payout transfer failed"
        );
      }
    } else if (confirmingAction.type === "STATUS_CHANGE" && confirmingAction.targetStatus) {
      try {
        await updateStatusMutation.mutateAsync({
          id: payout.id,
          payload: {
            status: confirmingAction.targetStatus,
            stripeTransferId: customTransferRef.trim() || undefined,
          },
        });
        toast.success(`Payout marked as ${confirmingAction.targetStatus}`);
        setShowRefInput(false);
        setConfirmingAction(null);
        onClose();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || `Failed to update payout status to ${confirmingAction.targetStatus}`
        );
      }
    }
  };

  const totalGrossSubtotal = subOrders.reduce(
    (sum, item) => sum + Number(item.subOrder.subtotal || 0),
    0
  );
  const totalCommission = subOrders.reduce(
    (sum, item) => sum + Number(item.subOrder.commissionAmount || 0),
    0
  );
  const totalVendorNet = subOrders.reduce(
    (sum, item) => sum + Number(item.subOrder.vendorEarning || 0),
    0
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Payout & Escrow Settlement Breakdown"
        maxWidth="xl"
      >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="p-4 bg-muted/60 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-secondary">
                #{payout.id}
              </span>
              {currentPayout.status === "PAID" && (
                <Badge variant="success">PAID & SETTLED</Badge>
              )}
              {currentPayout.status === "PROCESSING" && (
                <Badge variant="primary">PROCESSING</Badge>
              )}
              {currentPayout.status === "UNPAID" && (
                <Badge variant="warning">PENDING CLEARANCE</Badge>
              )}
              {currentPayout.status === "FAILED" && (
                <Badge variant="danger">FAILED / REVERTED</Badge>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-primary mt-1">
              {payout.vendorName}
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Requested: {formatDate(payout.requestedAt)}
              {payout.processedAt && (
                <span> &bull; Settled: {formatDate(payout.processedAt)}</span>
              )}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-border sm:pl-5">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
              Net Payable
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {formatCurrency(Number(payout.amount))}
            </span>
          </div>
        </div>

        {/* Banking & Stripe Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank Transfer Details */}
          <div className="p-4 bg-white rounded-xl border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Building className="w-4 h-4 text-secondary" />
              <span>Direct Bank Account</span>
            </div>
            <div className="text-xs space-y-1 pt-1">
              <p className="text-secondary">
                Bank Name:{" "}
                <span className="font-semibold text-primary">
                  {payout.bankName}
                </span>
              </p>
              <p className="text-secondary">
                Account Title:{" "}
                <span className="font-semibold text-primary">
                  {payout.bankAccountName}
                </span>
              </p>
              <p className="text-secondary">
                Account / IBAN:{" "}
                <span className="font-mono font-semibold text-primary">
                  {payout.bankAccountNumber}
                </span>
              </p>
            </div>
          </div>

          {/* Stripe Connect Account */}
          <div className="p-4 bg-white rounded-xl border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Stripe Connect Express</span>
            </div>
            <div className="text-xs space-y-1 pt-1">
              <p className="text-secondary">
                Connect Status:{" "}
                {payout.stripeAccountId ? (
                  <span className="font-semibold text-emerald-600">
                    Connected ({payout.stripeAccountId})
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600">
                    Not Linked
                  </span>
                )}
              </p>
              {payout.stripeTransferId && (
                <p className="text-secondary">
                  Transfer Ref:{" "}
                  <span className="font-mono font-semibold text-primary">
                    {payout.stripeTransferId}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Linked Sub-Orders Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-secondary" />
              <span>Linked Delivered Sub-Orders ({subOrders.length})</span>
            </h4>
            <span className="text-[11px] text-secondary">
              Settlement breakdown per customer order
            </span>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-secondary font-semibold border-b border-border sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">SubOrder ID</th>
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-right">Commission</th>
                    <th className="py-2.5 px-3 text-right">Vendor Earning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-secondary text-xs"
                      >
                        {isLoading
                          ? "Loading sub-orders..."
                          : "No linked sub-orders found"}
                      </td>
                    </tr>
                  ) : (
                    subOrders.map((item) => (
                      <tr key={item.subOrderId} className="hover:bg-muted/40">
                        <td className="py-2.5 px-3 font-mono font-medium text-primary">
                          #{item.subOrderId.slice(-8)}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-secondary">
                          {item.subOrder?.order?.orderNumber ||
                            item.subOrder?.orderId ||
                            "N/A"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-primary font-medium">
                          {formatCurrency(Number(item.subOrder?.subtotal || 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right text-indigo-600 font-medium">
                          -
                          {formatCurrency(
                            Number(item.subOrder?.commissionAmount || 0)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                          {formatCurrency(
                            Number(item.subOrder?.vendorEarning || 0)
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sub-order Financial Totals */}
            {subOrders.length > 0 && (
              <div className="bg-muted/50 p-3 border-t border-border flex items-center justify-between text-xs font-semibold">
                <span className="text-secondary">Totals:</span>
                <div className="flex items-center gap-6">
                  <span className="text-primary">
                    Gross: {formatCurrency(totalGrossSubtotal)}
                  </span>
                  <span className="text-indigo-600">
                    Platform Commission: {formatCurrency(totalCommission)}
                  </span>
                  <span className="text-emerald-600 font-bold text-sm">
                    Net Settlement: {formatCurrency(totalVendorNet)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stripe Balance Availability Alert */}
        {payout.status !== "PAID" && payout.stripeAccountId && (
          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${isStripeBalanceAvailable ? "text-emerald-600" : "text-amber-600"}`} />
              <div>
                <p className="font-bold text-primary">
                  {isStripeBalanceAvailable
                    ? "Stripe Funds Available for Instant Transfer"
                    : "Awaiting Stripe 2-Day Balance Clearance"}
                </p>
                <p className="text-secondary mt-0.5">
                  Available in Master Stripe: <strong className="text-primary">{formatCurrency(stripeBalance?.available ?? 0)}</strong> &bull; Required: <strong className="text-primary">{formatCurrency(Number(payout.amount))}</strong>
                  {!isStripeBalanceAvailable && (
                    <span className="block text-amber-700 mt-1">
                      Customer funds ({formatCurrency(stripeBalance?.pending ?? 0)}) are clearing in Stripe&apos;s standard rolling window. You can disburse once available or confirm via manual bank wire.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <a
              href="https://dashboard.stripe.com/balance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0"
            >
              Stripe Balance &rarr;
            </a>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-border space-y-4">
          {showRefInput && (
            <div className="p-3 bg-muted/70 rounded-xl border border-border space-y-2">
              <label className="text-xs font-bold text-primary block">
                Wire Reference / Transaction Number (Optional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTransferRef}
                  onChange={(e) => setCustomTransferRef(e.target.value)}
                  placeholder="e.g. WIRE-892348 or Bank Confirmation Code"
                  className="flex-1 px-3 py-2 bg-white border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-primary"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTriggerUpdateStatus("PAID")}
                  isLoading={updateStatusMutation.isPending}
                >
                  Confirm Settlement
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRefInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {payout.status !== "PAID" && (
                <>
                  {payout.stripeAccountId ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleTriggerDisburseStripe}
                      isLoading={disburseStripeMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      Disburse via Stripe
                    </Button>
                  ) : null}

                  {!showRefInput && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRefInput(true)}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Mark as Paid (Bank Wire)
                    </Button>
                  )}

                  {payout.status === "UNPAID" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTriggerUpdateStatus("PROCESSING")}
                      isLoading={updateStatusMutation.isPending}
                      className="gap-1.5"
                    >
                      <Clock className="w-4 h-4 text-amber-600" />
                      Set to Processing
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTriggerUpdateStatus("FAILED")}
                    isLoading={updateStatusMutation.isPending}
                    className="text-rose-700 border-rose-200 hover:bg-rose-50 gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Reject / Revert
                  </Button>
                </>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>

    {/* Confirmation Modal */}
    <ConfirmationModal
      isOpen={!!confirmingAction}
      onClose={() => {
        if (!updateStatusMutation.isPending && !disburseStripeMutation.isPending) {
          setConfirmingAction(null);
        }
      }}
      onConfirm={handleConfirmAction}
      title={
        confirmingAction?.type === "DISBURSE_STRIPE"
          ? "Disburse Funds via Stripe Connect"
          : confirmingAction?.targetStatus === "PAID"
          ? "Confirm Bank Wire Settlement"
          : confirmingAction?.targetStatus === "PROCESSING"
          ? "Mark Payout as Processing"
          : "Reject / Revert Payout Request"
      }
      confirmText={
        confirmingAction?.type === "DISBURSE_STRIPE"
          ? `Disburse ${formatCurrency(payout.amount)}`
          : confirmingAction?.targetStatus === "PAID"
          ? "Confirm Settlement (Mark Paid)"
          : confirmingAction?.targetStatus === "PROCESSING"
          ? "Set to Processing"
          : "Reject Payout Request"
      }
      variant={
        confirmingAction?.targetStatus === "FAILED"
          ? "danger"
          : confirmingAction?.targetStatus === "PROCESSING"
          ? "warning"
          : "primary"
      }
      isLoading={updateStatusMutation.isPending || disburseStripeMutation.isPending}
      description={
        confirmingAction ? (
          <div className="space-y-2">
            {confirmingAction.type === "DISBURSE_STRIPE" ? (
              <>
                <p>
                  Execute an automated instant payout transfer of{" "}
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(payout.amount)}
                  </span>{" "}
                  to merchant{" "}
                  <span className="font-bold text-primary">{payout.vendorName}</span> via Stripe Connect?
                </p>
                <p className="text-[11px] text-secondary">
                  Account: <span className="font-mono">{payout.stripeAccountId}</span>
                </p>
              </>
            ) : confirmingAction.targetStatus === "PAID" ? (
              <>
                <p>
                  Confirm that manual bank wire of{" "}
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(payout.amount)}
                  </span>{" "}
                  has been settled for{" "}
                  <span className="font-bold text-primary">{payout.vendorName}</span>?
                </p>
                {customTransferRef && (
                  <p className="text-[11px] text-secondary">
                    Reference: <span className="font-mono">{customTransferRef}</span>
                  </p>
                )}
              </>
            ) : confirmingAction.targetStatus === "PROCESSING" ? (
              <p>
                Move payout request for{" "}
                <span className="font-bold text-primary">{payout.vendorName}</span> (
                {formatCurrency(payout.amount)}) to in-progress processing?
              </p>
            ) : (
              <>
                <p>
                  Are you sure you want to reject/revert payout request for{" "}
                  <span className="font-bold text-primary">{payout.vendorName}</span> (
                  {formatCurrency(payout.amount)})?
                </p>
                <p className="text-[11px] text-highlight font-medium">
                  All associated sub-orders will be released back to the vendor&apos;s available withdrawal balance.
                </p>
              </>
            )}
          </div>
        ) : undefined
      }
    />
  </>
  );
};
