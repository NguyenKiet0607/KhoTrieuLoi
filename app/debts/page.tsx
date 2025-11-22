'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DebtForm } from '@/components/forms/DebtForm';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

export default function DebtsPage() {
    const [debts, setDebts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<any>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            const response = await fetch('/api/debts', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setDebts(data.debts || []);
        } catch (error) {
            showToast('Lỗi khi tải công nợ', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa công nợ này?')) return;

        try {
            await apiClient.delete(`/debts?id=${id}`);
            showToast('Xóa công nợ thành công', 'success');
            fetchDebts();
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi xóa', 'error');
        }
    };

    const totalRemaining = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Công nợ ({debts.length})</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Tổng còn lại: <span className="font-bold text-red-600">{totalRemaining.toLocaleString()} đ</span>
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedDebt(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Thêm công nợ
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Công ty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã thu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Còn lại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn thanh toán</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {debts.map((debt) => (
                            <tr key={debt.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{debt.companyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{debt.totalAmount.toLocaleString()} đ</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{debt.collectedAmount.toLocaleString()} đ</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{debt.remainingAmount.toLocaleString()} đ</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(debt.paymentDate).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => { setSelectedDebt(debt); setIsModalOpen(true); }}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(debt.id)}
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

            <DebtForm
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedDebt(null); }}
                debt={selectedDebt}
                onSuccess={fetchDebts}
            />
        </div>
    );
}
