"use client";

import React, { useState } from "react";
import { Sliders } from "lucide-react";
import { useAdminSettingsData } from "@/hooks/useAdminSettings";
import { SettingsSkeleton } from "./components/SettingsSkeleton";
import { PlatformSettingsTab } from "./components/PlatformSettingsTab";
import { cn } from "@/lib/utils";

type AdminSettingsTab = "platform";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<AdminSettingsTab>("platform");

  const {
    platformSettings,
    stripeBalance,
    isLoading,
    updatePlatformSettings,
    isUpdatingPlatformSettings,
  } = useAdminSettingsData();

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  const tabs: { id: AdminSettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "platform", label: "Platform & Marketplace", icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Platform Settings</h1>
          <p className="text-xs text-secondary mt-1">
            Global marketplace governance, financial parameters, default commissions, and operational controls.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border no-scrollbar w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer",
              activeTab === tab.id
                ? "bg-primary text-white shadow-xs"
                : "text-secondary hover:text-primary hover:bg-muted/70"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === "platform" && (
          <PlatformSettingsTab
            platformSettings={platformSettings}
            stripeBalance={stripeBalance}
            onUpdatePlatformSettings={updatePlatformSettings}
            isUpdating={isUpdatingPlatformSettings}
          />
        )}
      </div>
    </div>
  );
}
