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

const userSchema = z.object({
    name: z.string().min(1, 'Tên người dùng là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
    role: z.enum(['ADMIN', 'USER']),
    permissions: z.array(z.string()).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    user?: any;
    onSuccess: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
    isOpen,
    onClose,
    user,
    onSuccess,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: user || {
            name: '',
            email: '',
            password: '',
            role: 'USER',
            permissions: [],
        },
    });

    React.useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                permissions: user.permissions ? Object.keys(JSON.parse(user.permissions || '{}')) : [],
            });
        } else {
            reset({
                name: '',
                email: '',
                password: '',
                role: 'USER',
                permissions: [],
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: UserFormData) => {
        try {
            const submitData: any = {
                name: data.name,
                email: data.email,
                role: data.role,
                permissions: JSON.stringify(
                    (data.permissions || []).reduce((acc: any, curr: string) => {
                        acc[curr] = { view: true, create: true, edit: true, delete: true };
                        return acc;
                    }, {})
                ),
            };

            // Only include password if it's provided
            if (data.password && data.password.trim() !== '') {
                submitData.password = data.password;
            }

            if (user) {
                await apiClient.put(`/users/${user.id}`, submitData);
                showToast('Cập nhật người dùng thành công', 'success');
            } else {
                if (!data.password) {
                    showToast('Vui lòng nhập mật khẩu', 'error');
                    return;
                }
                await apiClient.post('/users', submitData);
                showToast('Tạo người dùng thành công', 'success');
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
            title={user ? 'Sửa Người Dùng' : 'Thêm Người Dùng'}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
                        {user ? 'Cập Nhật' : 'Tạo Mới'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Người Dùng *
                    </label>
                    <Input
                        {...register('name')}
                        placeholder="Họ và tên..."
                        error={errors.name?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <Input
                        type="email"
                        {...register('email')}
                        placeholder="email@example.com"
                        error={errors.email?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật Khẩu {!user && '*'}
                    </label>
                    <Input
                        type="password"
                        {...register('password')}
                        placeholder={user ? 'Để trống nếu không đổi' : 'Nhập mật khẩu...'}
                        error={errors.password?.message}
                    />
                    {user && (
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Để trống nếu không muốn thay đổi mật khẩu
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vai Trò *
                    </label>
                    <select
                        {...register('role')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="USER">Người dùng</option>
                        <option value="ADMIN">Quản trị viên</option>
                    </select>
                    {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                    )}
                </div>

                {/* Permissions Section */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Phân quyền nhanh</h3>
                    <p className="text-xs text-gray-500 mb-3">Chọn các quyền cơ bản cho người dùng này (Full quyền). Để phân quyền chi tiết hơn, vui lòng sử dụng trang "Phân quyền chi tiết".</p>

                    <div className="grid grid-cols-2 gap-2">
                        {['products', 'orders', 'stock', 'reports', 'users'].map((resource) => (
                            <div key={resource} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`perm-${resource}`}
                                    value={resource}
                                    {...register('permissions')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`perm-${resource}`} className="ml-2 block text-sm text-gray-900 capitalize">
                                    {resource === 'products' ? 'Sản phẩm' :
                                        resource === 'orders' ? 'Đơn hàng' :
                                            resource === 'stock' ? 'Kho' :
                                                resource === 'reports' ? 'Báo cáo' : 'Người dùng'}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-md">
                    <p className="text-xs text-yellow-800">
                        ⚠️ <strong>Lưu ý:</strong> Quản trị viên có toàn quyền truy cập hệ thống
                    </p>
                </div>
            </form>
        </Modal>
    );
};
