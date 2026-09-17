"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAdminStore } from "@/stores/useAdminStore";
import { SettingsSkeleton } from "./components/SettingsSkeleton";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { isInitialChecking } = useAdminStore();
  const [platformName, setPlatformName] = useState("Vexlora Marketplace");
  const [defaultCommission, setDefaultCommission] = useState(10.0);
  const [escrowHoldDays, setEscrowHoldDays] = useState(7);
  const [supportEmail, setSupportEmail] = useState("support@vexlora.com");
  const [isSaving, setIsSaving] = useState(false);

  if (isInitialChecking) {
    return <SettingsSkeleton />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast.success("Platform settings saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Platform Configuration</h1>
        <p className="text-xs text-secondary mt-1">
          Global marketplace parameters, commission defaults, escrow clearance schedules, and support contact details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="General Marketplace Settings" subtitle="Brand and support identifiers">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Display Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              required
            />
            <Input
              label="Official Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
          </div>
        </Card>

        <Card title="Financial & Commission Defaults" subtitle="Standard rates and escrow clearance rules">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Vendor Commission Rate (%)"
              type="number"
              step="0.1"
              value={defaultCommission}
              onChange={(e) => setDefaultCommission(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Escrow Hold Period (Days after delivery)"
              type="number"
              value={escrowHoldDays}
              onChange={(e) => setEscrowHoldDays(parseInt(e.target.value) || 0)}
              required
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            <Save className="w-4 h-4" />
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
