import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, action }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-border shadow-xs hover:shadow-md transition-shadow duration-200 p-6 flex flex-col gap-4",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            {title && <h3 className="text-base font-bold text-primary tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
