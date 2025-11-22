/**
 * Transfer Form Component
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

// Schema definition
const transferItemSchema = z.object({
    productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
    productName: z.string(),
    unit: z.string(),
    quantity: z.number().min(0.01, 'Số lượng phải > 0'),
    note: z.string().optional(),
});

const transferSchema = z.object({
    fromWarehouseId: z.string().min(1, 'Vui lòng chọn kho xuất'),
    toWarehouseId: z.string().min(1, 'Vui lòng chọn kho nhập'),
    date: z.string(),
    note: z.string().optional(),
    items: z.array(transferItemSchema).min(1, 'Vui lòng thêm ít nhất 1 sản phẩm'),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: 'Kho nhập và kho xuất không được trùng nhau',
    path: ['toWarehouseId'],
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
    isOpen: boolean;
    onClose: () => void;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; unit: string; code: string }>;
    onSuccess: () => void;
    transfer?: any;
}

export const TransferForm: React.FC<TransferFormProps> = ({
    isOpen,
    onClose,
    warehouses,
    products,
    onSuccess,
    transfer,
}) => {
    const { user } = useAuthStore();
    const [isSubmittingState, setIsSubmittingState] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            fromWarehouseId: '',
            toWarehouseId: '',
            date: new Date().toISOString().split('T')[0],
            note: '',
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    useEffect(() => {
        if (isOpen) {
            if (transfer) {
                // Edit mode
                reset({
                    fromWarehouseId: transfer.fromWarehouseId,
                    toWarehouseId: transfer.toWarehouseId,
                    date: new Date(transfer.date).toISOString().split('T')[0],
                    note: transfer.note,
                    items: transfer.StockTransferItem.map((item: any) => ({
                        productId: item.productId,
                        productName: item.Product?.name || '',
                        unit: item.Product?.unit || '',
                        quantity: item.quantity,
                        note: item.note || '',
                    })),
                });
            } else {
                // Create mode
                reset({
                    fromWarehouseId: '',
                    toWarehouseId: '',
                    date: new Date().toISOString().split('T')[0],
                    note: '',
                    items: [],
                });
            }
        }
    }, [isOpen, transfer, reset]);

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            setValue(`items.${index}.productName`, product.name);
            setValue(`items.${index}.unit`, product.unit);
        }
    };

    const onSubmit = async (data: TransferFormData) => {
        if (isSubmittingState) return;

        setIsSubmittingState(true);
        try {
            if (transfer) {
                await apiClient.put(`/transfers/${transfer.id}`, data);
                showToast('Cập nhật phiếu chuyển kho thành công', 'success');
            } else {
                await apiClient.post('/transfers', data);
                showToast('Tạo phiếu chuyển kho thành công', 'success');
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
        showToast('Chức năng lưu nháp đang phát triển', 'info');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={transfer ? 'Sửa Phiếu Chuyển' : 'Tạo Phiếu Chuyển Kho'}
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
            <form id="transfer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kho xuất *
                        </label>
                        <select
                            {...register('fromWarehouseId')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Chọn kho xuất --</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                        {errors.fromWarehouseId && (
                            <p className="mt-1 text-sm text-red-600">{errors.fromWarehouseId.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kho nhập *
                        </label>
                        <select
                            {...register('toWarehouseId')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Chọn kho nhập --</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                        {errors.toWarehouseId && (
                            <p className="mt-1 text-sm text-red-600">{errors.toWarehouseId.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày chuyển *
                        </label>
                        <Input type="date" {...register('date')} error={errors.date?.message} />
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
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => append({
                                productId: '',
                                productName: '',
                                unit: '',
                                quantity: 1,
                            })}
                            id="add-item-btn"
                        >
                            <i className="fas fa-plus mr-2"></i>Thêm Dòng
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Sản phẩm</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ĐVT</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Số lượng</th>
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
                                                        const item = watch(`items.${index}`);
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
                                        <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                                            Chưa có sản phẩm nào. Nhấn "Thêm Dòng" để bắt đầu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
