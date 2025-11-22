'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setCategories(data || []);
        } catch (error) {
            showToast('Lỗi khi tải danh mục', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

        try {
            await apiClient.delete(`/categories?id=${id}`);
            showToast('Xóa danh mục thành công', 'success');
            fetchCategories();
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi xóa', 'error');
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Danh mục sản phẩm ({categories.length})</h1>
                <button
                    onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Thêm danh mục
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{category.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{category.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{category._count?.Product || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => { setSelectedCategory(category); setIsModalOpen(true); }}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CategoryForm
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedCategory(null); }}
                category={selectedCategory}
                onSuccess={fetchCategories}
            />
        </div>
    );
}
