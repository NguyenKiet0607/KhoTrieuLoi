"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    PackageMinus,
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

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Nháp",
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    DRAFT: "secondary",
    PENDING: "warning",
    APPROVED: "info",
    COMPLETED: "success",
    CANCELLED: "destructive",
}

export default function IssuesPage() {
    const [issues, setIssues] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        fetchIssues()
    }, [])

    const fetchIssues = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/issues")
            setIssues(response.data || [])
        } catch (error: any) {
            console.error("Error fetching issues:", error)
            showToast("Lỗi khi tải phiếu xuất", "error")
        } finally {
            setLoading(false)
        }
    }

    const filteredIssues = Array.isArray(issues)
        ? issues.filter((issue) => {
            const matchesSearch =
                issue.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.receiver?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = !statusFilter || issue.status === statusFilter
            return matchesSearch && matchesStatus
        })
        : []

    const columns: Column<any>[] = [
        {
            header: "Mã phiếu",
            accessorKey: "code",
            sortable: true,
            cell: (issue) => (
                <div className="flex items-center font-medium">
                    <PackageMinus className="w-4 h-4 text-red-600 mr-2" />
                    {issue.code}
                </div>
            ),
        },
        {
            header: "Ngày xuất",
            accessorKey: "date",
            sortable: true,
            cell: (issue) => (
                <span className="text-muted-foreground">
                    {new Date(issue.date).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            header: "Người nhận",
            accessorKey: "receiver",
            sortable: true,
            cell: (issue) => <div className="line-clamp-1">{issue.receiver}</div>,
        },
        {
            header: "Tổng tiền",
            accessorKey: "totalAmount",
            sortable: true,
            className: "text-right",
            cell: (issue) => (
                <span className="font-bold">
                    {issue.totalAmount?.toLocaleString()} đ
                </span>
            ),
        },
        {
            header: "Trạng thái",
            accessorKey: "status",
            className: "text-center",
            cell: (issue) => (
                <Badge variant={STATUS_VARIANTS[issue.status] || "secondary"}>
                    {STATUS_LABELS[issue.status] || issue.status}
                </Badge>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (issue) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="In phiếu"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Xem chi tiết"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Phiếu xuất kho</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{issues.length}</span>{" "}
                        phiếu
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchIssues}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Link href="/issues/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo phiếu xuất
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã phiếu hoặc người nhận..."
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
                        {Object.keys(STATUS_LABELS).map((status) => (
                            <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredIssues}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy phiếu xuất nào"
            />
        </div>
    )
}
