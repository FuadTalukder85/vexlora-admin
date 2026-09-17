import React from "react";

export const CategoriesSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4 animate-pulse">
      {/* 3 Taxonomy Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs"
          >
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-44 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 px-3">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="h-9 w-64 bg-slate-100 rounded-xl" />
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-100 px-3">
            <div className="col-span-1 h-3.5 w-6 bg-slate-200 rounded" />
            <div className="col-span-3 h-3.5 w-24 bg-slate-200 rounded" />
            <div className="col-span-2 h-3.5 w-16 bg-slate-200 rounded" />
            <div className="col-span-2 h-3.5 w-20 bg-slate-200 rounded" />
            <div className="col-span-2 h-3.5 w-16 bg-slate-200 rounded" />
            <div className="col-span-2 h-3.5 w-16 bg-slate-200 rounded ml-auto" />
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl bg-slate-50/70 border border-slate-100"
            >
              <div className="col-span-1 h-3.5 w-4 bg-slate-200 rounded" />
              <div className="col-span-3 space-y-1.5">
                <div className="h-3.5 w-36 bg-slate-200 rounded" />
                <div className="h-2.5 w-48 bg-slate-200/60 rounded" />
              </div>
              <div className="col-span-2 h-3.5 w-24 bg-slate-200 rounded" />
              <div className="col-span-2 h-4 w-14 bg-slate-200 rounded" />
              <div className="col-span-2 h-3.5 w-16 bg-slate-200 rounded" />
              <div className="col-span-2 flex justify-end gap-1">
                <div className="w-8 h-8 bg-slate-200 rounded-l-[6px]" />
                <div className="w-8 h-8 bg-slate-200 rounded-r-[6px]" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <div className="h-3.5 w-32 bg-slate-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
