"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    Package,
    Plus,
    Search,
    Edit,
    Trash2,
    RefreshCw,
    Download,
    Copy,
} from "lucide-react"
import { ProductForm } from "@/components/forms/ProductForm"
import { BulkProductForm } from "@/components/forms/BulkProductForm"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [productsRes, categoriesRes] = await Promise.all([
                apiClient.get("/products?limit=1000"),
                apiClient.get("/categories"),
            ])

            setProducts(productsRes.data.products || [])
            setCategories(categoriesRes.data || [])
            setSelectedIds([]) // Reset selection on refresh
        } catch (error: any) {
            console.error("Error fetching data:", error)
            showToast(
                error.response?.data?.error || "Lỗi khi tải dữ liệu",
                "error"
            )
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setSelectedProduct(null)
        setIsModalOpen(true)
    }

    const handleAddMultiple = () => {
        setSelectedProduct(null) // Ensure no single product is selected (implies create mode for bulk)
        setIsBulkModalOpen(true)
    }

    const handleEdit = (product: any) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    const handleBulkEdit = () => {
        if (selectedIds.length === 0) return
        // Pass selected products to bulk form for editing
        setIsBulkModalOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return

        try {
            await apiClient.delete(`/products/${deleteConfirm.id}`)
            showToast("Xóa sản phẩm thành công", "success")
            fetchData()
            setDeleteConfirm(null)
        } catch (error: any) {
            showToast(
                error.response?.data?.error || "Lỗi khi xóa sản phẩm",
                "error"
            )
        }
    }

    const handleBulkDelete = async () => {
        try {
            // Loop delete for now
            await Promise.all(
                selectedIds.map((id) => apiClient.delete(`/products/${id}`))
            )
            showToast(`Đã xóa ${selectedIds.length} sản phẩm`, "success")
            fetchData()
            setBulkDeleteConfirm(false)
            setSelectedIds([])
        } catch (error: any) {
            showToast("Lỗi khi xóa nhiều sản phẩm", "error")
        }
    }

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("asc")
        }
    }

    // Filter and sort products
    const filteredProducts = products
        .filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.code.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = !categoryFilter || p.categoryId === categoryFilter
            return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]

            if (sortBy === "Category") {
                aVal = a.Category?.name || ""
                bVal = b.Category?.name || ""
            }

            if (typeof aVal === "string") {
                return sortOrder === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal)
            }

            return sortOrder === "asc" ? aVal - bVal : bVal - aVal
        })

    const columns: Column<any>[] = [
        {
            header: "Tên sản phẩm",
            accessorKey: "name",
            sortable: true,
            cell: (product) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium line-clamp-1">{product.name}</div>
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
            header: "Danh mục",
            accessorKey: "Category",
            sortable: true,
            cell: (product) => (
                <Badge variant="secondary" className="font-medium">
                    {product.Category?.name || "Chưa phân loại"}
                </Badge>
            ),
        },
        {
            header: "Giá bán",
            accessorKey: "price",
            sortable: true,
            className: "text-right",
            cell: (product) => (
                <span className="font-medium">
                    {product.priceMin && product.priceMax ? (
                        <span>
                            {product.priceMin.toLocaleString()} -{" "}
                            {product.priceMax.toLocaleString()}
                        </span>
                    ) : (
                        <span>{(product.price || 0).toLocaleString()}</span>
                    )}
                </span>
            ),
        },
        {
            header: "Đơn vị",
            accessorKey: "unit",
            className: "text-center",
        },
        {
            header: "SL HĐ",
            accessorKey: "invoiceQuantity",
            className: "text-center",
            cell: (product) => product.invoiceQuantity || 0,
        },
        {
            header: "VAT",
            accessorKey: "vat",
            className: "text-center",
            cell: (product) => `${product.vat || 0}%`,
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (product) => (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(product)
                        }}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(product)
                        }}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
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
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{products.length}</span>{" "}
                        sản phẩm
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleAddMultiple}
                        className="bg-green-600 text-white hover:bg-green-700 border-transparent hover:text-white"
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        Thêm nhiều
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            {/* Filters and Actions */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                            {selectedIds.length > 0 ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleBulkEdit}
                                        className="flex-1 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Sửa ({selectedIds.length})
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setBulkDeleteConfirm(true)}
                                        className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Xóa ({selectedIds.length})
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={fetchData}
                                        className="flex-1"
                                        title="Làm mới"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        title="Xuất Excel"
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <DataTable
                data={filteredProducts}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                selectedIds={selectedIds}
                onSelectAll={(checked) => {
                    if (checked) {
                        setSelectedIds(filteredProducts.map((p) => p.id))
                    } else {
                        setSelectedIds([])
                    }
                }}
                onSelectOne={(id) => {
                    if (selectedIds.includes(id)) {
                        setSelectedIds(selectedIds.filter((i) => i !== id))
                    } else {
                        setSelectedIds([...selectedIds, id])
                    }
                }}
                sortColumn={sortBy}
                sortDirection={sortOrder}
                onSort={handleSort as (column: keyof any | string) => void}
                emptyMessage={
                    searchTerm || categoryFilter
                        ? "Không tìm thấy sản phẩm phù hợp"
                        : "Chưa có sản phẩm nào"
                }
            />

            {/* Modals */}
            <ProductForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedProduct(null)
                }}
                product={selectedProduct}
                categories={categories}
                products={products}
                onSuccess={fetchData}
            />

            <BulkProductForm
                isOpen={isBulkModalOpen}
                onClose={() => {
                    setIsBulkModalOpen(false)
                    // If we were editing, clear selection after close? Maybe not.
                }}
                categories={categories}
                initialData={
                    selectedProduct
                        ? []
                        : selectedIds.length > 0
                            ? products.filter((p) => selectedIds.includes(p.id))
                            : []
                }
                onSuccess={() => {
                    fetchData()
                    setSelectedIds([]) // Clear selection after success
                }}
            />

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa sản phẩm "${deleteConfirm?.name}"?`}
                variant="danger"
            />

            <ConfirmModal
                isOpen={bulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Xác nhận xóa nhiều"
                message={`Bạn có chắc muốn xóa ${selectedIds.length} sản phẩm đã chọn?`}
                variant="danger"
            />
        </div>
    )
}
