"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import {
    FolderTree,
    Plus,
    Edit,
    Trash2,
    Package,
    Search,
    RefreshCw,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/categories")
            setCategories(response.data || [])
        } catch (error: any) {
            console.error("Error fetching categories:", error)
            showToast(error.response?.data?.error || "Lỗi khi tải danh mục", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setSelectedCategory(null)
        setFormData({ name: "", description: "" })
        setIsModalOpen(true)
    }

    const handleEdit = (category: any) => {
        setSelectedCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            showToast("Vui lòng nhập tên danh mục", "error")
            return
        }

        try {
            if (selectedCategory) {
                await apiClient.put(`/categories/${selectedCategory.id}`, formData)
                showToast("Cập nhật danh mục thành công", "success")
            } else {
                await apiClient.post("/categories", formData)
                showToast("Thêm danh mục thành công", "success")
            }
            setIsModalOpen(false)
            fetchCategories()
        } catch (error: any) {
            showToast(error.response?.data?.error || "Lỗi khi lưu danh mục", "error")
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return

        try {
            await apiClient.delete(`/categories/${deleteConfirm.id}`)
            showToast("Xóa danh mục thành công", "success")
            fetchCategories()
            setDeleteConfirm(null)
        } catch (error: any) {
            showToast(error.response?.data?.error || "Lỗi khi xóa danh mục", "error")
        }
    }

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const columns: Column<any>[] = [
        {
            header: "Tên danh mục",
            accessorKey: "name",
            sortable: true,
            cell: (category) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <FolderTree className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                                {category.description}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: "Sản phẩm",
            accessorKey: "_count.Product",
            sortable: true,
            cell: (category) => (
                <Badge variant="secondary" className="gap-1">
                    <Package className="w-3 h-3" />
                    {category._count?.Product || 0} sản phẩm
                </Badge>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (category) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(category)}
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
                    <h1 className="text-3xl font-bold tracking-tight">Danh mục sản phẩm</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{categories.length}</span>{" "}
                        danh mục
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchCategories}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm danh mục
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <DataTable
                data={filteredCategories}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Chưa có danh mục nào"
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-background rounded-lg shadow-xl max-w-md w-full border">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {selectedCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Nhập tên danh mục"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit">
                                    {selectedCategory ? "Cập nhật" : "Thêm mới"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa danh mục "${deleteConfirm?.name}"? Tất cả sản phẩm trong danh mục này sẽ bị ảnh hưởng.`}
                variant="danger"
            />
        </div>
    )
}
