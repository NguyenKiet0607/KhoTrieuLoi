'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function AdminPage() {
    const { user } = useAuthStore();

    if (user?.role !== 'ADMIN') {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1>
                <p className="mt-2 text-gray-600">Bạn không có quyền truy cập trang này.</p>
                <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản trị hệ thống</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Quản lý người dùng</h3>
                        <i className="fas fa-users text-blue-600 text-xl"></i>
                    </div>
                    <p className="text-sm text-gray-500">Thêm, sửa, xóa và phân quyền người dùng.</p>
                </Link>

                <Link href="/admin/permissions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Phân quyền chi tiết</h3>
                        <i className="fas fa-shield-alt text-purple-600 text-xl"></i>
                    </div>
                    <p className="text-sm text-gray-500">Cấu hình quyền truy cập chi tiết cho từng vai trò.</p>
                </Link>

                <Link href="/activity-logs" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Nhật ký hoạt động</h3>
                        <i className="fas fa-history text-orange-600 text-xl"></i>
                    </div>
                    <p className="text-sm text-gray-500">Xem lịch sử thao tác của người dùng trên hệ thống.</p>
                </Link>

                <Link href="/admin/backup" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Sao lưu & Phục hồi</h3>
                        <i className="fas fa-database text-green-600 text-xl"></i>
                    </div>
                    <p className="text-sm text-gray-500">Quản lý sao lưu dữ liệu và phục hồi khi cần thiết.</p>
                </Link>
            </div>
        </div>
    );
}
