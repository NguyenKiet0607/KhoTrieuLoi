/**
 * Receipt Form Component
 * 
 * NEW VERSION: React Hook Form + Zod validation
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ProductForm } from './ProductForm';

// Schema definition
const receiptItemSchema = z.object({
    productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
    productName: z.string(),
    unit: z.string(),
    quantity: z.number().min(0.01, 'Số lượng phải > 0'),
    price: z.number().min(0, 'Đơn giá phải >= 0'),
    total: z.number(),
    note: z.string().optional(),
});

const receiptSchema = z.object({
    warehouseId: z.string().min(1, 'Vui lòng chọn kho nhập'),
    supplier: z.string().min(1, 'Vui lòng nhập nhà cung cấp'),
    receiver: z.string().min(1, 'Vui lòng nhập người nhận'),
    deliverer: z.string().optional(),
    date: z.string(),
    note: z.string().optional(),
    items: z.array(receiptItemSchema).min(1, 'Vui lòng thêm ít nhất 1 sản phẩm'),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

interface ReceiptFormProps {
    isOpen: boolean;
    onClose: () => void;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; unit: string; price: number; code: string }>;
    categories: Array<{ id: string; name: string }>;
    onSuccess: () => void;
    duplicateReceiptData?: any;
    receipt?: any;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
    isOpen,
    onClose,
    warehouses,
    products,
    categories,
    onSuccess,
    duplicateReceiptData,
    receipt,
}) => {
    const { user } = useAuthStore();
    const [isSubmittingState, setIsSubmittingState] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ReceiptFormData>({
        resolver: zodResolver(receiptSchema),
        defaultValues: {
            warehouseId: '',
            supplier: '',
            receiver: user?.name || '',
            deliverer: '',
            date: new Date().toISOString().split('T')[0],
            note: '',
            items: [],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items',
    });

    // Calculate totals
    const items = watch('items');
    const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

    useEffect(() => {
        if (isOpen) {
            if (receipt) {
                // Edit mode
                reset({
                    warehouseId: receipt.warehouseId,
                    supplier: receipt.supplier,
                    receiver: receipt.receiver,
                    deliverer: receipt.deliverer,
                    date: new Date(receipt.date).toISOString().split('T')[0],
                    note: receipt.note,
                    items: receipt.StockReceiptItem.map((item: any) => ({
                        productId: item.productId,
                        productName: item.Product?.name || '',
                        unit: item.Product?.unit || '',
                        quantity: item.quantity,
                        price: item.price,
                        total: item.totalPrice,
                        note: item.note || '',
                    })),
                });
            } else if (duplicateReceiptData) {
                // Duplicate mode
                reset({
                    warehouseId: duplicateReceiptData.warehouseId,
                    supplier: duplicateReceiptData.supplier,
                    receiver: user?.name || '',
                    deliverer: duplicateReceiptData.deliverer,
                    date: new Date().toISOString().split('T')[0],
                    note: duplicateReceiptData.note,
                    items: duplicateReceiptData.items.map((item: any) => ({
                        productId: item.productId,
                        productName: item.product.name,
                        unit: item.unit,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                        note: item.note,
                    })),
                });
            } else {
                // Create mode
                reset({
                    warehouseId: '',
                    supplier: '',
                    receiver: user?.name || '',
                    deliverer: '',
                    date: new Date().toISOString().split('T')[0],
                    note: '',
                    items: [],
                });
            }
        }
    }, [isOpen, duplicateReceiptData, receipt, user, reset]);

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            setValue(`items.${index}.productName`, product.name);
            setValue(`items.${index}.unit`, product.unit);
            setValue(`items.${index}.price`, product.price);
            // Recalculate total
            const quantity = watch(`items.${index}.quantity`) || 0;
            setValue(`items.${index}.total`, quantity * product.price);
        }
    };

    const handleQuantityPriceChange = (index: number) => {
        const quantity = watch(`items.${index}.quantity`) || 0;
        const price = watch(`items.${index}.price`) || 0;
        setValue(`items.${index}.total`, quantity * price);
    };

    const onSubmit = async (data: ReceiptFormData) => {
        if (isSubmittingState) return;

        setIsSubmittingState(true);
        try {
            if (receipt) {
                await apiClient.put(`/receipts/${receipt.id}`, data);
                showToast('Cập nhật phiếu nhập kho thành công', 'success');
            } else {
                await apiClient.post('/receipts', data);
                showToast('Tạo phiếu nhập kho thành công', 'success');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
        } finally {
            setIsSubmittingState(false);
        }
    };

    const handleSaveDraft = async () => {
        // Implementation for draft saving would go here
        showToast('Chức năng lưu nháp đang phát triển', 'info');
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={receipt ? 'Sửa Phiếu Nhập' : (duplicateReceiptData ? 'Nhân Bản Phiếu Nhập' : 'Tạo Phiếu Nhập Kho')}
                size="full"
                footer={
                    <>
                        <Button variant="outline" onClick={handleSaveDraft} id="save-draft-btn">
                            Lưu Nháp
                        </Button>
                        <Button variant="outline" onClick={onClose} disabled={isSubmittingState}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit(onSubmit)} loading={isSubmittingState} disabled={isSubmittingState}>
                            Hoàn Thành
                        </Button>
                    </>
                }
            >
                <form id="receipt-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kho nhập *
                            </label>
                            <select
                                {...register('warehouseId')}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">-- Chọn kho --</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                            {errors.warehouseId && (
                                <p className="mt-1 text-sm text-red-600">{errors.warehouseId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày nhập *
                            </label>
                            <Input type="date" {...register('date')} error={errors.date?.message} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nhà cung cấp *
                            </label>
                            <Input {...register('supplier')} error={errors.supplier?.message} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Người giao
                            </label>
                            <Input {...register('deliverer')} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Người nhận *
                            </label>
                            <Input {...register('receiver')} error={errors.receiver?.message} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú
                            </label>
                            <Input {...register('note')} />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                            <h4 className="font-medium text-gray-700">Danh sách hàng hóa</h4>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowProductModal(true)}
                                >
                                    <i className="fas fa-plus mr-2"></i>Tạo SP Mới
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => append({
                                        productId: '',
                                        productName: '',
                                        unit: '',
                                        quantity: 1,
                                        price: 0,
                                        total: 0,
                                    })}
                                    id="add-item-btn"
                                >
                                    <i className="fas fa-plus mr-2"></i>Thêm Dòng
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Sản phẩm</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ĐVT</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Số lượng</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Đơn giá</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Thành tiền</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="px-3 py-2 text-sm text-gray-500 text-center">{index + 1}</td>
                                            <td className="px-3 py-2">
                                                <select
                                                    {...register(`items.${index}.productId`)}
                                                    onChange={(e) => handleProductChange(index, e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">-- Chọn sản phẩm --</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.code} - {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.items?.[index]?.productId && (
                                                    <p className="text-xs text-red-600 mt-1">{errors.items[index]?.productId?.message}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input {...register(`items.${index}.unit`)} readOnly className="bg-gray-50" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    onChange={() => handleQuantityPriceChange(index)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    step="1000"
                                                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                                                    onChange={() => handleQuantityPriceChange(index)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    {...register(`items.${index}.total`, { valueAsNumber: true })}
                                                    readOnly
                                                    className="bg-gray-50 font-medium text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input {...register(`items.${index}.note`)} />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const item = items[index];
                                                            append({ ...item });
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 btn-copy"
                                                        title="Nhân bản"
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="text-red-600 hover:text-red-800 btn-delete"
                                                        title="Xóa"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {fields.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                                                Chưa có sản phẩm nào. Nhấn "Thêm Dòng" để bắt đầu.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 font-medium">
                                    <tr>
                                        <td colSpan={5} className="px-3 py-2 text-right text-gray-700">Tổng cộng:</td>
                                        <td className="px-3 py-2 text-right text-indigo-700">
                                            {formatCurrency(totalAmount)}
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Product Creation Modal */}
            <ProductForm
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                categories={categories}
                onSuccess={() => {
                    // Refresh products list logic would go here (passed from parent or refetched)
                    showToast('Đã tạo sản phẩm mới, vui lòng tải lại trang nếu chưa thấy trong danh sách', 'info');
                }}
            />
        </>
    );
};
