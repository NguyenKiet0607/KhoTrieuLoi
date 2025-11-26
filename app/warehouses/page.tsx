"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import {
    Warehouse as WarehouseIcon,
    Plus,
    Edit,
    Trash2,
    Package,
    MapPin,
    Phone,
    Mail,
    TrendingUp,
    BarChart3,
    RefreshCw,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        description: "",
        phone: "",
        email: "",
        capacity: "",
    })

    useEffect(() => {
        fetchWarehouses()
    }, [])

    const fetchWarehouses = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/warehouses")
            setWarehouses(response.data || [])
        } catch (error: any) {
            console.error("Error fetching warehouses:", error)
            showToast(error.response?.data?.error || "Lỗi khi tải kho", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setSelectedWarehouse(null)
        setFormData({
            name: "",
            address: "",
            description: "",
            phone: "",
            email: "",
            capacity: "",
        })
        setIsModalOpen(true)
    }

    const handleEdit = (warehouse: any) => {
        setSelectedWarehouse(warehouse)
        setFormData({
            name: warehouse.name,
            address: warehouse.address || "",
            description: warehouse.description || "",
            phone: warehouse.phone || "",
            email: warehouse.email || "",
            capacity: warehouse.capacity || "",
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            showToast("Vui lòng nhập tên kho", "error")
            return
        }

        try {
            const payload = {
                ...formData,
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
            }

            if (selectedWarehouse) {
                await apiClient.put(`/warehouses/${selectedWarehouse.id}`, payload)
                showToast("Cập nhật kho thành công", "success")
            } else {
                await apiClient.post("/warehouses", payload)
                showToast("Thêm kho thành công", "success")
            }
            setIsModalOpen(false)
            fetchWarehouses()
        } catch (error: any) {
            showToast(error.response?.data?.error || "Lỗi khi lưu kho", "error")
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return

        try {
            await apiClient.delete(`/warehouses/${deleteConfirm.id}`)
            showToast("Xóa kho thành công", "success")
            fetchWarehouses()
            setDeleteConfirm(null)
        } catch (error: any) {
            showToast(error.response?.data?.error || "Lỗi khi xóa kho", "error")
        }
    }

    const columns: Column<any>[] = [
        {
            header: "Tên kho",
            accessorKey: "name",
            sortable: true,
            cell: (warehouse) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <WarehouseIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-medium">{warehouse.name}</div>
                        {warehouse.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                                {warehouse.description}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: "Địa chỉ / Liên hệ",
            accessorKey: "address",
            cell: (warehouse) => (
                <div className="space-y-1 text-sm">
                    {warehouse.address && (
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="line-clamp-1">{warehouse.address}</span>
                        </div>
                    )}
                    {warehouse.phone && (
                        <div className="flex items-center text-muted-foreground">
                            <Phone className="w-3 h-3 mr-1" />
                            <span>{warehouse.phone}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: "Công suất",
            accessorKey: "capacity",
            cell: (warehouse) => {
                const stockCount = warehouse._count?.StockItem || 0
                const utilization = warehouse.capacity
                    ? Math.min((stockCount / warehouse.capacity) * 100, 100)
                    : 0

                return (
                    <div className="w-full max-w-[140px]">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                                {stockCount} / {warehouse.capacity || "∞"}
                            </span>
                            <span className="font-medium">{utilization.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${utilization > 90
                                        ? "bg-red-500"
                                        : utilization > 70
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                style={{ width: `${utilization}%` }}
                            />
                        </div>
                    </div>
                )
            },
        },
        {
            header: "Thống kê",
            cell: (warehouse) => (
                <div className="flex space-x-4">
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Sản phẩm</div>
                        <div className="font-bold text-blue-600">
                            {warehouse._count?.StockItem || 0}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Đơn hàng</div>
                        <div className="font-bold text-green-600">
                            {warehouse._count?.Order || 0}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (warehouse) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(warehouse)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(warehouse)}
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý kho hàng</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{warehouses.length}</span>{" "}
                        kho
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchWarehouses}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm kho
                    </Button>
                </div>
            </div>

            {/* Warehouses Table */}
            <DataTable
                data={warehouses}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Chưa có kho hàng nào"
            />

            {/* Warehouse Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {selectedWarehouse ? "Sửa kho" : "Thêm kho mới"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Tên kho <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Nhập tên kho"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Địa chỉ
                                    </label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                        placeholder="Nhập địa chỉ kho"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Số điện thoại
                                    </label>
                                    <Input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder="Nhập email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Công suất (số lượng sản phẩm)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) =>
                                            setFormData({ ...formData, capacity: e.target.value })
                                        }
                                        placeholder="Nhập công suất"
                                        min="0"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Nhập mô tả (tùy chọn)"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit">
                                    {selectedWarehouse ? "Cập nhật" : "Thêm mới"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa kho "${deleteConfirm?.name}"? Tất cả dữ liệu tồn kho và đơn hàng liên quan sẽ bị ảnh hưởng.`}
                variant="danger"
            />
        </div>
    )
}
