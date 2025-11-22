'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserForm } from '@/components/forms/UserForm';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const { token, user: currentUser } = useAuthStore();
    const isAdmin = currentUser?.role === 'ADMIN';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setUsers(data || []);
        } catch (error) {
            showToast('Lỗi khi tải người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) {
            showToast('Chỉ admin mới có quyền xóa người dùng', 'error');
            return;
        }
        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

        try {
            await apiClient.delete(`/users/${id}`);
            showToast('Xóa người dùng thành công', 'success');
            fetchUsers();
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi xóa', 'error');
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Người dùng ({users.length})</h1>
                {isAdmin && (
                    <button
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Thêm người dùng
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                            {isAdmin && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={user.id === currentUser?.id}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdmin && (
                <UserForm
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                    user={selectedUser}
                    onSuccess={fetchUsers}
                />
            )}
        </div>
    );
}
