'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

export default function PermissionsPage() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [permissions, setPermissions] = useState<any>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchPermissions(selectedUser);
        } else {
            setPermissions({});
        }
    }, [selectedUser]);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data || []);
        } catch (error) {
            showToast('Lỗi khi tải danh sách người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async (userId: string) => {
        try {
            const response = await apiClient.get(`/admin/users/${userId}/permissions`);
            setPermissions(response.data.permissions || {});
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handlePermissionChange = (resource: string, action: string, value: boolean) => {
        setPermissions((prev: any) => ({
            ...prev,
            [resource]: {
                ...prev[resource],
                [action]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (!selectedUser) return;

        try {
            await apiClient.put(`/admin/users/${selectedUser}/permissions`, { permissions });
            showToast('Lưu phân quyền thành công', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi lưu phân quyền', 'error');
        }
    };

    if (user?.role !== 'ADMIN') {
        return <div className="p-6">Bạn không có quyền truy cập trang này.</div>;
    }

    const resources = [
        { key: 'products', label: 'Sản phẩm' },
        { key: 'categories', label: 'Danh mục' },
        { key: 'warehouses', label: 'Kho' },
        { key: 'orders', label: 'Đơn hàng' },
        { key: 'receipts', label: 'Nhập kho' },
        { key: 'issues', label: 'Xuất kho' },
        { key: 'transfers', label: 'Chuyển kho' },
        { key: 'debts', label: 'Công nợ' },
        { key: 'users', label: 'Người dùng' },
        { key: 'reports', label: 'Báo cáo' },
    ];

    const actions = [
        { key: 'view', label: 'Xem' },
        { key: 'create', label: 'Thêm' },
        { key: 'edit', label: 'Sửa' },
        { key: 'delete', label: 'Xóa' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Phân quyền chi tiết</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="max-w-md mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn người dùng</label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">-- Chọn người dùng --</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                {selectedUser && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức năng</th>
                                        {actions.map((action) => (
                                            <th key={action.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {action.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {resources.map((resource) => (
                                        <tr key={resource.key}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {resource.label}
                                            </td>
                                            {actions.map((action) => (
                                                <td key={action.key} className="px-6 py-4 whitespace-nowrap text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions[resource.key]?.[action.key] || false}
                                                        onChange={(e) => handlePermissionChange(resource.key, action.key, e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
