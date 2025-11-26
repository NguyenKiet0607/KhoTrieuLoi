"use client"

import React, { useEffect, useState } from "react"
import {
    Plus,
    Eye,
    Trash2,
    Search,
    Filter,
    RefreshCw,
    Download,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { DataTable, Column } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import CreateOrderModal from "@/components/orders/CreateOrderModal"
import OrderDetailModal from "@/components/orders/OrderDetailModal"
import apiClient from "@/lib/api"
import Link from "next/link"
import { showToast } from "@/components/ui/Toast"

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Nháp",
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đã gửi hàng",
    DELIVERED: "Đã giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    DRAFT: "secondary",
    PENDING: "warning",
    CONFIRMED: "info",
    PROCESSING: "info",
    SHIPPED: "default", // Changed from primary to default
    DELIVERED: "success",
    COMPLETED: "success",
    CANCELLED: "destructive",
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    // New state for detail modal
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/orders")
            setOrders(response.data.orders || [])
        } catch (error: any) {
            console.error("Error fetching orders:", error)
            showToast("Lỗi khi tải danh sách đơn hàng", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return

        try {
            await apiClient.delete(`/orders/${deleteConfirm}`)
            showToast("Xóa đơn hàng thành công", "success")
            fetchOrders()
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Error deleting order:", error)
            showToast("Lỗi khi xóa đơn hàng", "error")
        }
    }

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = !statusFilter || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const columns: Column<any>[] = [
        {
            header: "Mã Đơn",
            accessorKey: "code",
            sortable: true,
            cell: (order) => <span className="font-medium">{order.code}</span>,
        },
        {
            header: "Khách Hàng",
            accessorKey: "customer",
            sortable: true,
            cell: (order) => (
                <div>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                </div>
            ),
        },
        {
            header: "Ngày Tạo",
            accessorKey: "createdAt",
            sortable: true,
            cell: (order) => (
                <span className="text-muted-foreground">
                    {new Date(order.createdAt || order.date).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            header: "Tổng Tiền",
            accessorKey: "totalAmount",
            sortable: true,
            className: "text-right",
            cell: (order) => (
                <span className="font-bold">
                    {order.totalAmount?.toLocaleString("vi-VN")} đ
                </span>
            ),
        },
        {
            header: "Trạng Thái",
            accessorKey: "status",
            className: "text-center",
            cell: (order) => (
                <Badge variant={STATUS_VARIANTS[order.status] || "secondary"}>
                    {STATUS_LABELS[order.status] || order.status}
                </Badge>
            ),
        },
        {
            header: "Thao Tác",
            className: "text-right",
            cell: (order) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                            setSelectedOrderId(order.id)
                            setShowDetailModal(true)
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(order.id)
                        }}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Đơn Hàng</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý tất cả đơn hàng bán hàng
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Đơn Hàng
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo mã, khách hàng, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
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
                        <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" onClick={fetchOrders} title="Làm mới">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" title="Xuất Excel">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <DataTable
                data={filteredOrders}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage={
                    searchTerm || statusFilter
                        ? "Không tìm thấy đơn hàng phù hợp"
                        : "Chưa có đơn hàng nào"
                }
                onRowClick={(order) => {
                    setSelectedOrderId(order.id)
                    setShowDetailModal(true)
                }}
            />

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false)
                    fetchOrders()
                }}
            />

            {/* Order Detail Modal */}
            <OrderDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                orderId={selectedOrderId}
                onDeleteSuccess={() => {
                    fetchOrders()
                    setShowDetailModal(false)
                }}
            />

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
                variant="danger"
            />
        </div>
    )
}
