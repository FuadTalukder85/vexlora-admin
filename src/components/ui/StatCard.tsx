import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColorClass = "bg-primary/10 text-primary",
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold text-primary mt-1 tracking-tight">{value}</h4>
        {change && (
          <p className="text-xs font-medium mt-1.5 flex items-center gap-1">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-md font-semibold text-[11px]",
                isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}
            >
              {isPositive ? `+${change}` : `-${change}`}
            </span>
            <span className="text-secondary">vs last month</span>
          </p>
        )}
      </div>
      <div className={cn("p-3.5 rounded-2xl flex items-center justify-center", iconColorClass)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
