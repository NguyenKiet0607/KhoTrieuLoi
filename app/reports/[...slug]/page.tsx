'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReportDetailPage() {
    const params = useParams();
    const slug = params.slug as string[];
    const reportName = slug ? slug.join(' / ').replace(/-/g, ' ').toUpperCase() : 'REPORT';

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/reports"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chi tiết báo cáo</h1>
                    <p className="text-gray-600 mt-1">{reportName}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Tính năng đang phát triển
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Báo cáo này đang được xây dựng và sẽ sớm ra mắt trong phiên bản tiếp theo.
                    Vui lòng quay lại sau.
                </p>
                <div className="mt-8">
                    <Link
                        href="/reports"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Quay lại trang báo cáo
                    </Link>
                </div>
            </div>
        </div>
    );
}
