import React from "react";

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full pb-12 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted/70 rounded" />
        </div>
        <div className="h-7 w-28 bg-muted rounded-full" />
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        <div className="h-10 w-32 bg-muted rounded-xl" />
        <div className="h-10 w-36 bg-muted rounded-xl" />
        <div className="h-10 w-36 bg-muted rounded-xl" />
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white border border-border rounded-2xl space-y-4">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-muted rounded-full" />
            <div className="h-10 w-36 bg-muted rounded-xl" />
          </div>
        </div>
        <div className="p-6 bg-white border border-border rounded-2xl space-y-4">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 w-full bg-muted rounded-xl" />
            <div className="h-10 w-full bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
