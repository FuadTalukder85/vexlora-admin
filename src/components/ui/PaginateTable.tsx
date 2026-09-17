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
}

export function PaginateTable<T>({
  data,
  columns,
  keyExtractor,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
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
}: PaginateTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset to page 1 whenever total data length changes significantly
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Safe slice for paginated data
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = showPagination
    ? data.slice(startIndex, startIndex + pageSize)
    : data;

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
        "bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col overflow-hidden w-full",
        className
      )}
    >
      {/* 1. Optional Top Card Header */}
      {(title || subtitle || action) && (
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          {headerContent}
        </div>
      )}

      {/* 3. Table Area with Fixed Header & Scrollable Body */}
      <div
        className="overflow-x-auto w-full flex-1"
        style={{ maxHeight, minHeight }}
      >
        <table className={cn("w-full border-collapse text-left min-w-max", tableClassName)}>
          <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-xs border-b border-slate-100">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={cn(
                    "py-3.5 px-5 text-xs font-bold text-primary uppercase tracking-wider",
                    headerAlignClasses[col.align || "left"],
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-primary">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "hover:bg-slate-100 transition-colors",
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

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          "py-2.5 px-5",
                          alignClasses[col.align || "left"],
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
                    {emptyIcon || <Inbox className="w-8 h-8 text-slate-300" />}
                    <p className="text-xs font-semibold text-secondary">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Optional Pagination Footer */}
      {showPagination && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={pageSizeOptions}
          showPageSizeSelector={showPageSizeSelector}
        />
      )}
    </div>
  );
}
