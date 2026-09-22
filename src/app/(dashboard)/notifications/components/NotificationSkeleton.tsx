import React from "react";

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full pb-12 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted/70 rounded" />
        </div>
        <div className="h-8 w-32 bg-muted rounded-full" />
      </div>

      <div className="p-6 bg-white border border-border rounded-2xl space-y-4">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-4 w-80 bg-muted/70 rounded" />
      </div>

      <div className="p-6 bg-white border border-border rounded-2xl space-y-4">
        <div className="flex justify-between">
          <div className="h-5 w-44 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-muted rounded-lg" />
            <div className="h-8 w-24 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-16 w-full bg-muted/50 rounded-xl" />
          <div className="h-16 w-full bg-muted/50 rounded-xl" />
          <div className="h-16 w-full bg-muted/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
