"use client";

import React from "react";

export const RoleFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Back Button Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 bg-muted rounded-xl" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-48 bg-muted rounded-lg" />
              <div className="h-4 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-3 w-32 bg-muted/70 rounded" />
          </div>
        </div>
        <div className="h-6 w-32 bg-muted rounded-full" />
      </div>

      {/* Role Details Card Skeleton */}
      <div className="bg-white p-5 rounded-2xl border border-border space-y-4 shadow-xs w-full">
        <div className="h-3.5 w-28 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-9 w-full bg-muted rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-9 w-full bg-muted rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-9 w-full bg-muted rounded-xl" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-16 w-full bg-muted rounded-xl" />
        </div>
      </div>

      {/* Dual Pane Permissions Matrix Skeleton */}
      <div className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-xs w-full">
        <div className="space-y-1.5">
          <div className="h-3.5 w-36 bg-muted rounded" />
          <div className="h-3 w-72 bg-muted/70 rounded" />
        </div>

        {/* Dual Pane Grid Skeleton */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 pt-2">
          {/* Left Pane */}
          <div className="flex-1 bg-white border border-border rounded-2xl flex flex-col h-[520px] overflow-hidden">
            <div className="p-4 bg-muted/30 border-b border-border space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                <div className="space-y-1">
                  <div className="h-3.5 w-36 bg-muted rounded" />
                  <div className="h-2.5 w-24 bg-muted/70 rounded" />
                </div>
              </div>
              <div className="h-9 w-full bg-muted rounded-xl" />
            </div>
            <div className="p-4 space-y-3 flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-muted/50 rounded-xl flex items-center justify-between px-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <div className="space-y-1">
                      <div className="h-3 w-28 bg-muted rounded" />
                      <div className="h-2 w-20 bg-muted/70 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-14 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Center Arrows */}
          <div className="flex flex-row lg:flex-col items-center justify-center gap-3 shrink-0 py-2">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-muted" />
          </div>

          {/* Right Pane */}
          <div className="flex-1 bg-white border border-border rounded-2xl flex flex-col h-[520px] overflow-hidden">
            <div className="p-4 bg-muted/30 border-b border-border space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                <div className="space-y-1">
                  <div className="h-3.5 w-36 bg-muted rounded" />
                  <div className="h-2.5 w-24 bg-muted/70 rounded" />
                </div>
              </div>
              <div className="h-9 w-full bg-muted rounded-xl" />
            </div>
            <div className="p-4 space-y-3 flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-muted/50 rounded-xl flex items-center justify-between px-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <div className="space-y-1">
                      <div className="h-3 w-28 bg-muted rounded" />
                      <div className="h-2 w-20 bg-muted/70 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-14 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Toolbar Skeleton */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <div className="h-9 w-20 bg-muted rounded-xl" />
        <div className="h-9 w-36 bg-muted rounded-xl" />
      </div>
    </div>
  );
};
