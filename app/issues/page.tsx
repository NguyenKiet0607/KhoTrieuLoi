'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { IssueForm } from '@/components/forms/IssueForm';
import { showToast } from '@/components/ui/Toast';
import { generateIssuePDF } from '@/lib/pdfGenerator';
import apiClient from '@/lib/api';

export default function IssuePage() {
    const [issues, setIssues] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<any>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [issuesRes, productsRes, warehousesRes] = await Promise.all([
                fetch('/api/issues', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/warehouses', { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            const issuesData = await issuesRes.json();
            const productsData = await productsRes.json();
            const warehousesData = await warehousesRes.json();

            setIssues(issuesData.issues || []);
            setProducts(productsData.products || []);
            setWarehouses(warehousesData || []);
        } catch (error) {
            showToast('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa phiếu xuất này?')) return;

        try {
            await apiClient.delete(`/issues/${id}`);
            showToast('Xóa phiếu xuất thành công', 'success');
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi xóa', 'error');
        }
    };

    const handlePDF = async (issueId: string) => {
        const success = await generateIssuePDF(issueId, token || '');
        if (success) {
            showToast('Tạo PDF thành công', 'success');
        } else {
            showToast('Lỗi khi tạo PDF', 'error');
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Phiếu xuất kho ({issues.length})</h1>
                <button
                    onClick={() => { setSelectedIssue(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Tạo phiếu xuất
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã phiếu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người nhận</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {issues.map((issue) => (
                            <tr key={issue.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{issue.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{issue.receiver}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(issue.date).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">{issue.totalAmount.toLocaleString()} đ</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${issue.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {issue.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handlePDF(issue.id)}
                                        className="text-green-600 hover:text-green-900 mr-3"
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => { setSelectedIssue(issue); setIsModalOpen(true); }}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(issue.id)}
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

            <IssueForm
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedIssue(null); }}
                issue={selectedIssue}
                products={products}
                warehouses={warehouses}
                onSuccess={fetchData}
            />
        </div>
    );
}
