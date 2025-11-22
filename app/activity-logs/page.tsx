'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        category: '',
        page: 1,
    });
    const { token } = useAuthStore();

    useEffect(() => {
        fetchLogs();
    }, [filters.page]);

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams({
                page: filters.page.toString(),
                limit: '50',
            });

            if (filters.action) params.append('action', filters.action);
            if (filters.category) params.append('category', filters.category);

            const response = await fetch(`/api/activity-logs?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nhật ký hoạt động ({logs.length})</h1>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hành động</label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="w-full rounded-md border-gray-300"
                        >
                            <option value="">Tất cả</option>
                            <option value="CREATE">Tạo mới</option>
                            <option value="UPDATE">Cập nhật</option>
                            <option value="DELETE">Xóa</option>
                            <option value="LOGIN">Đăng nhập</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full rounded-md border-gray-300"
                        >
                            <option value="">Tất cả</option>
                            <option value="PRODUCT">Sản phẩm</option>
                            <option value="STOCK">Kho</option>
                            <option value="ORDER">Đơn hàng</option>
                            <option value="USER">Người dùng</option>
                        </select>
                    </div>
                    <div className="flex items-end col-span-2">
                        <button
                            onClick={() => {
                                setFilters({ action: '', category: '', page: 1 });
                                fetchLogs();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={() => setFilters({ action: '', category: '', page: 1 })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.User?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${log.action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                                            log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                                                log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.category}</td>
                                <td className="px-6 py-4 text-sm">{log.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page === 1}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                    Trang trước
                </button>
                <span className="text-sm text-gray-600">Trang {filters.page}</span>
                <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={logs.length < 50}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
}
