'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function ReportsPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const { token } = useAuthStore();

    useEffect(() => {
        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
        setDateTo(today.toISOString().split('T')[0]);

        fetchReport(thirtyDaysAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
    }, []);

    const fetchReport = async (from: string, to: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reports?dateFrom=${from}&dateTo=${to}&type=summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchReport(dateFrom, dateTo);
    };

    if (loading) {
        return <div className="p-6">Đang tải...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Báo cáo tổng hợp</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Xem báo cáo
                        </button>
                    </div>
                </div>
            </div>

            {report && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Đơn hàng</h3>
                        <p className="text-3xl font-bold text-blue-600">{report.orders?.count || 0}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Tổng: {(report.orders?.totalAmount || 0).toLocaleString()} đ
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Phiếu nhập</h3>
                        <p className="text-3xl font-bold text-green-600">{report.receipts?.count || 0}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Tổng: {(report.receipts?.totalAmount || 0).toLocaleString()} đ
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Phiếu xuất</h3>
                        <p className="text-3xl font-bold text-orange-600">{report.issues?.count || 0}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Tổng: {(report.issues?.totalAmount || 0).toLocaleString()} đ
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Phiếu chuyển</h3>
                        <p className="text-3xl font-bold text-purple-600">{report.transfers?.count || 0}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Tổng: {(report.transfers?.totalAmount || 0).toLocaleString()} đ
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
