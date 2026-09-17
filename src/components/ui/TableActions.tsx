import React from "react";
import { cn } from "@/lib/utils";

export interface TableActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface TableActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  href?: string;
  hoverVariant?: "default" | "emerald" | "amber" | "danger" | "primary";
}

/**
 * Reusable container for table action buttons.
 * Automatically handles 1-button and multi-button (2+) grouping,
 * 6px border-radius rules, no-gap alignment, and alternating backgrounds.
 */
export const TableActions = React.forwardRef<HTMLDivElement, TableActionsProps>(
  ({ children, className, align = "right", ...props }, ref) => {
    const alignClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };

    return (
      <div
        ref={ref}
        className={cn("table-actions", alignClasses[align], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TableActions.displayName = "TableActions";

/**
 * Reusable table action button / link component.
 */
export const TableActionButton = React.forwardRef<
  HTMLButtonElement,
  TableActionButtonProps
>(
  (
    {
      as: Component = "button",
      hoverVariant = "default",
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const hoverVariantClasses = {
      default: "",
      emerald: "hover:text-emerald-600 hover:bg-emerald-50!",
      amber: "hover:text-amber-600 hover:bg-amber-50!",
      danger: "hover:text-rose-600 hover:bg-rose-50!",
      primary: "hover:text-primary hover:bg-slate-200!",
    };

    const componentProps = Component === "button" ? { type, ...props } : props;

    return (
      <Component
        ref={ref}
        className={cn(
          "table-action-btn",
          hoverVariantClasses[hoverVariant],
          className
        )}
        {...componentProps}
      >
        {children}
      </Component>
    );
  }
);
TableActionButton.displayName = "TableActionButton";
