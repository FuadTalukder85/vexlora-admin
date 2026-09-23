"use client";

import React, { useState, useEffect } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "./Pagination";
export { TableActions, TableActionButton } from "./TableActions";
export type { TableActionsProps, TableActionButtonProps } from "./TableActions";

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  sticky?: "left" | "right";
  className?: string;
  headerClassName?: string;
}

export interface PaginateTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  showPageSizeSelector?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerContent?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  tableClassName?: string;
  maxHeight?: string;
  minHeight?: string;

  // Server-side pagination controls (optional)
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function PaginateTable<T>({
  data,
  columns,
  keyExtractor,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  showPagination = true,
  showPageSizeSelector = true,
  emptyMessage = "No records found",
  emptyIcon,
  title,
  subtitle,
  action,
  headerContent,
  onRowClick,
  className,
  tableClassName,
  maxHeight,
  minHeight,
  page,
  pageSize: propPageSize,
  totalItems: propTotalItems,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
}: PaginateTableProps<T>) {
  const isServerPaginated = typeof onPageChange === "function";

  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(defaultPageSize);

  // Reset local page when data length changes significantly in client-side mode
  useEffect(() => {
    if (!isServerPaginated) {
      setLocalPage(1);
    }
  }, [data.length, isServerPaginated]);

  const activePage = isServerPaginated ? (page ?? 1) : localPage;
  const activePageSize = isServerPaginated
    ? (propPageSize ?? defaultPageSize)
    : localPageSize;
  const activeTotalItems = isServerPaginated
    ? (propTotalItems ?? data.length)
    : data.length;
  const activeTotalPages = isServerPaginated
    ? (propTotalPages ?? (Math.ceil(activeTotalItems / activePageSize) || 1))
    : (Math.ceil(activeTotalItems / activePageSize) || 1);

  // If server paginated, data is already sliced for the current page; otherwise slice client-side
  const startIndex = (activePage - 1) * activePageSize;
  const paginatedData = isServerPaginated
    ? data
    : showPagination
    ? data.slice(startIndex, startIndex + activePageSize)
    : data;

  const handlePageChange = (newPage: number) => {
    if (isServerPaginated && onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isServerPaginated && onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setLocalPageSize(newSize);
      setLocalPage(1);
    }
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const headerAlignClasses = {
    left: "text-left justify-start",
    center: "text-center justify-center",
    right: "text-right justify-end",
  };

  return (
    <div
      className={cn(
        "bg-white border border-border rounded-2xl shadow-xs flex flex-col overflow-hidden w-full",
        className
      )}
    >
      {/* 1. Optional Top Card Header */}
      {(title || subtitle || action) && (
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-base font-bold text-primary tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      {/* 2. Optional Header Content (e.g. Filters, Search Bar) */}
      {headerContent && (
        <div className="p-4 border-b border-border bg-muted/50">
          {headerContent}
        </div>
      )}

      {/* 3. Table Area with Fixed Header & Scrollable Body */}
      <div
        className="overflow-auto w-full flex-1 relative"
        style={{ maxHeight, minHeight }}
      >
        <table className={cn("w-full border-collapse text-left min-w-max", tableClassName)}>
          <thead className="sticky top-0 z-20 bg-muted border-b border-border">
            <tr>
              {columns.map((col, index) => {
                const isStickyRight =
                  col.sticky === "right" ||
                  (col.align === "right" && index === columns.length - 1);

                return (
                  <th
                    key={index}
                    className={cn(
                      "py-3.5 px-5 text-xs font-bold text-primary uppercase tracking-wider",
                      headerAlignClasses[col.align || "left"],
                      isStickyRight &&
                        "sticky right-0 z-30 bg-muted shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] border-l border-border",
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-primary">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "group hover:bg-muted transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col, colIndex) => {
                    let content: React.ReactNode = null;
                    if (col.cell) {
                      content = col.cell(row, rowIndex);
                    } else if (col.accessorKey) {
                      content = String(row[col.accessorKey] ?? "");
                    }

                    const isStickyRight =
                      col.sticky === "right" ||
                      (col.align === "right" && colIndex === columns.length - 1);

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          "py-2.5 px-5",
                          alignClasses[col.align || "left"],
                          isStickyRight &&
                            "sticky right-0 z-10 bg-white group-hover:bg-muted transition-colors shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] border-l border-border",
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 px-5 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {emptyIcon || <Inbox className="w-8 h-8 text-secondary/60" />}
                    <p className="text-xs font-semibold text-secondary">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Optional Pagination Footer */}
      {showPagination && activeTotalItems > 0 && (
        <Pagination
          currentPage={activePage}
          totalPages={activeTotalPages}
          pageSize={activePageSize}
          totalItems={activeTotalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
          showPageSizeSelector={showPageSizeSelector}
        />
      )}
    </div>
  );
}
