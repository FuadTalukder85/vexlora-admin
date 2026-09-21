import React from "react";

export const UsersSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4 animate-pulse">
      {/* Top Filter */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-16 bg-muted rounded-md" />
          ))}
        </div>
        <div className="h-9 w-full sm:w-64 bg-muted rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-xs flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border px-3">
            <div className="col-span-1 h-3.5 w-6 bg-muted rounded" />
            <div className="col-span-4 h-3.5 w-28 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-16 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-16 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-20 bg-muted rounded" />
            <div className="col-span-1 h-3.5 w-14 bg-muted rounded ml-auto" />
          </div>

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl bg-muted/70 border border-border"
            >
              <div className="col-span-1 h-3.5 w-4 bg-muted rounded" />
              <div className="col-span-4 space-y-1">
                <div className="h-3.5 w-32 bg-muted rounded" />
                <div className="h-2.5 w-44 bg-muted/70 rounded" />
              </div>
              <div className="col-span-2 h-5 w-20 bg-muted rounded-full" />
              <div className="col-span-2 h-5 w-16 bg-muted rounded-full" />
              <div className="col-span-2 h-3.5 w-20 bg-muted rounded" />
              <div className="col-span-1 flex justify-end gap-2">
                <div className="w-7 h-7 bg-muted rounded-lg" />
                <div className="w-7 h-7 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <div className="h-3.5 w-32 bg-muted rounded" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-lg" />
            <div className="w-8 h-8 bg-muted rounded-lg" />
            <div className="w-8 h-8 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
