'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuthStore();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [stockRes, reportsRes] = await Promise.all([
                fetch('/api/stock/overview', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/reports?type=summary', { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            const stockData = await stockRes.json();
            const reportsData = await reportsRes.json();

            setStats({
                ...stockData,
                ...reportsData,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard - Chào mừng {user?.name}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link href="/products" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sản phẩm</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats?.totalProducts || 0}</p>
                    <p className="text-sm text-gray-500 mt-2">Tổng số sản phẩm</p>
                </Link>

                <Link href="/stock-details" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tồn kho</h3>
                    <p className="text-3xl font-bold text-green-600">{stats?.totalStockValue?.toLocaleString() || 0} đ</p>
                    <p className="text-sm text-gray-500 mt-2">Giá trị tồn kho</p>
                </Link>

                <Link href="/orders" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Đơn hàng</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats?.orders?.count || 0}</p>
                    <p className="text-sm text-gray-500 mt-2">Tổng: {(stats?.orders?.totalAmount || 0).toLocaleString()} đ</p>
                </Link>

                <Link href="/debts" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Công nợ</h3>
                    <p className="text-3xl font-bold text-red-600">{(stats?.totalDebt || 0).toLocaleString()} đ</p>
                    <p className="text-sm text-gray-500 mt-2">Cần thu</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                            <div>
                                <p className="font-medium text-green-900">Phiếu nhập</p>
                                <p className="text-sm text-green-600">{stats?.receipts?.count || 0} phiếu</p>
                            </div>
                            <p className="text-lg font-bold text-green-600">{(stats?.receipts?.totalAmount || 0).toLocaleString()} đ</p>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                            <div>
                                <p className="font-medium text-orange-900">Phiếu xuất</p>
                                <p className="text-sm text-orange-600">{stats?.issues?.count || 0} phiếu</p>
                            </div>
                            <p className="text-lg font-bold text-orange-600">{(stats?.issues?.totalAmount || 0).toLocaleString()} đ</p>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                            <div>
                                <p className="font-medium text-purple-900">Phiếu chuyển</p>
                                <p className="text-sm text-purple-600">{stats?.transfers?.count || 0} phiếu</p>
                            </div>
                            <p className="text-lg font-bold text-purple-600">{(stats?.transfers?.totalAmount || 0).toLocaleString()} đ</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Truy cập nhanh</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/products" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-center">
                            <p className="font-medium text-blue-900">Sản phẩm</p>
                        </Link>
                        <Link href="/orders" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 text-center">
                            <p className="font-medium text-purple-900">Đơn hàng</p>
                        </Link>
                        <Link href="/receipts" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 text-center">
                            <p className="font-medium text-green-900">Nhập kho</p>
                        </Link>
                        <Link href="/issues" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 text-center">
                            <p className="font-medium text-orange-900">Xuất kho</p>
                        </Link>
                        <Link href="/transfers" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 text-center">
                            <p className="font-medium text-indigo-900">Chuyển kho</p>
                        </Link>
                        <Link href="/reports" className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                            <p className="font-medium text-gray-900">Báo cáo</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
