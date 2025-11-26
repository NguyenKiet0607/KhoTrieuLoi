"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    Activity,
    Search,
    Download,
    User,
    Package,
    ShoppingCart,
    FileText,
    RefreshCw,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

const ACTION_ICONS: any = {
    CREATE: Package,
    UPDATE: FileText,
    DELETE: ShoppingCart,
    LOGIN: User,
}

const ACTION_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    CREATE: "success",
    UPDATE: "info",
    DELETE: "destructive",
    LOGIN: "secondary",
}

const ACTION_LABELS: Record<string, string> = {
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
    LOGIN: "Đăng nhập",
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [actionFilter, setActionFilter] = useState("")

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/activity-logs")
            setLogs(response.data || [])
        } catch (error: any) {
            console.error("Error fetching logs:", error)
            showToast("Lỗi khi tải nhật ký", "error")
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.User?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesAction = !actionFilter || log.action === actionFilter
        return matchesSearch && matchesAction
    })

    const columns: Column<any>[] = [
        {
            header: "Hành động",
            accessorKey: "action",
            sortable: true,
            cell: (log) => {
                const Icon = ACTION_ICONS[log.action] || Activity
                return (
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-muted rounded-lg flex items-center justify-center mr-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <div className="font-medium">
                                {ACTION_LABELS[log.action] || log.action}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {log.entity} {log.entityId ? `#${log.entityId}` : ""}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            header: "Người dùng",
            accessorKey: "User.name",
            sortable: true,
            cell: (log) => (
                <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{log.User?.name || "Unknown User"}</span>
                </div>
            ),
        },
        {
            header: "Chi tiết",
            accessorKey: "details",
            cell: (log) => (
                <div className="text-sm text-muted-foreground line-clamp-1" title={log.details}>
                    {log.details}
                </div>
            ),
        },
        {
            header: "Thời gian",
            accessorKey: "createdAt",
            sortable: true,
            cell: (log) => (
                <span className="text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                </span>
            ),
        },
        {
            header: "Trạng thái",
            accessorKey: "action",
            className: "text-center",
            cell: (log) => (
                <Badge variant={ACTION_VARIANTS[log.action] || "outline"}>
                    {log.action}
                </Badge>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Nhật ký hoạt động
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{logs.length}</span> hoạt
                        động
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchLogs}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm hoạt động..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Tất cả hành động</option>
                        <option value="CREATE">Tạo mới</option>
                        <option value="UPDATE">Cập nhật</option>
                        <option value="DELETE">Xóa</option>
                        <option value="LOGIN">Đăng nhập</option>
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredLogs}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy hoạt động nào"
            />
        </div>
    )
}
