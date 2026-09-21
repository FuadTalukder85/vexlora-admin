"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted text-center">
      <div className="w-16 h-16 rounded-2xl bg-highlight/10 text-highlight flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-primary tracking-tight">Something went wrong</h2>
      <p className="text-xs text-secondary mt-1 max-w-sm">
        {error.message || "An unexpected error occurred while loading this administrative view."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={() => reset()}>
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
