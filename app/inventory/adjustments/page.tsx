"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    Search,
    Package,
    Save,
    Warehouse,
    FileText,
    RefreshCw,
    Edit,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"

export default function StockAdjustmentsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [warehouses, setWarehouses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form state
    const [editInvoiceQty, setEditInvoiceQty] = useState<number>(0)
    const [editStock, setEditStock] = useState<{ [key: string]: number }>({})

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [productsRes, warehousesRes] = await Promise.all([
                apiClient.get("/inventory/stock-overview"),
                apiClient.get("/warehouses"),
            ])

            // Ensure products is an array
            const productsData = Array.isArray(productsRes.data)
                ? productsRes.data
                : []
            setProducts(productsData)
            setWarehouses(warehousesRes.data || [])
        } catch (error: any) {
            console.error("Error fetching data:", error)
            showToast("Lỗi khi tải dữ liệu", "error")
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const handleProductClick = (product: any) => {
        if (!product) return
        setSelectedProduct(product)
        setEditInvoiceQty(product.invoiceQuantity || 0)

        // Initialize stock edits with current values
        const stockMap: { [key: string]: number } = {}
        warehouses.forEach((wh) => {
            const existingStock = product.warehouses?.find(
                (w: any) => w.warehouseId === wh.id
            )
            stockMap[wh.id] = existingStock ? existingStock.quantity : 0
        })
        setEditStock(stockMap)

        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!selectedProduct) return

        try {
            const warehouseAdjustments = Object.entries(editStock).map(
                ([warehouseId, quantity]) => ({
                    warehouseId,
                    quantity,
                })
            )

            await apiClient.post("/inventory/adjust", {
                productId: selectedProduct.productId,
                invoiceQuantity: editInvoiceQty,
                warehouseAdjustments,
            })

            showToast("Cập nhật thành công", "success")
            setIsModalOpen(false)
            fetchData() // Refresh data
        } catch (error) {
            console.error("Error saving adjustment:", error)
            showToast("Lỗi khi lưu thay đổi", "error")
        }
    }

    const filteredProducts = products.filter((p) => {
        if (!p) return false
        const name = p.productName || ""
        const code = p.productCode || ""
        const search = searchTerm.toLowerCase()
        return (
            name.toLowerCase().includes(search) || code.toLowerCase().includes(search)
        )
    })

    const columns: Column<any>[] = [
        {
            header: "Sản phẩm",
            accessorKey: "productName",
            sortable: true,
            cell: (product) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                        <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1">
                            {product.productName}
                        </div>
                        {(product.description || product.supplier) && (
                            <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                                {product.description && (
                                    <p className="line-clamp-1">GC: {product.description}</p>
                                )}
                                {product.supplier && (
                                    <p className="line-clamp-1">NSX: {product.supplier}</p>
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
            className: "text-center w-20",
            cell: (product) => (
                <span className="text-muted-foreground">{product.unit}</span>
            ),
        },
        {
            header: "Tổng tồn",
            accessorKey: "totalStock",
            sortable: true,
            className: "text-center w-24",
            cell: (product) => (
                <Badge variant="success">{product.totalStock}</Badge>
            ),
        },
        {
            header: "SL HĐ",
            accessorKey: "invoiceQuantity",
            sortable: true,
            className: "text-center w-24",
            cell: (product) => (
                <Badge variant="secondary">{product.invoiceQuantity || 0}</Badge>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right w-24",
            cell: (product) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleProductClick(product)
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    <Edit className="w-4 h-4 mr-1" />
                    Điều chỉnh
                </Button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Điều chỉnh tồn kho
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý số lượng tồn kho thực tế và số lượng trên hoá đơn
                    </p>
                </div>
                <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <DataTable
                data={filteredProducts}
                columns={columns}
                keyExtractor={(item) => item.productId}
                isLoading={loading}
                onRowClick={handleProductClick}
                emptyMessage="Không tìm thấy sản phẩm nào"
            />

            {/* Adjustment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Điều chỉnh tồn kho"
                size="lg"
            >
                {selectedProduct && (
                    <div className="space-y-6">
                        <div className="text-sm text-muted-foreground">
                            Sản phẩm: <span className="font-medium text-foreground">{selectedProduct.productName}</span> ({selectedProduct.unit})
                        </div>

                        {/* Invoice Quantity Section */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div className="flex items-center mb-3">
                                <FileText className="w-5 h-5 text-purple-600 mr-2" />
                                <h3 className="font-semibold text-purple-900">
                                    Số lượng trên hoá đơn
                                </h3>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Input
                                    type="number"
                                    value={editInvoiceQty}
                                    onChange={(e) => setEditInvoiceQty(Number(e.target.value))}
                                    className="bg-white"
                                />
                                <span className="text-muted-foreground">
                                    {selectedProduct.unit}
                                </span>
                            </div>
                        </div>

                        {/* Warehouse Stock Section */}
                        <div>
                            <div className="flex items-center mb-4">
                                <Warehouse className="w-5 h-5 text-blue-600 mr-2" />
                                <h3 className="font-semibold text-foreground">
                                    Tồn kho thực tế tại các kho
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {warehouses.map((wh) => (
                                    <div
                                        key={wh.id}
                                        className="flex items-center justify-between bg-muted/50 p-3 rounded-lg"
                                    >
                                        <span className="font-medium">{wh.name}</span>
                                        <div className="flex items-center space-x-3">
                                            <Input
                                                type="number"
                                                value={editStock[wh.id] || 0}
                                                onChange={(e) =>
                                                    setEditStock({
                                                        ...editStock,
                                                        [wh.id]: Number(e.target.value),
                                                    })
                                                }
                                                className="w-32 text-right bg-white"
                                            />
                                            <span className="text-muted-foreground w-10">
                                                {selectedProduct.unit}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
