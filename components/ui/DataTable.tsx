"use client"

import * as React from "react"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export interface Column<T> {
    header: string | React.ReactNode
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
    sortable?: boolean
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (item: T) => string
    isLoading?: boolean
    onRowClick?: (item: T) => void
    selectedIds?: string[]
    onSelectAll?: (checked: boolean) => void
    onSelectOne?: (id: string) => void
    sortColumn?: keyof T | string
    sortDirection?: "asc" | "desc"
    onSort?: (column: keyof T | string) => void
    pagination?: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
    }
    emptyMessage?: string
    renderSubComponent?: (item: T) => React.ReactNode
    expandedIds?: string[]
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    isLoading = false,
    onRowClick,
    selectedIds,
    onSelectAll,
    onSelectOne,
    sortColumn,
    sortDirection,
    onSort,
    pagination,
    emptyMessage = "Không có dữ liệu",
    renderSubComponent,
    expandedIds,
}: DataTableProps<T>) {
    const isAllSelected =
        data.length > 0 && selectedIds?.length === data.length
    const isPartiallySelected =
        selectedIds && selectedIds.length > 0 && selectedIds.length < data.length

    return (
        <div className="w-full space-y-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                {onSelectAll && (
                                    <th className="h-12 px-4 w-[50px]">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={isAllSelected}
                                            ref={(input) => {
                                                if (input) input.indeterminate = !!isPartiallySelected
                                            }}
                                            onChange={(e) => onSelectAll(e.target.checked)}
                                        />
                                    </th>
                                )}
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={cn(
                                            "h-12 px-4 align-middle font-medium text-muted-foreground transition-colors",
                                            col.sortable && "cursor-pointer hover:text-foreground",
                                            col.className
                                        )}
                                        onClick={() => col.sortable && onSort && col.accessorKey && onSort(col.accessorKey as string)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span>{col.header}</span>
                                            {col.sortable && sortColumn === col.accessorKey && (
                                                <span>
                                                    {sortDirection === "asc" ? (
                                                        <ArrowUp className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowDown className="h-3 w-3" />
                                                    )}
                                                </span>
                                            )}
                                            {col.sortable && sortColumn !== col.accessorKey && (
                                                <ArrowUpDown className="h-3 w-3 opacity-50" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                // Skeleton Loading
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        {onSelectAll && (
                                            <td className="p-4">
                                                <div className="h-4 w-4 bg-muted rounded" />
                                            </td>
                                        )}
                                        {columns.map((_, colIndex) => (
                                            <td key={colIndex} className="p-4">
                                                <div className="h-4 bg-muted rounded w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                // Empty State
                                <tr>
                                    <td
                                        colSpan={columns.length + (onSelectAll ? 1 : 0)}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                // Data Rows
                                data.map((item, index) => {
                                    const id = keyExtractor(item)
                                    const isSelected = selectedIds?.includes(id)
                                    const isExpanded = expandedIds?.includes(id)

                                    return (
                                        <React.Fragment key={id}>
                                            <motion.tr
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                                className={cn(
                                                    "group transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                                                    onRowClick && "cursor-pointer",
                                                    isExpanded && "bg-muted/50"
                                                )}
                                                data-state={isSelected ? "selected" : undefined}
                                                onClick={(e) => {
                                                    // Prevent row click when clicking checkbox or actions
                                                    if (
                                                        (e.target as HTMLElement).closest("input[type='checkbox']") ||
                                                        (e.target as HTMLElement).closest("button")
                                                    ) {
                                                        return
                                                    }
                                                    onRowClick?.(item)
                                                }}
                                            >
                                                {onSelectOne && (
                                                    <td className="p-4 w-[50px]">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                            checked={isSelected}
                                                            onChange={() => onSelectOne(id)}
                                                        />
                                                    </td>
                                                )}
                                                {columns.map((col, colIndex) => (
                                                    <td key={colIndex} className={cn("p-4 align-middle", col.className)}>
                                                        {col.cell
                                                            ? col.cell(item)
                                                            : (item[col.accessorKey as keyof T] as React.ReactNode)}
                                                    </td>
                                                ))}
                                            </motion.tr>
                                            {isExpanded && renderSubComponent && (
                                                <tr className="bg-muted/30">
                                                    <td colSpan={columns.length + (onSelectOne ? 1 : 0)} className="p-4">
                                                        {renderSubComponent(item)}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Trang {pagination.currentPage} / {pagination.totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => pagination.onPageChange(1)}
                            disabled={pagination.currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => pagination.onPageChange(pagination.totalPages)}
                            disabled={pagination.currentPage === pagination.totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
