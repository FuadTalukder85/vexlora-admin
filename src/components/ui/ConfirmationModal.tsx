"use client";

import React from "react";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon,
  children,
  maxWidth = "sm",
}) => {
  const variantIcons = {
    danger: <Trash2 className="w-5 h-5 text-highlight" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    primary: <Info className="w-5 h-5 text-primary" />,
  };

  const iconContainers = {
    danger: "bg-highlight/10 border-highlight/20",
    warning: "bg-amber-50 border-amber-200",
    primary: "bg-primary/10 border-primary/20",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      maxWidth={maxWidth}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
              iconContainers[variant]
            )}
          >
            {icon || variantIcons[variant]}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            {description && (
              <div className="text-xs text-secondary leading-relaxed">{description}</div>
            )}
            {children}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : variant === "warning" ? "highlight" : "primary"}
            size="sm"
            isLoading={isLoading}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
