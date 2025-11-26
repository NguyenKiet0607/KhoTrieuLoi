"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    PackagePlus,
    Plus,
    Search,
    Download,
    Eye,
    RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { createRoot } from "react-dom/client"
import { StockReceiptTemplate } from "@/components/templates/StockReceiptTemplate"

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

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        fetchReceipts()
    }, [])

    const fetchReceipts = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/receipts")
            setReceipts(response.data.receipts || [])
        } catch (error: any) {
            console.error("Error fetching receipts:", error)
            showToast("Lỗi khi tải phiếu nhập", "error")
        } finally {
            setLoading(false)
        }
    }

    const handlePrintReceipt = (receipt: any) => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) {
            showToast("Vui lòng cho phép mở cửa sổ bật lên để in phiếu", "error")
            return
        }

        const container = printWindow.document.createElement("div")
        printWindow.document.body.appendChild(container)

        const items =
            receipt.StockReceiptItem?.map((item: any) => ({
                name: item.StockItem?.Product?.name || "Sản phẩm",
                unit: item.StockItem?.Product?.unit || "Cái",
                quantity: item.quantity,
                price: item.price,
            })) || []

        const root = createRoot(container)
        root.render(
            <StockReceiptTemplate
                receiptNo={receipt.code}
                date={new Date(receipt.date)}
                supplierName={receipt.supplier}
                notes={receipt.description}
                items={items}
                totalAmount={receipt.totalAmount}
            />
        )

        const style = printWindow.document.createElement("style")
        style.textContent = `
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
            body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact; }
            @media print {
                @page { size: A4 portrait; margin: 0; }
                body { padding: 0; }
            }
        `
        printWindow.document.head.appendChild(style)

        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 1000)
    }

    const filteredReceipts = receipts.filter((receipt) => {
        const matchesSearch =
            receipt.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = !statusFilter || receipt.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const columns: Column<any>[] = [
        {
            header: "Mã phiếu",
            accessorKey: "code",
            sortable: true,
            cell: (receipt) => (
                <div className="flex items-center font-medium">
                    <PackagePlus className="w-4 h-4 text-green-600 mr-2" />
                    {receipt.code}
                </div>
            ),
        },
        {
            header: "Ngày nhập",
            accessorKey: "date",
            sortable: true,
            cell: (receipt) => (
                <span className="text-muted-foreground">
                    {new Date(receipt.date).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            header: "Nhà cung cấp",
            accessorKey: "supplier",
            sortable: true,
            cell: (receipt) => (
                <div className="line-clamp-1">{receipt.supplier}</div>
            ),
        },
        {
            header: "Tổng tiền",
            accessorKey: "totalAmount",
            sortable: true,
            className: "text-right",
            cell: (receipt) => (
                <span className="font-bold">
                    {receipt.totalAmount?.toLocaleString()} đ
                </span>
            ),
        },
        {
            header: "Trạng thái",
            accessorKey: "status",
            className: "text-center",
            cell: (receipt) => (
                <Badge variant={STATUS_VARIANTS[receipt.status] || "secondary"}>
                    {STATUS_LABELS[receipt.status] || receipt.status}
                </Badge>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (receipt) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrintReceipt(receipt)}
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="In phiếu"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                    {/* Assuming there is a details page, though not explicitly linked in original code except via 'Eye' button logic which was just a button */}
                    {/* The original code had a button with Eye icon but no onClick handler or Link. I'll assume there might be a details page or it's TODO. */}
                    {/* Wait, the original code had <button className="text-blue-600..." title="Xem"><Eye ... /></button> but no action. */}
                    {/* I'll add a placeholder or link if I find a route. For now, I'll keep the button. */}
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Phiếu nhập kho</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{receipts.length}</span>{" "}
                        phiếu
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchReceipts}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Link href="/receipts/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo phiếu nhập
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã phiếu hoặc nhà cung cấp..."
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

            {/* Receipts Table */}
            <DataTable
                data={filteredReceipts}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy phiếu nhập nào"
            />
        </div>
    )
}
