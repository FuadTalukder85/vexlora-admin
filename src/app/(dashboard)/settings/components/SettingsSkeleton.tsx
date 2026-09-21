import React from "react";

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded" />
        <div className="h-3.5 w-80 bg-muted/70 rounded" />
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-muted rounded-xl" />
            <div className="h-10 bg-muted rounded-xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-muted rounded-xl" />
            <div className="h-10 bg-muted rounded-xl" />
          </div>
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-36 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
};
