/**
 * Order Form Component
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

// Schema definition
const orderItemSchema = z.object({
    productId: z.string().optional(), // Optional for custom items
    productName: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
    unit: z.string(),
    quantity: z.number().min(0.01, 'Số lượng phải > 0'),
    price: z.number().min(0, 'Đơn giá phải >= 0'),
    total: z.number(),
    note: z.string().optional(),
    isCustom: z.boolean().default(false),
});

const orderSchema = z.object({
    customerName: z.string().min(1, 'Vui lòng nhập tên khách hàng'),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),
    date: z.string(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).default('PENDING'),
    note: z.string().optional(),
    items: z.array(orderItemSchema).min(1, 'Vui lòng thêm ít nhất 1 sản phẩm'),
    vatRate: z.number().min(0).max(100).default(0),
    discount: z.number().min(0).default(0),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
    isOpen: boolean;
    onClose: () => void;
    products: Array<{ id: string; name: string; unit: string; price: number; code: string }>;
    onSuccess: () => void;
    orderToEdit?: any;
}

export const OrderForm: React.FC<OrderFormProps> = ({
    isOpen,
    onClose,
    products,
    onSuccess,
    orderToEdit,
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
    } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            customerName: '',
            customerPhone: '',
            customerAddress: '',
            date: new Date().toISOString().split('T')[0],
            status: 'PENDING',
            note: '',
            items: [],
            vatRate: 0,
            discount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    // Calculate totals
    const items = watch('items');
    const vatRate = watch('vatRate') || 0;
    const discount = watch('discount') || 0;

    const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const vatAmount = (subTotal * vatRate) / 100;
    const totalAmount = subTotal + vatAmount - discount;

    useEffect(() => {
        if (isOpen) {
            if (orderToEdit) {
                reset({
                    customerName: orderToEdit.customerName,
                    customerPhone: orderToEdit.customerPhone,
                    customerAddress: orderToEdit.customerAddress,
                    date: new Date(orderToEdit.date).toISOString().split('T')[0],
                    status: orderToEdit.status,
                    note: orderToEdit.note,
                    items: orderToEdit.items.map((item: any) => ({
                        productId: item.productId,
                        productName: item.productName,
                        unit: item.unit,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                        note: item.note,
                        isCustom: !item.productId,
                    })),
                    vatRate: orderToEdit.vatRate || 0,
                    discount: orderToEdit.discount || 0,
                });
            } else {
                reset({
                    customerName: '',
                    customerPhone: '',
                    customerAddress: '',
                    date: new Date().toISOString().split('T')[0],
                    status: 'PENDING',
                    note: '',
                    items: [],
                    vatRate: 0,
                    discount: 0,
                });
            }
        }
    }, [isOpen, orderToEdit, reset]);

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            setValue(`items.${index}.productName`, product.name);
            setValue(`items.${index}.unit`, product.unit);
            setValue(`items.${index}.price`, product.price);
            setValue(`items.${index}.isCustom`, false);
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

    const onSubmit = async (data: OrderFormData) => {
        if (isSubmittingState) return;

        setIsSubmittingState(true);
        try {
            if (orderToEdit) {
                await apiClient.put(`/orders/${orderToEdit.id}`, data);
                showToast('Cập nhật đơn hàng thành công', 'success');
            } else {
                await apiClient.post('/orders', data);
                showToast('Tạo đơn hàng thành công', 'success');
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
            title={orderToEdit ? 'Sửa Đơn Hàng' : 'Tạo Đơn Hàng Mới'}
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
            <form id="order-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên khách hàng *
                        </label>
                        <Input {...register('customerName')} error={errors.customerName?.message} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                        </label>
                        <Input {...register('customerPhone')} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày tạo *
                        </label>
                        <Input type="date" {...register('date')} error={errors.date?.message} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                        </label>
                        <Input {...register('customerAddress')} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            {...register('status')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                        </label>
                        <Input {...register('note')} />
                    </div>
                </div>

                {/* Items Table */}
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-medium text-gray-700">Chi tiết đơn hàng</h4>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => append({
                                    productId: '',
                                    productName: '',
                                    unit: '',
                                    quantity: 1,
                                    price: 0,
                                    total: 0,
                                    isCustom: true,
                                })}
                                id="add-custom-item-btn"
                            >
                                <i className="fas fa-edit mr-2"></i>SP Tùy Chỉnh
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
                                    isCustom: false,
                                })}
                                id="add-item-btn"
                            >
                                <i className="fas fa-plus mr-2"></i>Thêm Sản Phẩm
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
                                {fields.map((field, index) => {
                                    const isCustom = watch(`items.${index}.isCustom`);
                                    return (
                                        <tr key={field.id}>
                                            <td className="px-3 py-2 text-sm text-gray-500 text-center">{index + 1}</td>
                                            <td className="px-3 py-2">
                                                {isCustom ? (
                                                    <Input
                                                        {...register(`items.${index}.productName`)}
                                                        placeholder="Nhập tên sản phẩm..."
                                                    />
                                                ) : (
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
                                                )}
                                                {errors.items?.[index]?.productName && (
                                                    <p className="text-xs text-red-600 mt-1">{errors.items[index]?.productName?.message}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input {...register(`items.${index}.unit`)} readOnly={!isCustom} className={!isCustom ? "bg-gray-50" : ""} />
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
                                    );
                                })}
                                {fields.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                                            Chưa có sản phẩm nào. Nhấn "Thêm Sản Phẩm" để bắt đầu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex justify-end">
                    <div className="w-full md:w-1/3 space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tạm tính:</span>
                            <span className="font-medium">{formatCurrency(subTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Thuế VAT (%):</span>
                            <Input
                                type="number"
                                className="w-20 text-right h-8"
                                min="0"
                                max="100"
                                {...register('vatRate', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Giảm giá:</span>
                            <Input
                                type="number"
                                className="w-32 text-right h-8"
                                min="0"
                                step="1000"
                                {...register('discount', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="border-t pt-2 flex justify-between text-base font-bold text-indigo-700">
                            <span>Tổng cộng:</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
