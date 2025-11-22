'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { WarehouseForm } from '@/components/forms/WarehouseForm';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await fetch('/api/warehouses', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setWarehouses(data || []);
        } catch (error) {
            showToast('Lỗi khi tải kho', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa kho này?')) return;

        try {
            await apiClient.delete(`/warehouses?id=${id}`);
            showToast('Xóa kho thành công', 'success');
            fetchWarehouses();
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi xóa', 'error');
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý kho ({warehouses.length})</h1>
                <button
                    onClick={() => { setSelectedWarehouse(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Thêm kho
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên kho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số mặt hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {warehouses.map((warehouse) => (
                            <tr key={warehouse.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{warehouse.name}</td>
                                <td className="px-6 py-4 text-sm">{warehouse.address || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{warehouse.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{warehouse._count?.stockItems || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => { setSelectedWarehouse(warehouse); setIsModalOpen(true); }}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(warehouse.id)}
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

            <WarehouseForm
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedWarehouse(null); }}
                warehouse={selectedWarehouse}
                onSuccess={fetchWarehouses}
            />
        </div>
    );
}
