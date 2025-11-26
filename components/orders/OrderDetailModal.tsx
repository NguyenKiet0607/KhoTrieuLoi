import React, { useEffect, useState } from 'react';
import { X, Printer, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import apiClient from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { generateOrderPDF } from '@/lib/pdfGenerator';
import { useAuthStore } from '@/stores/authStore';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    onDeleteSuccess?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Nháp",
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đã gửi hàng",
    DELIVERED: "Đã giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    DRAFT: "secondary",
    PENDING: "warning",
    CONFIRMED: "info",
    PROCESSING: "info",
    SHIPPED: "default",
    DELIVERED: "success",
    COMPLETED: "success",
    CANCELLED: "destructive",
};

export default function OrderDetailModal({ isOpen, onClose, orderId, onDeleteSuccess }: OrderDetailModalProps) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
        } else {
            setOrder(null);
        }
    }, [isOpen, orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/orders/${orderId}`);
            setOrder(response.data);
        } catch (error: any) {
            console.error("Error fetching order details:", error);
            showToast("Lỗi khi tải thông tin đơn hàng", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        if (!orderId || !token) {
            showToast("Vui lòng đăng nhập để in đơn hàng", "error");
            return;
        }
        try {
            const success = await generateOrderPDF(orderId, token);
            if (success) {
                showToast("Đã tải xuống file PDF", "success");
            } else {
                showToast("Lỗi khi tạo file PDF", "error");
            }
        } catch (error) {
            console.error("Print error:", error);
            showToast("Lỗi khi tạo file PDF", "error");
        }
    };

    const handleDelete = async () => {
        if (!orderId) return;
        try {
            await apiClient.delete(`/orders/${orderId}`);
            showToast("Xóa đơn hàng thành công", "success");
            setDeleteConfirm(false);
            onClose();
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (error) {
            console.error("Error deleting order:", error);
            showToast("Lỗi khi xóa đơn hàng", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={loading ? "Đang tải..." : `Chi tiết đơn hàng #${order?.code || ''}`} size="xl">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : order ? (
                <div className="space-y-6">
                    {/* Header Actions */}
                    <div className="flex justify-between items-center">
                        <Badge variant={STATUS_VARIANTS[order.status] || "secondary"} className="text-base px-3 py-1">
                            {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" /> In
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Xóa
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Khách hàng:</span>
                                    <span className="font-medium text-gray-900">{order.customer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số điện thoại:</span>
                                    <span className="font-medium text-gray-900">{order.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Địa chỉ:</span>
                                    <span className="font-medium text-gray-900 text-right max-w-[60%]">{order.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ngày tạo:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(order.createdAt || order.date).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Kho xuất:</span>
                                    <span className="font-medium text-gray-900">{order.Warehouse?.name || "---"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Người tạo:</span>
                                    <span className="font-medium text-gray-900">{order.User?.name || order.User?.username || "---"}</span>
                                </div>
                                {order.note && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ghi chú:</span>
                                        <span className="font-medium text-gray-900 italic">{order.note}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3 text-center">ĐVT</th>
                                    <th className="px-4 py-3 text-right">SL</th>
                                    <th className="px-4 py-3 text-right">Đơn giá</th>
                                    {order.hasVAT && <th className="px-4 py-3 text-right">VAT</th>}
                                    <th className="px-4 py-3 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.OrderItem?.map((item: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{item.Product?.name || "Sản phẩm đã xóa"}</div>
                                            {item.Product?.code && (
                                                <div className="text-xs text-gray-500">{item.Product.code}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600">{item.Product?.unit}</td>
                                        <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            {item.price?.toLocaleString("vi-VN")} đ
                                        </td>
                                        {order.hasVAT && (
                                            <td className="px-4 py-3 text-right text-gray-600">
                                                {item.Product?.vat ? `${item.Product.vat}%` : '0%'}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            {(item.amount || item.quantity * item.price).toLocaleString("vi-VN")} đ
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-medium">
                                <tr>
                                    <td colSpan={order.hasVAT ? 5 : 4} className="px-4 py-3 text-right text-gray-900">Tổng cộng:</td>
                                    <td className="px-4 py-3 text-right font-bold text-lg text-blue-600">
                                        {order.totalAmount?.toLocaleString("vi-VN")} đ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    Không tìm thấy thông tin đơn hàng
                </div>
            )}

            <ConfirmModal
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
                variant="danger"
            />
        </Modal>
    );
}
