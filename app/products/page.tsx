'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ProductForm } from '@/components/forms/ProductForm';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuthStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                apiClient.get('/products?limit=1000'), // Get all products
                apiClient.get('/categories'),
            ]);

            setProducts(productsRes.data.products || []);
            setCategories(categoriesRes.data || []);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            showToast(error.response?.data?.error || 'Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await apiClient.delete(`/products/${deleteConfirm.id}`);
            showToast('Xóa sản phẩm thành công', 'success');
            fetchData();
            setDeleteConfirm(null);
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi xóa sản phẩm', 'error');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-6">Đang tải...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Sản phẩm ({products.length})</h1>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn vị</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.Category?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {product.priceMin && product.priceMax ? (
                                            <span>{product.priceMin.toLocaleString()} - {product.priceMax.toLocaleString()} đ</span>
                                        ) : (
                                            <span>{(product.price || 0).toLocaleString()} đ</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(product)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ProductForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
                categories={categories}
                products={products}
                onSuccess={fetchData}
            />

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa sản phẩm "${deleteConfirm?.name}"?`}
            />
        </div>
    );
}
