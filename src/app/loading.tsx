import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      <p className="text-xs font-semibold text-secondary animate-pulse">Loading Admin Portal...</p>
    </div>
  );
}
