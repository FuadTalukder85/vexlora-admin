import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-primary tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-secondary">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-10 rounded-xl border border-border bg-white px-3.5 text-sm text-primary placeholder:text-secondary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-75",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-highlight focus:border-highlight focus:ring-rose-500/10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-secondary">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-highlight font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-secondary font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
