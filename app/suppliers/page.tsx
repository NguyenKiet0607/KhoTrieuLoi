"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    Building2,
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Edit,
    Trash2,
    Eye,
    Star,
    RefreshCw,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            setLoading(true)
            // Mock data - in real app replace with API call
            // const response = await apiClient.get('/suppliers');
            // setSuppliers(response.data || []);
            setSuppliers([
                {
                    id: "1",
                    name: "Công ty Xi măng Hoàng Thạch",
                    code: "SUP-001",
                    email: "contact@hoangthach.vn",
                    phone: "0123456789",
                    address: "123 Đường ABC, TP.HCM",
                    contactPerson: "Nguyễn Văn A",
                    taxCode: "0123456789",
                    rating: 5,
                    totalPurchases: 50,
                    totalValue: 500000000,
                    products: 15,
                },
                {
                    id: "2",
                    name: "Công ty Gạch Đồng Tâm",
                    code: "SUP-002",
                    email: "sales@dongtam.vn",
                    phone: "0987654321",
                    address: "456 Đường XYZ, Hà Nội",
                    contactPerson: "Trần Thị B",
                    taxCode: "0987654321",
                    rating: 4,
                    totalPurchases: 30,
                    totalValue: 300000000,
                    products: 8,
                },
            ])
        } catch (error: any) {
            console.error("Error fetching suppliers:", error)
            showToast("Lỗi khi tải nhà cung cấp", "error")
        } finally {
            setLoading(false)
        }
    }

    const filteredSuppliers = suppliers.filter(
        (supplier) =>
            supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const columns: Column<any>[] = [
        {
            header: "Nhà cung cấp",
            accessorKey: "name",
            sortable: true,
            cell: (supplier) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-xs text-muted-foreground">{supplier.code}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Liên hệ",
            accessorKey: "email",
            cell: (supplier) => (
                <div className="space-y-1 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="line-clamp-1">{supplier.email}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Phone className="w-3 h-3 mr-1" />
                        <span>{supplier.phone}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Đánh giá",
            accessorKey: "rating",
            sortable: true,
            cell: (supplier) => (
                <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{supplier.rating}/5</span>
                </div>
            ),
        },
        {
            header: "Thống kê",
            cell: (supplier) => (
                <div className="text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Đơn hàng:</span>
                        <span className="font-medium">{supplier.totalPurchases}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Tổng trị giá:</span>
                        <span className="font-medium text-blue-600">
                            {(supplier.totalValue / 1000000).toFixed(0)}M
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (supplier) => (
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
                        Quản lý nhà cung cấp
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{suppliers.length}</span>{" "}
                        nhà cung cấp
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchSuppliers}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm nhà cung cấp
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm nhà cung cấp..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <DataTable
                data={filteredSuppliers}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy nhà cung cấp nào"
            />
        </div>
    )
}
