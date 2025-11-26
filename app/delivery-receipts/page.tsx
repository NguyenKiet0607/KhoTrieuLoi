"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Eye, Trash2, Printer, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import apiClient from "@/lib/api"
import DeliveryReceiptTemplate from "@/components/templates/DeliveryReceiptTemplate"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"

export default function DeliveryReceiptsPage() {
    const router = useRouter()
    const [receipts, setReceipts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [companyConfig, setCompanyConfig] = useState<any>(null)

    useEffect(() => {
        fetchReceipts()
        fetchConfig()
    }, [])

    const fetchReceipts = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/delivery-receipts")
            setReceipts(response.data)
        } catch (error) {
            console.error("Error fetching receipts:", error)
            // alert('Lỗi khi tải danh sách biên bản');
        } finally {
            setLoading(false)
        }
    }

    const fetchConfig = async () => {
        try {
            const response = await apiClient.get("/storage-config")
            setCompanyConfig(response.data)
        } catch (error) {
            console.error("Error fetching config:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa biên bản này?")) return

        try {
            await apiClient.delete(`/delivery-receipts/${id}`)
            alert("Xóa biên bản thành công")
            fetchReceipts()
        } catch (error) {
            console.error("Error deleting receipt:", error)
            alert("Lỗi khi xóa biên bản")
        }
    }

    const handlePreview = (receipt: any) => {
        setSelectedReceipt(receipt)
        setShowPreview(true)
    }

    const handlePrint = () => {
        window.print()
    }

    const columns: Column<any>[] = [
        {
            header: "Mã Đơn Hàng",
            accessorKey: "Order.code",
            sortable: true,
            cell: (receipt) => (
                <div className="font-medium">{receipt.Order?.code}</div>
            ),
        },
        {
            header: "Khách Hàng",
            accessorKey: "Order.customer",
            sortable: true,
            cell: (receipt) => <div>{receipt.Order?.customer}</div>,
        },
        {
            header: "Ngày Giao",
            accessorKey: "deliveryDate",
            sortable: true,
            cell: (receipt) => (
                <div>{new Date(receipt.deliveryDate).toLocaleDateString("vi-VN")}</div>
            ),
        },
        {
            header: "Phương Thức",
            accessorKey: "deliveryMethod",
            sortable: true,
            cell: (receipt) => (
                <Badge
                    variant={receipt.deliveryMethod === "SELF" ? "success" : "info"}
                >
                    {receipt.deliveryMethod === "SELF" ? "Tự giao" : "Chành xe"}
                </Badge>
            ),
        },
        {
            header: "Thao Tác",
            className: "text-right",
            cell: (receipt) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(receipt)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(receipt.id)}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Biên Bản Giao Nhận
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý biên bản giao nhận hàng hóa
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchReceipts}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button onClick={() => router.push("/delivery-receipts/new")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo Biên Bản Mới
                    </Button>
                </div>
            </div>

            <DataTable
                data={receipts}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Chưa có biên bản nào"
            />

            {/* Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Biên Bản Giao Nhận Hàng Hóa"
                size="xl"
            >
                {selectedReceipt && (
                    <>
                        <div className="max-h-[70vh] overflow-auto">
                            <DeliveryReceiptTemplate
                                receipt={selectedReceipt}
                                companyConfig={companyConfig}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                Đóng
                            </Button>
                            <Button onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                In Biên Bản
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}
