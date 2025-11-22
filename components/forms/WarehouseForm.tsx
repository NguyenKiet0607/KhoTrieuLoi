'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

const warehouseSchema = z.object({
    name: z.string().min(1, 'Tên kho là bắt buộc'),
    address: z.string().optional(),
    description: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
    isOpen: boolean;
    onClose: () => void;
    warehouse?: any;
    onSuccess: () => void;
}

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
    isOpen,
    onClose,
    warehouse,
    onSuccess,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<WarehouseFormData>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: warehouse || {
            name: '',
            address: '',
            description: '',
        },
    });

    React.useEffect(() => {
        if (warehouse) {
            reset(warehouse);
        } else {
            reset({ name: '', address: '', description: '' });
        }
    }, [warehouse, reset]);

    const onSubmit = async (data: WarehouseFormData) => {
        try {
            if (warehouse) {
                await apiClient.put(`/warehouses?id=${warehouse.id}`, data);
                showToast('Cập nhật kho thành công', 'success');
            } else {
                await apiClient.post('/warehouses', data);
                showToast('Tạo kho thành công', 'success');
            }
            onSuccess();
            onClose();
            reset();
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={warehouse ? 'Sửa Kho' : 'Thêm Kho'}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
                        {warehouse ? 'Cập Nhật' : 'Tạo Mới'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Kho *
                    </label>
                    <Input
                        {...register('name')}
                        placeholder="VD: Kho chính, Kho phụ..."
                        error={errors.name?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa Chỉ
                    </label>
                    <Input
                        {...register('address')}
                        placeholder="Địa chỉ kho hàng..."
                        error={errors.address?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô Tả
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Ghi chú về kho..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </form>
        </Modal>
    );
};
