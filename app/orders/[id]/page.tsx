"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, Edit, Trash2 } from "lucide-react"
import apiClient from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
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
    SHIPPED: "default",
    DELIVERED: "success",
    COMPLETED: "success",
    CANCELLED: "destructive",
}

export default function OrderDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    useEffect(() => {
        if (id) {
            fetchOrderDetails()
        }
    }, [id])

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get(`/orders/${id}`)
            setOrder(response.data)
        } catch (error: any) {
            console.error("Error fetching order details:", error)
            showToast("Lỗi khi tải thông tin đơn hàng", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await apiClient.delete(`/orders/${id}`)
            showToast("Xóa đơn hàng thành công", "success")
            router.push("/orders")
        } catch (error) {
            console.error("Error deleting order:", error)
            showToast("Lỗi khi xóa đơn hàng", "error")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
                <Button variant="outline" onClick={() => router.push("/orders")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/orders")}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            Đơn hàng #{order.code}
                            <Badge variant={STATUS_VARIANTS[order.status] || "secondary"}>
                                {STATUS_LABELS[order.status] || order.status}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Ngày tạo: {new Date(order.createdAt || order.date).toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Printer className="w-4 h-4 mr-2" />
                        In đơn hàng
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteConfirm(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Thông tin khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Khách hàng</p>
                                <p className="font-medium">{order.customer}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                                <p>{order.phone}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
                                <p>{order.address}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Kho xuất hàng</p>
                            <p className="font-medium">{order.warehouse?.name || "---"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Người tạo</p>
                            <p>{order.creator?.fullName || order.creator?.username || "---"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Ghi chú</p>
                            <p className="text-sm italic">{order.note || "Không có ghi chú"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3 text-center">ĐVT</th>
                                    <th className="px-4 py-3 text-right">Số lượng</th>
                                    <th className="px-4 py-3 text-right">Đơn giá</th>
                                    <th className="px-4 py-3 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {order.items?.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{item.productName}</div>
                                            {item.productCode && (
                                                <div className="text-xs text-muted-foreground">{item.productCode}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.unit}</td>
                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">
                                            {item.price?.toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {(item.quantity * item.price).toLocaleString("vi-VN")} đ
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/50 font-medium">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right">Tổng cộng</td>
                                    <td className="px-4 py-3 text-right font-bold text-lg text-primary">
                                        {order.totalAmount?.toLocaleString("vi-VN")} đ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ConfirmModal
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
                variant="danger"
            />
        </div>
    )
}
