'use client';

import React, { useEffect, useState } from 'react';

export default function StockDetailsPage() {
    const [stockDetails, setStockDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        productId: '',
        warehouseId: '',
    });
    const [products, setProducts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Use fetch which will use apiClient interceptor
            const [stockRes, productsRes, warehousesRes] = await Promise.all([
                fetch('/api/inventory/stock-overview'),
                fetch('/api/products'),
                fetch('/api/warehouses'),
            ]);

            if (!stockRes.ok || !productsRes.ok || !warehousesRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const stockData = await stockRes.json();
            const productsData = await productsRes.json();
            const warehousesData = await warehousesRes.json();

            // Stock overview returns array of products with stock info
            // We need to flatten this into stock items
            const stockItems: any[] = [];
            if (Array.isArray(stockData)) {
                stockData.forEach((product: any) => {
                    product.warehouses?.forEach((wh: any) => {
                        stockItems.push({
                            id: `${product.productId}-${wh.warehouseId}`,
                            Product: {
                                id: product.productId,
                                name: product.productName,
                                code: product.productCode,
                                unit: product.unit,
                            },
                            Warehouse: {
                                id: wh.warehouseId,
                                name: wh.warehouseName,
                            },
                            quantity: wh.quantity,
                            updatedAt: new Date(),
                        });
                    });
                });
            }

            setStockDetails(stockItems);
            setProducts(productsData.products || []);
            setWarehouses(warehousesData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStock = stockDetails.filter(item => {
        if (filters.productId && item.Product.id !== filters.productId) return false;
        if (filters.warehouseId && item.Warehouse.id !== filters.warehouseId) return false;
        return true;
    });

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết tồn kho</h1>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm</label>
                        <select
                            value={filters.productId}
                            onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
                            className="w-full rounded-md border-gray-300"
                        >
                            <option value="">Tất cả sản phẩm</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kho</label>
                        <select
                            value={filters.warehouseId}
                            onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
                            className="w-full rounded-md border-gray-300"
                        >
                            <option value="">Tất cả kho</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ productId: '', warehouseId: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn vị</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStock.length > 0 ? (
                            filteredStock.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.Product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.Warehouse.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-semibold ${item.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.Product.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.updatedAt).toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    Không có dữ liệu tồn kho
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
