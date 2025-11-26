"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import {
    Package,
    Search,
    RefreshCw,
    Download,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Layers,
    Warehouse,
    ChevronDown,
    ChevronRight,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/Card"

export default function InventoryOverviewPage() {
    const [data, setData] = useState<any[]>([])
    const [warehouses, setWarehouses] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [stockRes, warehousesRes, categoriesRes] = await Promise.all([
                apiClient.get("/inventory/stock-overview"),
                apiClient.get("/warehouses"),
                apiClient.get("/categories"),
            ])

            setData(stockRes.data || [])
            setWarehouses(warehousesRes.data || [])
            setCategories(categoriesRes.data || [])
        } catch (error) {
            console.error("Error fetching inventory data:", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleRow = (productId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId)
        } else {
            newExpanded.add(productId)
        }
        setExpandedRows(newExpanded)
    }

    const getProcessedData = () => {
        let processed = [...data]

        // Apply filters
        return processed.filter((item) => {
            const matchesSearch = item.productName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            const matchesCategory =
                !categoryFilter || item.categoryName === categoryFilter
            const matchesStatus = !statusFilter || item.status === statusFilter

            return matchesSearch && matchesCategory && matchesStatus
        })
    }

    const processedData = getProcessedData()

    // Calculate quick stats
    const totalStock = data.reduce((sum, item) => sum + item.totalStock, 0)
    const totalValue = data.reduce(
        (sum, item) => sum + item.totalStock * (item.price || 0),
        0
    )
    const lowStockCount = data.filter(
        (item) => item.totalStock < 10 && item.totalStock > 0
    ).length
    const outOfStockCount = data.filter((item) => item.totalStock === 0).length

    const columns: Column<any>[] = [
        {
            header: "Sản phẩm",
            accessorKey: "productName",
            sortable: true,
            cell: (item) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium line-clamp-1">{item.productName}</div>
                        {(item.description || item.supplier) && (
                            <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                                {item.description && (
                                    <p className="line-clamp-1">GC: {item.description}</p>
                                )}
                                {item.supplier && (
                                    <p className="line-clamp-1">NSX: {item.supplier}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: "Đơn vị",
            accessorKey: "unit",
            className: "text-center w-24",
        },
        {
            header: "Tổng tồn",
            accessorKey: "totalStock",
            sortable: true,
            className: "text-center w-24",
            cell: (item) => (
                <Badge
                    variant={item.totalStock <= 10 ? "destructive" : "success"}
                    className="font-bold"
                >
                    {item.totalStock}
                </Badge>
            ),
        },
        {
            header: "SL HĐ",
            accessorKey: "invoiceQuantity",
            className: "text-center w-24",
            cell: (item) => (
                <Badge variant="secondary">{item.invoiceQuantity || 0}</Badge>
            ),
        },
        {
            header: "Giá vốn",
            accessorKey: "price",
            sortable: true,
            className: "text-right w-32",
            cell: (item) => (
                <span className="font-medium">
                    {(item.price || 0).toLocaleString()} đ
                </span>
            ),
        },
        {
            header: "Trạng thái",
            accessorKey: "status",
            className: "text-center w-32",
            cell: (item) => {
                if (item.status === "IN_STOCK") {
                    return (
                        <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" /> Còn hàng
                        </Badge>
                    )
                }
                if (item.status === "LOW_STOCK") {
                    return (
                        <Badge variant="warning">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Sắp hết
                        </Badge>
                    )
                }
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> Hết hàng
                    </Badge>
                )
            },
        },
        {
            header: "Chi tiết",
            className: "text-right w-20",
            cell: (item) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleRow(item.productId)
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    {expandedRows.has(item.productId) ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý tồn kho</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng quan tồn kho toàn hệ thống
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={fetchData}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Tổng tồn kho
                            </p>
                            <p className="text-2xl font-bold mt-2">
                                {totalStock.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Tổng giá trị
                            </p>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                {(totalValue / 1000000).toFixed(1)}M đ
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Layers className="w-6 h-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Sắp hết hàng
                            </p>
                            <p className="text-2xl font-bold text-yellow-600 mt-2">
                                {lowStockCount}
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Hết hàng
                            </p>
                            <p className="text-2xl font-bold text-red-600 mt-2">
                                {outOfStockCount}
                            </p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardContent className="p-0">
                    {/* Toolbar */}
                    <div className="p-4 border-b space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Advanced Filters */}
                            <div className="flex flex-wrap gap-4">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="IN_STOCK">Còn hàng</option>
                                    <option value="LOW_STOCK">Sắp hết hàng</option>
                                    <option value="OUT_OF_STOCK">Hết hàng</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="p-4">
                        <DataTable
                            data={processedData}
                            columns={columns}
                            keyExtractor={(item) => item.productId}
                            isLoading={loading}
                            expandedIds={Array.from(expandedRows)}
                            onRowClick={(item) => toggleRow(item.productId)}
                            renderSubComponent={(item) => (
                                <div className="ml-10">
                                    {item.warehouses && item.warehouses.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                            {item.warehouses.map((wh: any) => (
                                                <div
                                                    key={wh.warehouseId}
                                                    className="bg-background p-3 rounded-lg border flex justify-between items-center shadow-sm"
                                                >
                                                    <div className="flex items-center">
                                                        <Warehouse className="w-4 h-4 text-muted-foreground mr-2" />
                                                        <span className="text-sm font-medium">
                                                            {wh.warehouseName}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-primary">
                                                        {wh.quantity} {item.unit}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic py-2">
                                            Chưa có thông tin tồn kho chi tiết
                                        </div>
                                    )}
                                </div>
                            )}
                            emptyMessage={
                                searchTerm
                                    ? "Không tìm thấy dữ liệu phù hợp"
                                    : "Chưa có dữ liệu tồn kho"
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
