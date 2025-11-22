import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 p-4 rounded-full">
                        <FileQuestion className="w-16 h-16 text-gray-400" />
                    </div>
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Không tìm thấy trang</h2>
                <p className="text-gray-600 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
                <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block font-medium"
                >
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}
