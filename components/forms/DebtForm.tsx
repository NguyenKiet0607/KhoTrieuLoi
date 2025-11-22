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

const debtSchema = z.object({
    companyName: z.string().min(1, 'Tên công ty là bắt buộc'),
    totalAmount: z.number().min(0, 'Tổng tiền phải >= 0'),
    collectedAmount: z.number().min(0, 'Số tiền đã thu phải >= 0').default(0),
    paymentDate: z.string().min(1, 'Hạn thanh toán là bắt buộc'),
    note: z.string().optional(),
}).refine((data) => data.collectedAmount <= data.totalAmount, {
    message: 'Số tiền đã thu không được lớn hơn tổng tiền',
    path: ['collectedAmount'],
});

type DebtFormData = z.infer<typeof debtSchema>;

interface DebtFormProps {
    isOpen: boolean;
    onClose: () => void;
    debt?: any;
    onSuccess: () => void;
}

export const DebtForm: React.FC<DebtFormProps> = ({
    isOpen,
    onClose,
    debt,
    onSuccess,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm<DebtFormData>({
        resolver: zodResolver(debtSchema),
        defaultValues: debt || {
            companyName: '',
            totalAmount: 0,
            collectedAmount: 0,
            paymentDate: new Date().toISOString().split('T')[0],
            note: '',
        },
    });

    const totalAmount = watch('totalAmount');
    const collectedAmount = watch('collectedAmount');
    const remainingAmount = totalAmount - collectedAmount;

    React.useEffect(() => {
        if (debt) {
            reset({
                ...debt,
                paymentDate: debt.paymentDate ? new Date(debt.paymentDate).toISOString().split('T')[0] : '',
            });
        } else {
            reset({
                companyName: '',
                totalAmount: 0,
                collectedAmount: 0,
                paymentDate: new Date().toISOString().split('T')[0],
                note: '',
            });
        }
    }, [debt, reset]);

    const onSubmit = async (data: DebtFormData) => {
        try {
            const submitData = {
                ...data,
                remainingAmount: data.totalAmount - data.collectedAmount,
            };

            if (debt) {
                await apiClient.put(`/debts?id=${debt.id}`, submitData);
                showToast('Cập nhật công nợ thành công', 'success');
            } else {
                await apiClient.post('/debts', submitData);
                showToast('Tạo công nợ thành công', 'success');
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
            title={debt ? 'Sửa Công Nợ' : 'Thêm Công Nợ'}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
                        {debt ? 'Cập Nhật' : 'Tạo Mới'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Công Ty *
                    </label>
                    <Input
                        {...register('companyName')}
                        placeholder="Tên công ty/khách hàng..."
                        error={errors.companyName?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tổng Tiền (đ) *
                        </label>
                        <Input
                            type="number"
                            step="1000"
                            {...register('totalAmount', { valueAsNumber: true })}
                            error={errors.totalAmount?.message}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đã Thu (đ)
                        </label>
                        <Input
                            type="number"
                            step="1000"
                            {...register('collectedAmount', { valueAsNumber: true })}
                            error={errors.collectedAmount?.message}
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-blue-900">
                        Còn lại: <span className="text-lg font-bold text-red-600">
                            {remainingAmount.toLocaleString()} đ
                        </span>
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hạn Thanh Toán *
                    </label>
                    <Input
                        type="date"
                        {...register('paymentDate')}
                        error={errors.paymentDate?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi Chú
                    </label>
                    <textarea
                        {...register('note')}
                        rows={3}
                        placeholder="Ghi chú về công nợ..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </form>
        </Modal>
    );
};
