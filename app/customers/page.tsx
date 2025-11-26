"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    Users,
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/customers")
            setCustomers(response.data || [])
        } catch (error: any) {
            console.error("Error fetching customers:", error)
            showToast("Lỗi khi tải khách hàng", "error")
        } finally {
            setLoading(false)
        }
    }

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.includes(searchTerm)
    )

    const columns: Column<any>[] = [
        {
            header: "Khách hàng",
            accessorKey: "name",
            sortable: true,
            cell: (customer) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="font-medium">{customer.name}</div>
                </div>
            ),
        },
        {
            header: "Liên hệ",
            accessorKey: "email",
            cell: (customer) => (
                <div className="space-y-1 text-sm">
                    {customer.email && (
                        <div className="flex items-center text-muted-foreground">
                            <Mail className="w-3 h-3 mr-1" />
                            <span className="line-clamp-1">{customer.email}</span>
                        </div>
                    )}
                    {customer.phone && (
                        <div className="flex items-center text-muted-foreground">
                            <Phone className="w-3 h-3 mr-1" />
                            <span>{customer.phone}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: "Địa chỉ",
            accessorKey: "address",
            cell: (customer) =>
                customer.address ? (
                    <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{customer.address}</span>
                    </div>
                ) : null,
        },
        {
            header: "Thống kê",
            cell: (customer) => (
                <div className="text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Đơn hàng:</span>
                        <span className="font-medium">{customer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Tổng chi:</span>
                        <span className="font-medium text-green-600">
                            {(customer.totalSpent / 1000000).toFixed(1)}M
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (customer) => (
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
                        title="Sửa"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Xóa"
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
                        Quản lý khách hàng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{customers.length}</span>{" "}
                        khách hàng
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchCustomers}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm khách hàng
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <DataTable
                data={filteredCustomers}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy khách hàng nào"
            />
        </div>
    )
}
