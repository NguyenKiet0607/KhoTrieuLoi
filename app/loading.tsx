import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
        </div>
    );
}
