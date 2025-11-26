import React, { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import apiClient from '@/lib/api';

interface Product {
    id: string;
    code: string;
    name: string;
    unit: string;
    price: number;
    description?: string;
    manufacturer?: string;
    stock?: number;
}

interface ProductSelectorProps {
    onSelect: (product: Product, quantity: number) => void;
    hasVAT: boolean;
}

export default function ProductSelector({ onSelect, hasVAT }: ProductSelectorProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/products');
            const productsData = response.data || [];

            // Fetch stock for each product
            const productsWithStock = await Promise.all(
                productsData.map(async (product: Product) => {
                    try {
                        const stockResponse = await apiClient.get(`/products/${product.id}/stock`);
                        return {
                            ...product,
                            stock: stockResponse.data.totalStock || 0
                        };
                    } catch {
                        return { ...product, stock: 0 };
                    }
                })
            );

            setProducts(productsWithStock);
            setFilteredProducts(productsWithStock);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
    };

    const handleAddProduct = () => {
        if (selectedProduct && quantity > 0) {
            onSelect(selectedProduct, quantity);
            setSelectedProduct(null);
            setQuantity(1);
            setSearchTerm('');
        }
    };

    const calculatePrice = (price: number) => {
        return hasVAT ? price * 1.1 : price;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Product List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Không tìm thấy sản phẩm</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedProduct?.id === product.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {product.description && (
                                            <p className="line-clamp-1">{product.description}</p>
                                        )}
                                        {product.manufacturer && (
                                            <p className="text-gray-500">NSX: {product.manufacturer}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 text-right">
                                    <div className="font-semibold text-blue-600">
                                        {calculatePrice(product.price).toLocaleString('vi-VN')} đ
                                    </div>
                                    <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${(product.stock || 0) > 0
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        Tồn: {product.stock || 0} {product.unit}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Selected Product Actions */}
            {selectedProduct && (
                <div className="border-t pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3">
                            Đã chọn: {selectedProduct.name}
                        </h4>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số lượng
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedProduct.stock || 999999}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleAddProduct}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Thêm
                            </button>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Thành tiền: <span className="font-semibold text-blue-600">
                                {(calculatePrice(selectedProduct.price) * quantity).toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
