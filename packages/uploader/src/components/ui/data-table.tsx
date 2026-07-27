"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  
  // Selection
  enableSelection?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  
  // Empty state
  emptyState?: React.ReactNode;
  
  // Row customizations
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  skeletonRows = 5,
  enableSelection = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  emptyState = "No results found",
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {enableSelection && (
                <TableHead className="w-12 pl-5 sm:pl-5">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onToggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((col, index) => (
                <TableHead key={index} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i} className="border-b border-border">
                  {enableSelection && (
                    <TableCell className="w-12 pl-5 sm:pl-5">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                  )}
                  {columns.map((col, idx) => (
                    <TableCell key={idx} className={col.className}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={enableSelection ? columns.length + 1 : columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds.includes(id);

                return (
                  <TableRow
                    key={id}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-border group hover:bg-muted/50 dark:hover:bg-muted/50 ${
                      rowClassName ? rowClassName(item) : ""
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {enableSelection && (
                      <TableCell className="w-12 pl-5 sm:pl-5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect?.(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((col, idx) => (
                      <TableCell key={idx} className={col.className}>
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? (item[col.accessorKey] as React.ReactNode)
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
