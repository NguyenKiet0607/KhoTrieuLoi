"use client"

import React, { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { DebtForm } from "@/components/forms/DebtForm"
import { showToast } from "@/components/ui/Toast"
import apiClient from "@/lib/api"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react"

export default function DebtsPage() {
    const [debts, setDebts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDebt, setSelectedDebt] = useState<any>(null)
    const { token } = useAuthStore()

    useEffect(() => {
        fetchDebts()
    }, [])

    const fetchDebts = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/debts", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await response.json()
            setDebts(data.debts || [])
        } catch (error) {
            showToast("Lỗi khi tải công nợ", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa công nợ này?")) return

        try {
            await apiClient.delete(`/debts?id=${id}`)
            showToast("Xóa công nợ thành công", "success")
            fetchDebts()
        } catch (error: any) {
            showToast(error.response?.data?.error || "Lỗi khi xóa", "error")
        }
    }

    const totalRemaining = debts.reduce(
        (sum, debt) => sum + debt.remainingAmount,
        0
    )

    const columns: Column<any>[] = [
        {
            header: "Công ty",
            accessorKey: "companyName",
            sortable: true,
            cell: (debt) => <div className="font-medium">{debt.companyName}</div>,
        },
        {
            header: "Tổng tiền",
            accessorKey: "totalAmount",
            sortable: true,
            cell: (debt) => <span>{debt.totalAmount.toLocaleString()} đ</span>,
        },
        {
            header: "Đã thu",
            accessorKey: "collectedAmount",
            sortable: true,
            cell: (debt) => (
                <span className="text-green-600">
                    {debt.collectedAmount.toLocaleString()} đ
                </span>
            ),
        },
        {
            header: "Còn lại",
            accessorKey: "remainingAmount",
            sortable: true,
            cell: (debt) => (
                <span className="font-bold text-red-600">
                    {debt.remainingAmount.toLocaleString()} đ
                </span>
            ),
        },
        {
            header: "Hạn thanh toán",
            accessorKey: "paymentDate",
            sortable: true,
            cell: (debt) => (
                <span>{new Date(debt.paymentDate).toLocaleDateString("vi-VN")}</span>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (debt) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSelectedDebt(debt)
                            setIsModalOpen(true)
                        }}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(debt.id)}
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
                    <h1 className="text-3xl font-bold tracking-tight">Công nợ</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng còn lại:{" "}
                        <span className="font-bold text-red-600">
                            {totalRemaining.toLocaleString()} đ
                        </span>
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchDebts}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedDebt(null)
                            setIsModalOpen(true)
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm công nợ
                    </Button>
                </div>
            </div>

            <DataTable
                data={debts}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Chưa có công nợ nào"
            />

            <DebtForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedDebt(null)
                }}
                debt={selectedDebt}
                onSuccess={fetchDebts}
            />
        </div>
    )
}
