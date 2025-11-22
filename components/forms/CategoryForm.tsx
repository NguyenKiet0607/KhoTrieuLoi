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

const categorySchema = z.object({
    name: z.string().min(1, 'Tên danh mục là bắt buộc'),
    description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    category?: any;
    onSuccess: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
    isOpen,
    onClose,
    category,
    onSuccess,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: category || {
            name: '',
            description: '',
        },
    });

    React.useEffect(() => {
        if (category) {
            reset(category);
        } else {
            reset({ name: '', description: '' });
        }
    }, [category, reset]);

    const onSubmit = async (data: CategoryFormData) => {
        try {
            if (category) {
                await apiClient.put(`/categories?id=${category.id}`, data);
                showToast('Cập nhật danh mục thành công', 'success');
            } else {
                await apiClient.post('/categories', data);
                showToast('Tạo danh mục thành công', 'success');
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
            title={category ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
                        {category ? 'Cập Nhật' : 'Tạo Mới'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Danh Mục *
                    </label>
                    <Input
                        {...register('name')}
                        placeholder="VD: HẠT INOX, HẠT BI THÉP..."
                        error={errors.name?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô Tả
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Mô tả về danh mục..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </form>
        </Modal>
    );
};
