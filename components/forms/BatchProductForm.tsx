/**
 * Batch Product Form Component
 * 
 * Allows adding multiple products at once
 * Migrated from OLD/src/public/js/products.js
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

interface BatchProductRow {
    id: number;
    name: string;
    categoryId: string;
    unit: string;
    costPrice: string;
    priceMin: string;
    priceMax: string;
    supplier: string;
    kgPerBag: string;
    vat: string;
    description: string;
}

interface BatchProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Array<{ id: string; name: string }>;
    onSuccess: () => void;
}

// Category to Unit mapping (from OLD)
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

export const BatchProductForm: React.FC<BatchProductFormProps> = ({
    isOpen,
    onClose,
    categories,
    onSuccess,
}) => {
    const [rows, setRows] = useState<BatchProductRow[]>([]);
    const [rowCounter, setRowCounter] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);

    useEffect(() => {
        if (isOpen && rows.length === 0) {
            // Initialize with 3 empty rows
            const initialRows: BatchProductRow[] = [];
            let newCounter = 0;
            for (let i = 0; i < 3; i++) {
                newCounter++;
                initialRows.push(createEmptyRow(newCounter));
            }
            setRows(initialRows);
            setRowCounter(newCounter);
        }
    }, [isOpen]);

    const createEmptyRow = (id: number): BatchProductRow => ({
        id,
        name: '',
        categoryId: '',
        unit: '',
        costPrice: '',
        priceMin: '',
        priceMax: '',
        supplier: '',
        kgPerBag: '',
        vat: '',
        description: '',
    });

    const handleAddRow = () => {
        setRowCounter((prev) => prev + 1);
        setRows([...rows, createEmptyRow(rowCounter + 1)]);
    };

    const handleDeleteRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleDuplicateRow = (id: number) => {
        const rowToDuplicate = rows.find((row) => row.id === id);
        if (rowToDuplicate) {
            setRowCounter((prev) => prev + 1);
            const newRow = {
                ...rowToDuplicate,
                id: rowCounter + 1,
                name: '', // Clear name so user can enter new name
            };
            const index = rows.findIndex((row) => row.id === id);
            const newRows = [...rows];
            newRows.splice(index + 1, 0, newRow);
            setRows(newRows);
        }
    };

    const handleCopyFromAbove = (id: number) => {
        const currentIndex = rows.findIndex((row) => row.id === id);
        if (currentIndex > 0) {
            const rowAbove = rows[currentIndex - 1];
            setRows(
                rows.map((row) => {
                    if (row.id === id) {
                        const updated = {
                            ...row,
                            categoryId: rowAbove.categoryId,
                            unit: rowAbove.unit,
                            costPrice: rowAbove.costPrice,
                            priceMin: rowAbove.priceMin,
                            priceMax: rowAbove.priceMax,
                            supplier: rowAbove.supplier,
                            kgPerBag: rowAbove.kgPerBag,
                            vat: rowAbove.vat,
                            description: rowAbove.description,
                            // Keep name unchanged so user can enter new name
                        };
                        // Auto-set unit when category changes (same logic as handleRowChange)
                        if (rowAbove.categoryId) {
                            const category = categories.find((c) => c.id === rowAbove.categoryId);
                            if (category) {
                                const defaultUnit = getDefaultUnitByCategory(category.name);
                                if (defaultUnit) {
                                    updated.unit = defaultUnit;
                                }
                            }
                        }
                        return updated;
                    }
                    return row;
                })
            );
        }
    };

    const handleClearAll = () => {
        setConfirmClearOpen(true);
    };

    const confirmClear = () => {
        setRows([]);
        setRowCounter(0);
        setConfirmClearOpen(false);
    };

    const handleRowChange = (id: number, field: keyof BatchProductRow, value: string) => {
        setRows(
            rows.map((row) => {
                if (row.id === id) {
                    const updated = { ...row, [field]: value };
                    // Auto-set unit when category changes
                    if (field === 'categoryId') {
                        const category = categories.find((c) => c.id === value);
                        if (category) {
                            const defaultUnit = getDefaultUnitByCategory(category.name);
                            if (defaultUnit) {
                                updated.unit = defaultUnit;
                            }
                        }
                    }
                    return updated;
                }
                return row;
            })
        );
    };

    const handleSubmit = async () => {
        if (rows.length === 0) {
            showToast('Vui lòng thêm ít nhất một sản phẩm!', 'warning');
            return;
        }

        const products: any[] = [];
        const errors: string[] = [];

        rows.forEach((row, index) => {
            const name = row.name.trim();
            const categoryId = row.categoryId;
            const unit = row.unit.trim().toUpperCase();

            if (!name && !categoryId && !unit) return; // Skip empty rows

            if (!name) {
                errors.push(`Dòng ${index + 1}: Thiếu tên sản phẩm`);
                return;
            }
            if (!categoryId) {
                errors.push(`Dòng ${index + 1}: Thiếu danh mục`);
                return;
            }
            if (!unit) {
                errors.push(`Dòng ${index + 1}: Thiếu đơn vị`);
                return;
            }

            const priceMin = parseFloat(row.priceMin) || 0;
            const priceMax = parseFloat(row.priceMax) || 0;
            if (priceMin && priceMax && priceMin > priceMax) {
                errors.push(`Dòng ${index + 1}: Giá bán tối thiểu không được lớn hơn giá tối đa`);
                return;
            }

            products.push({
                name,
                categoryId,
                unit,
                costPrice: row.costPrice ? parseFloat(row.costPrice) : 0,
                priceMin,
                priceMax,
                price: priceMin || 0,
                supplier: row.supplier.trim() || null,
                kgPerBag: row.kgPerBag ? parseFloat(row.kgPerBag) : 1.0,
                vat: row.vat ? parseFloat(row.vat) : 0,
                description: row.description.trim() || null,
            });
        });

        if (errors.length > 0) {
            showToast('Có lỗi trong dữ liệu:\n' + errors.join('\n'), 'error', 5000);
            return;
        }

        if (products.length === 0) {
            showToast('Vui lòng nhập ít nhất một sản phẩm hợp lệ!', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await apiClient.post('/products/batch', { products });
            showToast(`✅ Đã tạo thành công ${response.data.count} sản phẩm!`, 'success');
            onSuccess();
            handleClose();
        } catch (error: any) {
            showToast('Lỗi: ' + (error.response?.data?.error || 'Không thể tạo sản phẩm'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRows([]);
        setRowCounter(0);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Thêm Nhiều Sản phẩm" size="full">
            <div className="space-y-4">
                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800">
                        <i className="fas fa-info-circle mr-2"></i>
                        Bạn có thể thêm nhiều sản phẩm cùng lúc. Nhấn &quot;Thêm Dòng&quot; để thêm sản phẩm mới. Các
                        trường có dấu * là bắt buộc.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="text-sm text-gray-600">
                        <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
                        <strong>Lưu ý:</strong> Mã sản phẩm phải là duy nhất. Nếu trùng với sản phẩm đã có, sản phẩm đó sẽ bị bỏ qua.         </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAddRow} variant="secondary" size="sm">
                            <i className="fas fa-plus mr-2"></i>Thêm Dòng
                        </Button>
                        <Button onClick={handleClearAll} variant="secondary" size="sm">
                            <i className="fas fa-trash mr-2"></i>Xóa Tất Cả
                        </Button>
                    </div>
                </div>

                {/* Batch Table */}
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[40px]">
                                    #
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[200px]">
                                    Tên Sản phẩm *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[150px]">
                                    Danh mục *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[100px]">
                                    Đơn vị *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[120px]">
                                    Giá nhập
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[120px]">
                                    Giá bán từ
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[120px]">
                                    Giá bán đến
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[150px]">
                                    Nhà cung cấp
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[100px]">
                                    Quy cách KG
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[80px]">
                                    VAT %
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border border-gray-200 min-w-[150px]">
                                    Ghi chú
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border border-gray-200 min-w-[80px]">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {rows.map((row, index) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-center text-sm text-gray-600 border border-gray-200">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                                            placeholder="Tên sản phẩm"
                                            required
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <select
                                            value={row.categoryId}
                                            onChange={(e) => handleRowChange(row.id, 'categoryId', e.target.value)}
                                            required
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">-- Chọn --</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="text"
                                            value={row.unit}
                                            onChange={(e) => handleRowChange(row.id, 'unit', e.target.value)}
                                            placeholder="BAO, KG..."
                                            required
                                            list="unit-list"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <datalist id="unit-list">
                                            <option value="BAO" />
                                            <option value="KG" />
                                            <option value="CÁI" />
                                            <option value="BỘ" />
                                            <option value="CUỘN" />
                                            <option value="MÉT" />
                                            <option value="LÍT" />
                                        </datalist>
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="number"
                                            value={row.costPrice}
                                            onChange={(e) => handleRowChange(row.id, 'costPrice', e.target.value)}
                                            placeholder="0"
                                            step="1000"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="number"
                                            value={row.priceMin}
                                            onChange={(e) => handleRowChange(row.id, 'priceMin', e.target.value)}
                                            placeholder="0"
                                            step="1000"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="number"
                                            value={row.priceMax}
                                            onChange={(e) => handleRowChange(row.id, 'priceMax', e.target.value)}
                                            placeholder="0"
                                            step="1000"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="text"
                                            value={row.supplier}
                                            onChange={(e) => handleRowChange(row.id, 'supplier', e.target.value)}
                                            placeholder="Nhà cung cấp"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="number"
                                            value={row.kgPerBag}
                                            onChange={(e) => handleRowChange(row.id, 'kgPerBag', e.target.value)}
                                            placeholder="1.0"
                                            step="0.1"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="number"
                                            value={row.vat}
                                            onChange={(e) => handleRowChange(row.id, 'vat', e.target.value)}
                                            placeholder="0"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-200">
                                        <input
                                            type="text"
                                            value={row.description}
                                            onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                                            placeholder="Ghi chú"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center border border-gray-200">
                                        <div className="flex items-center justify-center gap-1">
                                            {index > 0 && (
                                                <button
                                                    onClick={() => handleCopyFromAbove(row.id)}
                                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                    title="Copy tất cả từ dòng trên (trừ tên)"
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDuplicateRow(row.id)}
                                                className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                title="Nhân đôi dòng này"
                                            >
                                                <i className="fas fa-clone"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRow(row.id)}
                                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                                title="Xóa dòng"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Badge */}
                {rows.length > 0 && (
                    <div className="flex justify-end">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {rows.length} sản phẩm
                        </span>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button onClick={handleClose} variant="secondary" disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rows.length === 0}>
                        {isSubmitting ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>Đang lưu...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save mr-2"></i>Lưu Tất Cả
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Confirm Clear All Modal */}
            <ConfirmModal
                isOpen={confirmClearOpen}
                onClose={() => setConfirmClearOpen(false)}
                onConfirm={confirmClear}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa tất cả các dòng?"
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />
        </Modal>
    );
};
