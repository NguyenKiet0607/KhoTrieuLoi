'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const issueItemSchema = z.object({
    productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
    warehouseId: z.string().min(1, 'Vui lòng chọn kho'),
    quantity: z.number().min(1, 'Số lượng phải >= 1'),
    price: z.number().min(0, 'Giá phải >= 0'),
    amount: z.number().min(0),
});

const issueSchema = z.object({
    code: z.string().min(1, 'Mã phiếu là bắt buộc'),
    date: z.string().min(1, 'Ngày xuất là bắt buộc'),
    receiver: z.string().min(1, 'Người nhận là bắt buộc'),
    receiverPhone: z.string().optional(),
    receiverAddress: z.string().optional(),
    note: z.string().optional(),
    items: z.array(issueItemSchema).min(1, 'Vui lòng thêm ít nhất 1 sản phẩm'),
    status: z.string().default('COMPLETED'),
});

type IssueFormData = z.infer<typeof issueSchema>;

interface IssueFormProps {
    isOpen: boolean;
    onClose: () => void;
    issue?: any;
    products: any[];
    warehouses: any[];
    onSuccess: () => void;
}

export const IssueForm: React.FC<IssueFormProps> = ({
    isOpen,
    onClose,
    issue,
    products,
    warehouses,
    onSuccess,
}) => {
    const { token } = useAuthStore();
    const [items, setItems] = useState<any[]>([]);
    const [currentItem, setCurrentItem] = useState({
        productId: '',
        warehouseId: '',
        quantity: 1,
        price: 0,
    });
    const [currentStock, setCurrentStock] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<IssueFormData>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            code: `PX-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            receiver: '',
            receiverPhone: '',
            receiverAddress: '',
            note: '',
            items: [],
            status: 'COMPLETED',
        },
    });

    useEffect(() => {
        if (issue) {
            reset({
                ...issue,
                date: new Date(issue.date).toISOString().split('T')[0],
            });
            setItems(issue.StockIssueItem || []);
        } else {
            reset({
                code: `PX-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                receiver: '',
                receiverPhone: '',
                receiverAddress: '',
                note: '',
                items: [],
                status: 'COMPLETED',
            });
            setItems([]);
        }
    }, [issue, reset]);

    // Fetch stock when product or warehouse changes
    useEffect(() => {
        const fetchStock = async () => {
            if (currentItem.productId && currentItem.warehouseId) {
                try {
                    const res = await fetch(`/api/stock/details?productId=${currentItem.productId}&warehouseId=${currentItem.warehouseId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setCurrentStock(data[0].quantity);
                    } else {
                        setCurrentStock(0);
                    }
                } catch (error) {
                    console.error('Error fetching stock:', error);
                    setCurrentStock(null);
                }
            } else {
                setCurrentStock(null);
            }
        };

        fetchStock();
    }, [currentItem.productId, currentItem.warehouseId, token]);

    const addItem = () => {
        if (!currentItem.productId || !currentItem.warehouseId || currentItem.quantity <= 0) {
            showToast('Vui lòng điền đầy đủ thông tin sản phẩm', 'error');
            return;
        }

        if (currentStock !== null && currentItem.quantity > currentStock) {
            showToast(`Số lượng xuất vượt quá tồn kho (${currentStock})`, 'error');
            return;
        }

        const product = products.find(p => p.id === currentItem.productId);
        const warehouse = warehouses.find(w => w.id === currentItem.warehouseId);

        const newItem = {
            ...currentItem,
            amount: currentItem.quantity * currentItem.price,
            Product: product,
            Warehouse: warehouse,
        };

        setItems([...items, newItem]);
        setCurrentItem({ productId: '', warehouseId: '', quantity: 1, price: 0 });
        setCurrentStock(null);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: IssueFormData) => {
        if (items.length === 0) {
            showToast('Vui lòng thêm ít nhất 1 sản phẩm', 'error');
            return;
        }

        try {
            const submitData = {
                ...data,
                items: items.map(item => ({
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                    quantity: item.quantity,
                    price: item.price,
                    amount: item.amount,
                })),
                totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
            };

            if (issue) {
                await apiClient.put(`/issues/${issue.id}`, submitData);
                showToast('Cập nhật phiếu xuất thành công', 'success');
            } else {
                await apiClient.post('/issues', submitData);
                showToast('Tạo phiếu xuất thành công', 'success');
            }

            onSuccess();
            onClose();
            reset();
            setItems([]);
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={issue ? 'Sửa Phiếu Xuất' : 'Tạo Phiếu Xuất'}
            size="full"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
                        {issue ? 'Cập Nhật' : 'Tạo Mới'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã phiếu *</label>
                        <Input {...register('code')} error={errors.code?.message} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày xuất *</label>
                        <Input type="date" {...register('date')} error={errors.date?.message} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận *</label>
                        <Input {...register('receiver')} error={errors.receiver?.message} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <Input {...register('receiverPhone')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <Input {...register('receiverAddress')} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea {...register('note')} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm" />
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Danh sách sản phẩm</h3>

                    <div className="grid grid-cols-5 gap-3 mb-3">
                        <select
                            value={currentItem.productId}
                            onChange={(e) => {
                                const product = products.find(p => p.id === e.target.value);
                                setCurrentItem({
                                    ...currentItem,
                                    productId: e.target.value,
                                    price: product?.price || 0,
                                });
                            }}
                            className="rounded-md border-gray-300"
                        >
                            <option value="">Chọn sản phẩm</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>

                        <select
                            value={currentItem.warehouseId}
                            onChange={(e) => setCurrentItem({ ...currentItem, warehouseId: e.target.value })}
                            className="rounded-md border-gray-300"
                        >
                            <option value="">Chọn kho</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={currentItem.quantity}
                            onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                            placeholder="Số lượng"
                            className="rounded-md border-gray-300"
                        />

                        <input
                            type="number"
                            value={currentItem.price}
                            onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                            placeholder="Giá"
                            className="rounded-md border-gray-300"
                        />

                        <button
                            type="button"
                            onClick={addItem}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Thêm
                        </button>
                    </div>

                    {currentStock !== null && (
                        <div className={`text-sm mb-3 ${currentStock < 10 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                            Tồn kho hiện tại: {currentStock}
                        </div>
                    )}

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sản phẩm</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Kho</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SL</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Giá</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Thành tiền</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 text-sm">{item.Product?.name}</td>
                                    <td className="px-4 py-2 text-sm">{item.Warehouse?.name}</td>
                                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm">{item.price.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-sm font-semibold">{item.amount.toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 text-right">
                        <p className="text-lg font-bold">Tổng cộng: {totalAmount.toLocaleString()} đ</p>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
