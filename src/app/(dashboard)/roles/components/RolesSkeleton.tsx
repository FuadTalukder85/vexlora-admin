"use client";

import React from "react";

export const RolesSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4 animate-pulse">
      {/* 3 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-6 w-14 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table & Controls Skeleton */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-xs flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-3.5">
          {/* Top Search Bar Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
            <div className="h-9 w-full max-w-md bg-muted rounded-xl" />
          </div>

          {/* Table Header Skeleton */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border px-3">
            <div className="col-span-1 h-3.5 w-6 bg-muted rounded" />
            <div className="col-span-4 h-3.5 w-28 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-16 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-24 bg-muted rounded" />
            <div className="col-span-2 h-3.5 w-24 bg-muted rounded" />
            <div className="col-span-1 h-3.5 w-14 bg-muted rounded ml-auto" />
          </div>

          {/* Table Rows Skeleton */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl bg-muted/60 border border-border"
            >
              <div className="col-span-1 h-3.5 w-4 bg-muted rounded" />
              <div className="col-span-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-4 w-12 bg-muted rounded-full" />
                </div>
                <div className="h-2.5 w-24 bg-muted/70 rounded" />
              </div>
              <div className="col-span-2 h-5 w-16 bg-muted rounded-full" />
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-muted rounded" />
                <div className="h-3.5 w-20 bg-muted rounded" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-muted rounded" />
                <div className="h-3.5 w-16 bg-muted rounded" />
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <div className="w-7 h-7 bg-muted rounded-lg" />
                <div className="w-7 h-7 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer Skeleton */}
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
