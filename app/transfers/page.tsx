"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    ArrowLeftRight,
    Plus,
    Search,
    Eye,
    Download,
    RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    DRAFT: "secondary",
    PENDING: "warning",
    IN_TRANSIT: "info",
    RECEIVED: "success",
    CANCELLED: "destructive",
}

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Nháp",
    PENDING: "Chờ duyệt",
    IN_TRANSIT: "Đang chuyển",
    RECEIVED: "Đã nhận",
    CANCELLED: "Đã hủy",
}

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        fetchTransfers()
    }, [])

    const fetchTransfers = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/transfers")
            setTransfers(response.data || [])
        } catch (error: any) {
            console.error("Error fetching transfers:", error)
            showToast("Lỗi khi tải phiếu chuyển", "error")
        } finally {
            setLoading(false)
        }
    }

    const filteredTransfers = Array.isArray(transfers)
        ? transfers.filter((transfer) => {
            const matchesSearch = transfer.code
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
            const matchesStatus = !statusFilter || transfer.status === statusFilter
            return matchesSearch && matchesStatus
        })
        : []

    const columns: Column<any>[] = [
        {
            header: "Mã phiếu",
            accessorKey: "code",
            sortable: true,
            cell: (transfer) => (
                <div className="flex items-center">
                    <ArrowLeftRight className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="font-medium">{transfer.code}</span>
                </div>
            ),
        },
        {
            header: "Ngày chuyển",
            accessorKey: "date",
            sortable: true,
            cell: (transfer) => (
                <span className="text-muted-foreground">
                    {new Date(transfer.date).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            header: "Từ kho",
            accessorKey: "fromWarehouse.name",
            sortable: true,
            cell: (transfer) => <span>{transfer.fromWarehouse?.name || "N/A"}</span>,
        },
        {
            header: "Đến kho",
            accessorKey: "toWarehouse.name",
            sortable: true,
            cell: (transfer) => <span>{transfer.toWarehouse?.name || "N/A"}</span>,
        },
        {
            header: "Trạng thái",
            accessorKey: "status",
            sortable: true,
            cell: (transfer) => (
                <Badge variant={STATUS_VARIANTS[transfer.status] || "outline"}>
                    {STATUS_LABELS[transfer.status] || transfer.status}
                </Badge>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (transfer) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Xem"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="In"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Phiếu chuyển kho
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{transfers.length}</span>{" "}
                        phiếu
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchTransfers}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Link href="/transfers/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo phiếu chuyển
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã phiếu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="DRAFT">Nháp</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="IN_TRANSIT">Đang chuyển</option>
                        <option value="RECEIVED">Đã nhận</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredTransfers}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy phiếu chuyển nào"
            />
        </div>
    )
}
