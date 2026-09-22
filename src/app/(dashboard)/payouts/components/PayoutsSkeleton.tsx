"use client";

import React from "react";

export const PayoutsSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4 animate-pulse">
      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 bg-muted rounded w-28" />
              <div className="w-8 h-8 rounded-xl bg-muted" />
            </div>
            <div className="h-7 bg-muted rounded w-36" />
            <div className="h-2.5 bg-muted rounded w-48" />
          </div>
        ))}
      </div>

      {/* Table & Controls Skeleton */}
      <div className="bg-white rounded-2xl border border-border p-4 space-y-4 flex-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-muted rounded w-20" />
            ))}
          </div>
          <div className="h-9 bg-muted rounded-xl w-64" />
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-12 bg-muted/60 rounded-xl flex items-center justify-between px-4"
            >
              <div className="h-4 bg-muted rounded w-40" />
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-6 bg-muted rounded-full w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
