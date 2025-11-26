"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    FileText,
    Plus,
    Search,
    Truck,
    User,
    Eye,
    Download,
    Edit,
    Trash2,
    Calendar,
    CheckCircle,
    XCircle,
    RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    PENDING: "warning",
    COMPLETED: "success",
    CANCELLED: "destructive",
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
}

export default function HandoverRecordsPage() {
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        fetchRecords()
    }, [])

    const fetchRecords = async () => {
        try {
            setLoading(true)
            // Mock data - will be replaced with real API
            setRecords([
                {
                    id: "1",
                    code: "BBGN-001",
                    type: "VEHICLE",
                    date: new Date().toISOString(),
                    vehicleNumber: "29A-12345",
                    driver: "Nguyễn Văn A",
                    recipient: "",
                    items: 15,
                    status: "COMPLETED",
                    createdBy: "Admin",
                },
                {
                    id: "2",
                    code: "BBGN-002",
                    type: "RECIPIENT",
                    date: new Date().toISOString(),
                    vehicleNumber: "",
                    driver: "",
                    recipient: "Công ty ABC",
                    items: 8,
                    status: "PENDING",
                    createdBy: "Admin",
                },
            ])
        } catch (error: any) {
            console.error("Error fetching handover records:", error)
            showToast("Lỗi khi tải biên bản", "error")
        } finally {
            setLoading(false)
        }
    }

    const filteredRecords = records.filter((record) => {
        const matchesSearch =
            record.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.recipient?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = !typeFilter || record.type === typeFilter
        const matchesStatus = !statusFilter || record.status === statusFilter
        return matchesSearch && matchesType && matchesStatus
    })

    const columns: Column<any>[] = [
        {
            header: "Mã biên bản",
            accessorKey: "code",
            sortable: true,
            cell: (record) => (
                <div className="flex items-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium">{record.code}</span>
                </div>
            ),
        },
        {
            header: "Loại",
            accessorKey: "type",
            sortable: true,
            cell: (record) => (
                <div className="flex items-center">
                    {record.type === "VEHICLE" ? (
                        <>
                            <Truck className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-green-600 font-medium">Giao xe</span>
                        </>
                    ) : (
                        <>
                            <User className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-blue-600 font-medium">Giao người nhận</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            header: "Ngày giao",
            accessorKey: "date",
            sortable: true,
            cell: (record) => (
                <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(record.date).toLocaleDateString("vi-VN")}
                </div>
            ),
        },
        {
            header: "Thông tin",
            cell: (record) =>
                record.type === "VEHICLE" ? (
                    <div className="text-sm">
                        <div className="font-medium">Xe: {record.vehicleNumber}</div>
                        <div className="text-muted-foreground">Tài xế: {record.driver}</div>
                    </div>
                ) : (
                    <div className="text-sm font-medium">{record.recipient}</div>
                ),
        },
        {
            header: "Số mặt hàng",
            accessorKey: "items",
            sortable: true,
            cell: (record) => <span>{record.items} mặt hàng</span>,
        },
        {
            header: "Trạng thái",
            accessorKey: "status",
            sortable: true,
            cell: (record) => (
                <Badge variant={STATUS_VARIANTS[record.status] || "outline"}>
                    {STATUS_LABELS[record.status] || record.status}
                </Badge>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (record) => (
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
                    {record.status === "PENDING" && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                title="Sửa"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Hủy"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Biên bản giao nhận
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{records.length}</span>{" "}
                        biên bản
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchRecords}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Link href="/handover-records/new?type=vehicle">
                        <Button className="bg-green-600 hover:bg-green-700 mr-2">
                            <Truck className="w-4 h-4 mr-2" />
                            Giao xe
                        </Button>
                    </Link>
                    <Link href="/handover-records/new?type=recipient">
                        <Button>
                            <User className="w-4 h-4 mr-2" />
                            Giao người nhận
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã, xe, tài xế, người nhận..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="VEHICLE">Giao xe</option>
                        <option value="RECIPIENT">Giao người nhận</option>
                    </select>
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredRecords}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy biên bản nào"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Giao xe
                            </p>
                            <p className="text-2xl font-bold mt-2">
                                {records.filter((r) => r.type === "VEHICLE").length}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Truck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Giao người nhận
                            </p>
                            <p className="text-2xl font-bold mt-2">
                                {records.filter((r) => r.type === "RECIPIENT").length}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Chờ xác nhận
                            </p>
                            <p className="text-2xl font-bold mt-2">
                                {records.filter((r) => r.status === "PENDING").length}
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
