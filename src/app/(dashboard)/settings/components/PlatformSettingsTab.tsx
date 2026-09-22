"use client";

import React, { useState, useEffect } from "react";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PlatformSetting, StripePlatformBalance } from "@/hooks/useAdminSettings";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PlatformSettingsTabProps {
  platformSettings?: PlatformSetting;
  stripeBalance?: StripePlatformBalance | null;
  onUpdatePlatformSettings: (data: Partial<PlatformSetting>) => Promise<any>;
  isUpdating: boolean;
}

export const PlatformSettingsTab: React.FC<PlatformSettingsTabProps> = ({
  platformSettings,
  stripeBalance,
  onUpdatePlatformSettings,
  isUpdating,
}) => {
  const [platformName, setPlatformName] = useState(platformSettings?.platformName || "Vexlora Marketplace");
  const [supportEmail, setSupportEmail] = useState(platformSettings?.supportEmail || "support@vexlora.com");
  const [supportPhone, setSupportPhone] = useState(platformSettings?.supportPhone || "+1 (555) 019-2834");
  const [currency, setCurrency] = useState(platformSettings?.currency || "USD");
  const [defaultCommission, setDefaultCommission] = useState(Number(platformSettings?.defaultCommissionRate || 10.0));
  const [minPayoutAmount, setMinPayoutAmount] = useState(Number(platformSettings?.minPayoutAmount || 50.0));
  const [escrowHoldDays, setEscrowHoldDays] = useState(Number(platformSettings?.escrowHoldDays || 7));
  const [allowVendorRegistration, setAllowVendorRegistration] = useState(platformSettings?.allowVendorRegistration ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(platformSettings?.maintenanceMode ?? false);
  const [emailNotifications, setEmailNotifications] = useState(platformSettings?.emailNotifications ?? true);
  const [systemAlerts, setSystemAlerts] = useState(platformSettings?.systemAlerts ?? true);

  useEffect(() => {
    if (platformSettings) {
      setPlatformName(platformSettings.platformName || "Vexlora Marketplace");
      setSupportEmail(platformSettings.supportEmail || "support@vexlora.com");
      setSupportPhone(platformSettings.supportPhone || "+1 (555) 019-2834");
      setCurrency(platformSettings.currency || "USD");
      setDefaultCommission(Number(platformSettings.defaultCommissionRate || 10.0));
      setMinPayoutAmount(Number(platformSettings.minPayoutAmount || 50.0));
      setEscrowHoldDays(Number(platformSettings.escrowHoldDays || 7));
      setAllowVendorRegistration(platformSettings.allowVendorRegistration ?? true);
      setMaintenanceMode(platformSettings.maintenanceMode ?? false);
      setEmailNotifications(platformSettings.emailNotifications ?? true);
      setSystemAlerts(platformSettings.systemAlerts ?? true);
    }
  }, [platformSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdatePlatformSettings({
        platformName: platformName.trim(),
        supportEmail: supportEmail.trim(),
        supportPhone: supportPhone.trim() || null,
        currency: currency.trim(),
        defaultCommissionRate: defaultCommission,
        minPayoutAmount,
        escrowHoldDays,
        allowVendorRegistration,
        maintenanceMode,
        emailNotifications,
        systemAlerts,
      });
      toast.success("Platform configuration updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update platform settings");
    }
  };

  return (
    <div className="space-y-6">
      {stripeBalance && (
        <Card title="Stripe Platform Balance" subtitle="Live account balances from connected Stripe platform">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <span className="text-xs font-semibold text-secondary block">Available Stripe Balance</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">
                {formatCurrency(stripeBalance.available || 0, stripeBalance.currency || "USD")}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <span className="text-xs font-semibold text-secondary block">Pending Stripe Balance</span>
              <span className="text-xl font-bold text-amber-600 mt-1 block">
                {formatCurrency(stripeBalance.pending || 0, stripeBalance.currency || "USD")}
              </span>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Marketplace Branding & Support" subtitle="Customer-facing store identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Display Name *"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Vexlora Marketplace"
              required
            />
            <Input
              label="Official Support Email *"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@vexlora.com"
              required
            />
            <Input
              label="Support Phone Line"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
            />
            <Input
              label="Default Platform Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="USD"
              required
            />
          </div>
        </Card>

        <Card title="Financial Rules & Commission Defaults" subtitle="Platform commission, escrow periods, and payout minimums">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Default Vendor Commission (%) *"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={defaultCommission}
              onChange={(e) => setDefaultCommission(parseFloat(e.target.value) || 0)}
              helperText="Standard rate applied to new stores"
              required
            />
            <Input
              label="Escrow Hold Period (Days) *"
              type="number"
              min="0"
              max="90"
              value={escrowHoldDays}
              onChange={(e) => setEscrowHoldDays(parseInt(e.target.value) || 0)}
              helperText="Days after delivery before payout clearance"
              required
            />
            <Input
              label="Minimum Payout Threshold ($) *"
              type="number"
              min="0"
              value={minPayoutAmount}
              onChange={(e) => setMinPayoutAmount(parseFloat(e.target.value) || 0)}
              helperText="Minimum vendor earnings to request withdrawal"
              required
            />
          </div>
        </Card>

        <Card title="Operational Controls & Governance" subtitle="Marketplace registration and maintenance toggles">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-white">
              <div>
                <span className="text-xs font-bold text-primary block">Allow New Vendor Registrations</span>
                <span className="text-[11px] text-secondary">
                  When enabled, prospective merchants can apply to sell on Vexlora.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAllowVendorRegistration(!allowVendorRegistration)}
                className="p-1 text-primary cursor-pointer"
              >
                {allowVendorRegistration ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-secondary" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-white">
              <div>
                <span className="text-xs font-bold text-primary block">Platform Maintenance Mode</span>
                <span className="text-[11px] text-secondary">
                  Halt checkout operations temporarily for scheduled platform maintenance.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="p-1 text-primary cursor-pointer"
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-8 h-8 text-highlight" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-secondary" />
                )}
              </button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
            <Save className="w-4 h-4" />
            Save Platform Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
