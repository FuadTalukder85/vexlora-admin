"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ImageUploadDropzoneProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  aspectRatio?: "square" | "banner" | "document";
  label?: string;
  helperText?: string;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  currentUrl,
  onUpload,
  onRemove,
  aspectRatio = "square",
  label,
  helperText = "PNG, JPG, WEBP up to 5MB",
  maxSizeMB = 5,
  accept = "image/png,image/jpeg,image/webp",
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Validate type
    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const isAccepted = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        const prefix = type.replace("/*", "");
        return fileType.startsWith(prefix);
      }
      return fileType === type || file.name.toLowerCase().endsWith(type.replace(".", ""));
    });

    if (!isAccepted && accept !== "*") {
      setError(`Invalid file format. Accepted: ${accept}`);
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(file);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = async () => {
    if (!onRemove || disabled || isRemoving) return;
    try {
      setIsRemoving(true);
      setError(null);
      await onRemove();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to remove image");
    } finally {
      setIsRemoving(false);
    }
  };

  const aspectClasses = {
    square: "w-32 h-32 rounded-2xl",
    banner: "w-full h-44 rounded-2xl",
    document: "w-full h-32 rounded-2xl",
  };

  const isPdf = currentUrl?.toLowerCase().includes(".pdf");

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-primary tracking-wide block">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Preview or Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !isUploading && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={cn(
            "relative border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden bg-muted/40 hover:bg-muted/70 group",
            aspectClasses[aspectRatio],
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-muted/40"
          )}
        >
          {currentUrl ? (
            <>
              {isPdf ? (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <FileText className="w-10 h-10 text-primary mb-2" />
                  <span className="text-xs font-medium text-primary line-clamp-1">PDF Document</span>
                </div>
              ) : (
                <Image src={currentUrl} alt={label || "Uploaded Image"} fill className="object-cover" />
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white p-2">
                <RefreshCw className="w-6 h-6 mb-1 animate-spin-slow" />
                <span className="text-xs font-semibold">Click to Replace</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="p-2.5 rounded-full bg-white border border-border shadow-xs text-primary mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-primary">Click or drag file to upload</p>
              <p className="text-[10px] text-secondary mt-0.5">{helperText}</p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1.5" />
              <span className="text-xs font-semibold text-primary">Uploading...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              {currentUrl ? "Replace File" : "Choose File"}
            </Button>

            {currentUrl && onRemove && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={disabled || isUploading || isRemoving}
                isLoading={isRemoving}
                onClick={handleRemove}
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-[11px] text-secondary">
            {helperText} &bull; Max {maxSizeMB}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-highlight font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
