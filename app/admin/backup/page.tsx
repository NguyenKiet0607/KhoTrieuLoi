"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function BackupPage() {
    const { user } = useAuthStore();
    const [backups, setBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const response = await apiClient.get('/backup/list');
            setBackups(response.data || []);
        } catch (error) {
            console.error('Error fetching backups:', error);
            showToast('Lỗi khi tải danh sách backup', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            await apiClient.post('/backup');
            showToast('Sao lưu dữ liệu thành công', 'success');
            fetchBackups(); // Refresh list
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi sao lưu', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleRestore = async (filename: string) => {
        if (!confirm('CẢNH BÁO: Việc phục hồi sẽ ghi đè dữ liệu hiện tại. Bạn có chắc chắn không?')) {
            return;
        }

        if (processing) return;
        setProcessing(true);
        try {
            // Implement restore API call here
            // await apiClient.post('/backup/restore', { filename });
            showToast('Chức năng phục hồi đang được phát triển', 'info');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi phục hồi', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (user?.role !== 'ADMIN') {
        return <div className="p-6">Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Sao lưu & Phục hồi</h1>
                <Button onClick={handleCreateBackup} loading={processing}>
                    <i className="fas fa-save mr-2"></i>Sao lưu ngay
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cấu hình</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 rounded border">
                        <p className="font-medium text-gray-700">Thư mục sao lưu:</p>
                        <p className="text-gray-600 mt-1">H:\My Drive\Tổng Hợp Các Chứng Từ\backups</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border">
                        <p className="font-medium text-gray-700">Lịch trình tự động:</p>
                        <p className="text-gray-600 mt-1">Mỗi giờ (0 * * * *)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Lịch sử sao lưu</h3>
                </div>

                {backups.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên file</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {backups.map((backup, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleRestore(backup.name)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Phục hồi
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        <p>Chưa có thông tin lịch sử sao lưu (hoặc chưa kết nối API danh sách).</p>
                        <p className="mt-2 text-sm">Vui lòng kiểm tra thư mục backup trên server.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
