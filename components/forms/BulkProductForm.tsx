'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Trash2, Copy, Plus } from 'lucide-react';
import apiClient from '@/lib/api';
import { showToast } from '@/components/ui/Toast';

// Schema for a single product row
const productRowSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Tên là bắt buộc'),
    categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
    unit: z.string().min(1, 'Đơn vị là bắt buộc'),
    price: z.number().min(0).default(0),
    supplier: z.string().optional(),
    vat: z.number().min(0).max(100).default(0),
    invoiceQuantity: z.number().int().min(0).default(0),
    description: z.string().optional(),
});

const bulkProductSchema = z.object({
    products: z.array(productRowSchema).min(1, 'Cần ít nhất 1 sản phẩm'),
});

type BulkProductFormData = z.infer<typeof bulkProductSchema>;

interface BulkProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Array<{ id: string; name: string }>;
    initialData?: any[]; // If provided, we are in "Bulk Edit" mode
    onSuccess: () => void;
}

export const BulkProductForm: React.FC<BulkProductFormProps> = ({
    isOpen,
    onClose,
    categories,
    initialData,
    onSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BulkProductFormData>({
        resolver: zodResolver(bulkProductSchema),
        defaultValues: {
            products: [{ name: '', categoryId: '', unit: '', price: 0, vat: 0, invoiceQuantity: 0 }],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'products',
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData && initialData.length > 0) {
                // Map initial data to form structure
                const mappedData = initialData.map(p => ({
                    id: p.id,
                    name: p.name,
                    categoryId: p.categoryId,
                    unit: p.unit,
                    price: p.price || 0,
                    supplier: p.supplier || '',
                    vat: p.vat || 0,
                    invoiceQuantity: p.invoiceQuantity || 0,
                    description: p.description || '',
                }));
                reset({ products: mappedData });
            } else {
                reset({ products: [{ name: '', categoryId: '', unit: '', price: 0, vat: 0, invoiceQuantity: 0 }] });
            }
        }
    }, [isOpen, initialData, reset]);

    const handleCopyRow = (index: number) => {
        if (index === 0) return;
        const prevRow = watch(`products.${index - 1}`);
        if (prevRow) {
            const currentRow = watch(`products.${index}`);
            update(index, {
                ...currentRow,
                categoryId: prevRow.categoryId,
                unit: prevRow.unit,
                price: prevRow.price,
                supplier: prevRow.supplier,
                vat: prevRow.vat,
                invoiceQuantity: prevRow.invoiceQuantity,
                description: prevRow.description,
            });
        }
    };

    const onSubmit = async (data: BulkProductFormData) => {
        setIsSubmitting(true);
        try {
            if (initialData && initialData.length > 0) {
                // Bulk Update
                // We'll send individual update requests for now as we don't have a bulk update API
                // Or we can create one. For simplicity/safety, let's loop.
                await Promise.all(data.products.map(p => {
                    if (p.id) {
                        return apiClient.put(`/products/${p.id}`, p);
                    }
                    return Promise.resolve();
                }));
                showToast(`Đã cập nhật ${data.products.length} sản phẩm`, 'success');
            } else {
                // Bulk Create
                // We can loop create or create a bulk endpoint.
                // Let's loop for now to reuse existing logic, or better, create a bulk endpoint later if slow.
                // But for "Add Multiple", user might add 5-10 items.
                await Promise.all(data.products.map(p => {
                    const submitData = {
                        ...p,
                        code: `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Generate unique code
                    };
                    return apiClient.post('/products', submitData);
                }));
                showToast(`Đã thêm ${data.products.length} sản phẩm`, 'success');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Bulk action error:', error);
            showToast('Có lỗi xảy ra khi lưu dữ liệu', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Sửa Nhiều Sản Phẩm' : 'Thêm Nhiều Sản Phẩm'}
            size="full"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting}>
                        Lưu Tất Cả
                    </Button>
                </>
            }
        >
            <div className="overflow-x-auto min-h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-10">#</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-64">Tên sản phẩm *</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-40">Danh mục *</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Đơn vị *</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">Giá bán</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">VAT %</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">SL HĐ</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-40">Nhà cung cấp</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fields.map((field, index) => (
                            <tr key={field.id}>
                                <td className="px-3 py-2 text-sm text-gray-500 text-center">
                                    {index + 1}
                                </td>
                                <td className="px-3 py-2">
                                    <Input
                                        {...register(`products.${index}.name`)}
                                        placeholder="Tên sản phẩm"
                                        error={errors.products?.[index]?.name?.message}
                                        className="h-9"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        {...register(`products.${index}.categoryId`)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-9"
                                    >
                                        <option value="">Chọn...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.products?.[index]?.categoryId && (
                                        <p className="text-xs text-red-500 mt-1">{errors.products[index]?.categoryId?.message}</p>
                                    )}
                                </td>
                                <td className="px-3 py-2">
                                    <Input
                                        {...register(`products.${index}.unit`)}
                                        placeholder="Đơn vị"
                                        error={errors.products?.[index]?.unit?.message}
                                        className="h-9"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <Input
                                        type="number"
                                        {...register(`products.${index}.price`, { valueAsNumber: true })}
                                        className="h-9 text-right"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <Input
                                        type="number"
                                        {...register(`products.${index}.vat`, { valueAsNumber: true })}
                                        className="h-9 text-right"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <Input
                                        type="number"
                                        {...register(`products.${index}.invoiceQuantity`, { valueAsNumber: true })}
                                        className="h-9 text-right"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <Input
                                        {...register(`products.${index}.supplier`)}
                                        placeholder="NSX"
                                        className="h-9"
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleCopyRow(index)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="Sao chép dòng trên"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Xóa dòng"
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: '', categoryId: '', unit: '', price: 0, vat: 0, invoiceQuantity: 0 })}
                        className="w-full border-dashed"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Thêm dòng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
