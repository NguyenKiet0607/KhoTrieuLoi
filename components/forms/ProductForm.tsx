/**
 * Product Form Component
 * 
 * NEW VERSION: React Hook Form + Zod validation
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

// Category to Unit mapping
const CATEGORY_UNIT_MAP: Record<string, string> = {
    'HẠT INOX': 'BAO',
    'HẠT BI THÉP': 'BAO',
    'HẠT THÉP ĐA CẠNH': 'BAO',
    'OXIT NHÔM TRẮNG': 'BAO',
    'OXIT NHÔM NÂU': 'BAO',
    'HẠT THỦY TINH': 'BAO',
    'CÁT THẠCH ANH': 'BAO',
    'HẠT NHỰA': 'BAO',
};

const getDefaultUnitByCategory = (categoryName: string): string => {
    if (!categoryName) return '';
    if (CATEGORY_UNIT_MAP[categoryName]) return CATEGORY_UNIT_MAP[categoryName];
    const upperName = categoryName.toUpperCase();
    for (const [key, value] of Object.entries(CATEGORY_UNIT_MAP)) {
        if (upperName.includes(key) || key.includes(upperName)) return value;
    }
    if (upperName.includes('HẠT') || upperName.includes('CÁT') || upperName.includes('OXIT')) {
        return 'BAO';
    }
    return '';
};

const productSchema = z.object({
    code: z.string().optional(),
    name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
    description: z.string().optional(),
    categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
    unit: z.string().min(1, 'Đơn vị là bắt buộc'),
    price: z.number().min(0, 'Giá phải >= 0'),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    supplier: z.string().optional(),
    kgPerBag: z.preprocess(
        (val) => {
            if (val === '' || val === null || val === undefined || isNaN(Number(val))) {
                return null;
            }
            const num = Number(val);
            return num === 0 ? null : num; // 0 nghĩa là không có quy đổi
        },
        z.union([
            z.number().min(0.1, 'Nếu có, số KG phải >= 0.1'),
            z.null(),
        ]).optional()
    ),
    invoiceQuantity: z.number().int().min(0).default(0),
    vat: z.number().min(0).max(100).default(0),
    isUnlimited: z.boolean().default(false),
}).refine((data) => {
    if (data.priceMin && data.priceMax && data.priceMin > data.priceMax) {
        return false;
    }
    return true;
}, {
    message: 'Giá bán tối thiểu không được lớn hơn giá tối đa',
    path: ['priceMax'],
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any;
    categories: Array<{ id: string; name: string }>;
    products?: Array<{ id: string; supplier?: string }>;
    onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    isOpen,
    onClose,
    product,
    categories,
    products = [],
    onSuccess,
}) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [isSubmittingState, setIsSubmittingState] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setValue,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            categoryId: '',
            unit: '',
            price: 0,
            priceMin: 0,
            priceMax: 0,
            costPrice: 0,
            supplier: '',
            kgPerBag: null,
            invoiceQuantity: 0,
            vat: 0,
            isUnlimited: false,
        },
    });

    const categoryId = watch('categoryId');

    // Get unique suppliers from products
    const suppliers = Array.from(new Set(products.map((p) => p.supplier).filter(Boolean))) as string[];


    useEffect(() => {
        if (product) {
            const productFields: (keyof ProductFormData)[] = [
                'code',
                'name',
                'description',
                'categoryId',
                'unit',
                'price',
                'priceMin',
                'priceMax',
                'costPrice',
                'supplier',
                'kgPerBag',
                'invoiceQuantity',
                'vat',
                'isUnlimited',
            ];
            productFields.forEach((key) => {
                if (key in product && product[key] !== undefined) {
                    // Show empty string for kgPerBag if it's 0 (meaning no conversion)
                    if (key === 'kgPerBag' && (product[key] === 0 || product[key] === null)) {
                        setValue(key, null);
                    } else {
                        setValue(key, product[key]);
                    }
                }
            });
            setSelectedCategoryId(product.categoryId);
        } else {
            reset();
            setSelectedCategoryId('');
            // Auto-generate code if not editing
            if (!product) {
                setValue('code', `AUTO-${Date.now()}`);
            }
        }
    }, [product, setValue, reset]);

    // Auto-fill unit when category changes
    useEffect(() => {
        if (categoryId && !product) {
            const selectedCategory = categories.find((cat) => cat.id === categoryId);
            if (selectedCategory) {
                const defaultUnit = getDefaultUnitByCategory(selectedCategory.name);
                if (defaultUnit) {
                    setValue('unit', defaultUnit);
                }
            }
        }
    }, [categoryId, categories, product, setValue]);

    const onSubmit = async (data: ProductFormData) => {
        // Chặn double-click: nếu đang submit thì return ngay
        if (isSubmittingState) {
            return;
        }

        setIsSubmittingState(true);
        try {
            // Auto-generate code if not provided
            const submitData: any = {
                ...data,
                code: data.code || `AUTO-${Date.now()}`,
                price: data.priceMin || data.price || 0,
            };

            // Convert null/undefined kgPerBag to 0 (no conversion)
            if (submitData.kgPerBag === null || submitData.kgPerBag === undefined) {
                submitData.kgPerBag = 0;
            }

            if (product) {
                await apiClient.put(`/products/${product.id}`, submitData);
            } else {
                await apiClient.post('/products', submitData);
            }
            onSuccess();
            onClose();
            reset();
            setSelectedCategoryId('');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
        } finally {
            setIsSubmittingState(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
            size="full"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSubmittingState}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmittingState} disabled={isSubmittingState}>
                        {product ? 'Cập Nhật' : 'Tạo Mới'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã Sản phẩm (Tự động)
                    </label>
                    <Input
                        {...register('code')}
                        placeholder="Sẽ tự động tạo"
                        disabled
                        error={errors.code?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Sản phẩm *
                    </label>
                    <Input
                        {...register('name')}
                        error={errors.name?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Danh mục *
                    </label>
                    <select
                        {...register('categoryId')}
                        onChange={(e) => {
                            setSelectedCategoryId(e.target.value);
                            register('categoryId').onChange(e);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={!categories || categories.length === 0}
                    >
                        <option value="">
                            {!categories || categories.length === 0
                                ? '-- Chưa có danh mục. Vui lòng tạo danh mục trước --'
                                : '-- Chọn danh mục --'}
                        </option>
                        {categories && categories.length > 0 ? (
                            categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))
                        ) : null}
                    </select>
                    {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                    )}
                    {(!categories || categories.length === 0) && (
                        <p className="mt-1 text-sm text-amber-600">
                            <i className="fas fa-exclamation-triangle mr-1"></i>
                            Chưa có danh mục nào. Vui lòng tạo danh mục trước khi thêm sản phẩm.
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn vị tính *
                    </label>
                    <Input
                        {...register('unit')}
                        list="unit-list"
                        placeholder="VD: BAO, KG, CÁI, BỘ..."
                        autoComplete="off"
                        error={errors.unit?.message}
                    />
                    <datalist id="unit-list">
                        <option value="BAO">BAO</option>
                        <option value="KG">KG</option>
                        <option value="CÁI">CÁI</option>
                        <option value="BỘ">BỘ</option>
                        <option value="CUỘN">CUỘN</option>
                        <option value="MÉT">MÉT</option>
                        <option value="LÍT">LÍT</option>
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá nhập (đ)
                    </label>
                    <Input
                        type="number"
                        step="1000"
                        placeholder="Giá vốn/giá mua"
                        {...register('costPrice', { valueAsNumber: true })}
                        error={errors.costPrice?.message}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Khoảng Giá Bán (đ) *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Từ</label>
                            <Input
                                type="number"
                                step="1000"
                                placeholder="700000"
                                min="0"
                                {...register('priceMin', { valueAsNumber: true })}
                                error={errors.priceMin?.message}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Đến</label>
                            <Input
                                type="number"
                                step="1000"
                                placeholder="800000"
                                min="0"
                                {...register('priceMax', { valueAsNumber: true })}
                                error={errors.priceMax?.message}
                            />
                        </div>
                    </div>
                    <small className="text-xs text-gray-500 block">
                        💡 Nhập khoảng giá có thể bán (VD: 700k - 800k/bao)
                    </small>
                    {errors.priceMax && (
                        <p className="mt-1 text-sm text-red-600">{errors.priceMax.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nhà cung cấp/Xuất xứ
                    </label>
                    <Input
                        {...register('supplier')}
                        list="supplier-list"
                        placeholder="VD: Sinto-Đài Loan, Yannu, TQ..."
                        autoComplete="off"
                        error={errors.supplier?.message}
                    />
                    <datalist id="supplier-list">
                        {suppliers.map((supplier) => (
                            <option key={supplier} value={supplier} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Thông tin bổ sung về sản phẩm..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quy đổi KG (nếu có)
                    </label>
                    <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="25.0 (để trống nếu không cần)"
                        {...register('kgPerBag', {
                            valueAsNumber: true,
                            setValueAs: (value) => value === '' ? null : (isNaN(Number(value)) ? null : Number(value))
                        })}
                        error={errors.kgPerBag?.message}
                    />
                    <small className="text-xs text-gray-500 mt-1 block">
                        💡 Để trống nếu sản phẩm không cần quy đổi KG
                    </small>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thuế VAT (%)
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="10"
                        {...register('vat', { valueAsNumber: true })}
                        error={errors.vat?.message}
                    />
                </div>

                {/* Unlimited Quantity - Only Admin can edit */}
                <div className="border-t pt-4">
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="isUnlimited"
                            {...register('isUnlimited')}
                            disabled={!isAdmin || (product?.isUnlimited && !isAdmin)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <label htmlFor="isUnlimited" className="text-sm font-medium text-gray-700">
                            Số lượng vô hạn
                        </label>
                    </div>
                    {!isAdmin && product?.isUnlimited && (
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            ⚠️ Chỉ admin mới có thể chỉnh sửa sản phẩm vô hạn
                        </p>
                    )}
                    {isAdmin && (
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            💡 Khi bật, sản phẩm này sẽ có số lượng vô hạn và không bị trừ tồn kho
                        </p>
                    )}
                </div>
            </form>
        </Modal>
    );
};
