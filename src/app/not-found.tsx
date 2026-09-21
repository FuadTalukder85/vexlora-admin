import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted text-center">
      <h1 className="text-7xl font-black text-primary tracking-tighter">404</h1>
      <h2 className="text-xl font-bold text-primary mt-2">Page Not Found</h2>
      <p className="text-xs text-secondary mt-1 max-w-sm">
        The administration module or resource you requested does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="primary" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
