import React from "react";

export const DealsSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4 animate-pulse">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-xs"
          >
            <div className="h-3 w-28 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
            <div className="h-3 w-44 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-xs flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-3 border-b border-border px-3">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-9 w-64 bg-muted rounded-xl" />
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-2 border-b border-border px-3">
            <div className="col-span-1 h-3.5 w-6 bg-muted rounded" />
            <div className="col-span-4 h-3.5 w-28 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-20 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-20 bg-muted rounded" />
            <div className="col-span-1 h-3.5 w-16 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-16 bg-muted rounded ml-auto" />
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl bg-muted/70 border border-border"
            >
              <div className="col-span-1 h-3.5 w-4 bg-muted rounded" />
              <div className="col-span-4 space-y-1.5">
                <div className="h-3.5 w-36 bg-muted rounded" />
                <div className="h-2.5 w-48 bg-muted/60 rounded" />
              </div>
              <div className="col-span-2 h-3.5 w-20 bg-muted rounded" />
              <div className="col-span-2 h-4 w-16 bg-muted rounded" />
              <div className="col-span-1 h-3.5 w-16 bg-muted rounded" />
              <div className="col-span-2 flex justify-end gap-1">
                <div className="w-8 h-8 bg-muted rounded-l-[6px]" />
                <div className="w-8 h-8 bg-muted rounded-r-[6px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
