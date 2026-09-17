import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Header Skeleton */}
      <div className="h-28 w-full bg-slate-200/80 rounded-2xl flex flex-col justify-center p-6 space-y-2">
        <div className="h-3 w-36 bg-slate-300 rounded" />
        <div className="h-6 w-64 bg-slate-300 rounded" />
        <div className="h-3 w-48 bg-slate-300 rounded" />
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="w-9 h-9 rounded-xl bg-slate-200" />
            </div>
            <div className="h-7 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid: Escrow & Actions Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-24 w-full bg-slate-100 rounded-xl" />
          <div className="h-9 w-full bg-slate-200 rounded-xl" />
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl p-4 space-y-2" />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
