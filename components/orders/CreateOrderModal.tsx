import { createPortal } from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Search, User, MapPin, Phone, Edit2, Package, ChevronDown, Store } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { OrderReceiptTemplate } from '@/components/templates/OrderReceiptTemplate';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: string;
    code: string;
    name: string;
    unit: string;
    price: number;
    vat: number;
    description?: string;
    supplier?: string;
    stock?: number;
}

interface Warehouse {
    id: string;
    name: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
}

interface OrderItem {
    id: string;
    productId?: string;
    productName: string;
    unit: string;
    quantity: number;
    price: number;
    vat: number;
    isCustom: boolean;
    isEditing: boolean;
    searchTerm?: string;
}

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');

    // Customer info
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [hasVAT, setHasVAT] = useState(false);

    // Customer Search
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
    const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
    const customerSearchRef = useRef<HTMLDivElement>(null);

    // Order items
    const [items, setItems] = useState<OrderItem[]>([]);

    // PDF Generation State
    const [tempOrder, setTempOrder] = useState<any>(null);
    const [companyConfig, setCompanyConfig] = useState<any>({});
    const pdfRef = useRef<HTMLDivElement>(null);

    // Portal Dropdown State
    const [activeSearchRect, setActiveSearchRect] = useState<{ top: number, left: number, width: number } | null>(null);
    const [activeSearchItemId, setActiveSearchItemId] = useState<string | null>(null);

    const updateSearchRect = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        setActiveSearchRect({
            top: rect.bottom,
            left: rect.left,
            width: rect.width
        });
    };

    // Close portal dropdown on scroll/resize
    useEffect(() => {
        const handleScroll = () => {
            if (activeSearchItemId) setActiveSearchItemId(null);
        };
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [activeSearchItemId]);


    // ---------------------------------------------------------------------
    // Data fetching
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (isOpen) {
            fetchWarehouses();
            fetchCustomers();
            apiClient.get('/storage-config').then(res => setCompanyConfig(res.data)).catch(err => console.error(err));
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && selectedWarehouse) {
            fetchProducts();
        }
    }, [isOpen, selectedWarehouse]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
                setShowCustomerSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await apiClient.get('/warehouses');
            setWarehouses(response.data);
            if (response.data.length > 0 && !selectedWarehouse) {
                setSelectedWarehouse(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            // request a larger limit for client‑side searching
            const response = await apiClient.get('/products?limit=1000');
            const productsData: Product[] = response.data?.products || [];

            // enrich each product with stock for the selected warehouse
            const enriched = await Promise.all(
                productsData.map(async (product) => {
                    try {
                        const stockRes = await apiClient.get(
                            `/products/${product.id}/stock?warehouseId=${selectedWarehouse}`
                        );
                        return { ...product, stock: stockRes.data.totalStock || 0 };
                    } catch {
                        return { ...product, stock: 0 };
                    }
                })
            );
            setProducts(enriched);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await apiClient.get('/customers?limit=1000');
            setAllCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    // Helper to remove accents
    const removeAccents = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    };

    const smartMatchCustomer = (term: string, customer: Customer) => {
        const termNormalized = removeAccents(term.toLowerCase());
        const nameNormalized = removeAccents(customer.name.toLowerCase());
        const phoneNormalized = customer.phone ? removeAccents(customer.phone.toLowerCase()) : '';

        const words = termNormalized.trim().split(/\s+/);
        return words.every(w => nameNormalized.includes(w) || phoneNormalized.includes(w));
    };

    const searchCustomers = (term: string) => {
        if (!term.trim()) {
            setCustomerSuggestions([]);
            return;
        }
        const filtered = allCustomers.filter(c => smartMatchCustomer(term, c)).slice(0, 10);
        setCustomerSuggestions(filtered);
        setShowCustomerSuggestions(true);
    };

    // ---------------------------------------------------------------------
    // Helper functions
    // ---------------------------------------------------------------------
    const generateOrderCode = () => {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD-${dateStr}-${random}`;
    };

    const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomerName(value);
        searchCustomers(value);
    };

    const handleSelectCustomer = (customer: Customer) => {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone || '');
        setCustomerAddress(customer.address || '');
        setShowCustomerSuggestions(false);
    };

    const handleAddProductRow = () => {
        const newItem: OrderItem = {
            id: `new-${Date.now()}`,
            productName: '',
            unit: '',
            quantity: 1,
            price: 0,
            vat: 0,
            isCustom: false,
            isEditing: true,
            searchTerm: ''
        };
        setItems([...items, newItem]);
    };

    const handleAddCustomProductRow = () => {
        const newItem: OrderItem = {
            id: `custom-${Date.now()}`,
            productName: '',
            unit: '',
            quantity: 1,
            price: 0,
            vat: 0,
            isCustom: true,
            isEditing: true
        };
        setItems([...items, newItem]);
    };

    const handleSelectProduct = (itemId: string, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;
        setItems(
            items.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        productId: product.id,
                        productName: product.name,
                        unit: product.unit,
                        price: product.price,
                        vat: product.vat,
                        isEditing: false,
                        searchTerm: ''
                    }
                    : item
            )
        );
    };

    const handleEditProduct = (itemId: string) => {
        setItems(items.map(item =>
            item.id === itemId
                ? { ...item, isEditing: true, searchTerm: item.productName }
                : item
        ));
    };


    const handleUpdateItem = (itemId: string, field: keyof OrderItem, value: any) => {
        setItems(
            items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
        );
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const calculateItemTotal = (item: OrderItem) => {
        const base = item.quantity * item.price;
        return hasVAT ? base * (1 + item.vat / 100) : base;
    };

    const calculateTotal = () => items.reduce((sum, i) => sum + calculateItemTotal(i), 0);

    const smartMatch = (term: string, product: Product) => {
        const words = term.toLowerCase().trim().split(/\s+/);
        const target = `${product.name} ${product.code}`.toLowerCase();
        return words.every((w) => target.includes(w));
    };

    const getFilteredProducts = (term: string) => {
        if (!term) return [];
        return products.filter((p) => smartMatch(term, p));
    };

    const generateAndSavePDF = async (order: any) => {
        if (!pdfRef.current) return;
        try {
            const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const pdfBlob = pdf.output('blob');

            const formData = new FormData();
            formData.append('file', pdfBlob);
            formData.append('filename', `phieu-thu-${order.code}.pdf`);

            await apiClient.post('/orders/save-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    const handleSave = async (status: string = 'COMPLETED') => {
        if (!customerName || !customerPhone || !customerAddress) {
            alert('Vui lòng điền đầy đủ thông tin khách hàng');
            return;
        }
        const validItems = items.filter((i) => !i.isEditing && i.productName);
        if (validItems.length === 0) {
            alert('Vui lòng thêm ít nhất một sản phẩm');
            return;
        }
        try {
            setSaving(true);
            const orderData = {
                code: generateOrderCode(),
                date: new Date().toISOString(),
                customer: customerName,
                phone: customerPhone,
                address: customerAddress,
                hasVAT,
                totalAmount: calculateTotal(),
                warehouseId: selectedWarehouse,
                status,
                items: validItems.map((i) => ({
                    productId: i.productId || null,
                    productName: i.productName,
                    quantity: i.quantity,
                    price: i.price,
                    unit: i.unit,
                    amount: calculateItemTotal(i)
                }))
            };
            const response = await apiClient.post('/orders', orderData);
            const createdOrder = response.data;

            // Prepare temp order for PDF
            const fullOrder = {
                ...createdOrder,
                items: validItems.map(i => ({
                    name: i.productName,
                    unit: i.unit,
                    quantity: i.quantity,
                    price: i.price,
                    total: calculateItemTotal(i)
                })),
                customer: customerName,
                address: customerAddress,
                total: calculateTotal()
            };

            setTempOrder(fullOrder);

            // Wait for render
            setTimeout(async () => {
                await generateAndSavePDF(fullOrder);
                alert(status === 'DRAFT' ? 'Đã lưu nháp đơn hàng' : 'Tạo đơn hàng thành công');
                handleClose();
                onSuccess();
            }, 500);

        } catch (error: any) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.error || 'Lỗi khi tạo đơn hàng');
            setSaving(false);
        }
    };

    const handleClose = () => {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setHasVAT(false);
        setItems([]);
        setCustomerSuggestions([]);
        setShowCustomerSuggestions(false);
        setTempOrder(null);
        onClose();
    };

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tạo Đơn Hàng Mới" size="full">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-2xl p-6 space-y-6">
                {/* Compact Header Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Warehouse - Col 3 */}
                        <div className="col-span-12 md:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Kho Xuất <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Store className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    {warehouses.map((wh) => (
                                        <option key={wh.id} value={wh.id}>
                                            {wh.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Customer Name - Col 3 */}
                        <div className="col-span-12 md:col-span-3 relative" ref={customerSearchRef}>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Khách hàng <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={handleCustomerNameChange}
                                    onFocus={() => customerName && searchCustomers(customerName)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tên khách hàng"
                                />
                            </div>
                            {/* Customer Suggestions */}
                            {showCustomerSuggestions && customerSuggestions.length > 0 && (
                                <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {customerSuggestions.map((customer) => (
                                        <div
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                        >
                                            <div className="font-medium text-sm text-gray-900">{customer.name}</div>
                                            <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                                                {customer.phone && <span>{customer.phone}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Phone - Col 2 */}
                        <div className="col-span-12 md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                SĐT <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Số điện thoại"
                                />
                            </div>
                        </div>

                        {/* Address - Col 4 */}
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Địa chỉ"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasVAT}
                                onChange={(e) => setHasVAT(e.target.checked)}
                                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Xuất hóa đơn VAT
                            </span>
                        </label>
                    </div>
                </div>

                {/* Products Section */}
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                        <h3 className="font-semibold text-gray-900">Sản Phẩm</h3>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" size="sm" onClick={handleAddProductRow} className="flex-1 md:flex-none">
                                <Plus className="w-4 h-4 mr-1" /> Thêm SP
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleAddCustomProductRow} className="flex-1 md:flex-none">
                                <Plus className="w-4 h-4 mr-1" /> SP Tùy Chỉnh
                            </Button>
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-x-auto overflow-y-visible">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[35%]">
                                            Sản phẩm
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[10%]">
                                            ĐVT
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-[10%]">
                                            SL
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-[15%]">
                                            Đơn giá
                                        </th>
                                        {hasVAT && (
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-[10%]">
                                                VAT(%)
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-[15%]">
                                            Thành tiền
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[5%]">
                                            Xóa
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 relative">
                                            <td className="px-4 py-3">
                                                {item.isEditing && !item.isCustom ? (
                                                    <div className="relative group">
                                                        <div className="relative">
                                                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={item.searchTerm || ''}
                                                                onChange={(e) => {
                                                                    handleUpdateItem(item.id, 'searchTerm', e.target.value);
                                                                    updateSearchRect(e.target);
                                                                    setActiveSearchItemId(item.id);
                                                                }}
                                                                onFocus={(e) => {
                                                                    updateSearchRect(e.target);
                                                                    setActiveSearchItemId(item.id);
                                                                }}
                                                                placeholder="Tìm sản phẩm..."
                                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                ) : item.isCustom ? (
                                                    <input
                                                        type="text"
                                                        value={item.productName}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                item.id,
                                                                'productName',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Tên sản phẩm"
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div
                                                        className="group flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors -ml-1.5"
                                                        onClick={() => handleEditProduct(item.id)}
                                                        title="Nhấn để đổi sản phẩm"
                                                    >
                                                        <div className="text-sm text-gray-900 font-medium">{item.productName}</div>
                                                        <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.isEditing && item.isCustom ? (
                                                    <input
                                                        type="text"
                                                        value={item.unit}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                item.id,
                                                                'unit',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="ĐVT"
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                    />
                                                ) : (
                                                    <div className="text-sm text-gray-600">{item.unit}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleUpdateItem(
                                                            item.id,
                                                            'quantity',
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.price}
                                                    onChange={(e) =>
                                                        handleUpdateItem(
                                                            item.id,
                                                            'price',
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                                />
                                            </td>
                                            {hasVAT && (
                                                <td className="px-4 py-3 text-right">
                                                    {item.isEditing && item.isCustom ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={item.vat}
                                                            onChange={(e) =>
                                                                handleUpdateItem(
                                                                    item.id,
                                                                    'vat',
                                                                    parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-gray-600">{item.vat}%</div>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-right">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {calculateItemTotal(item).toLocaleString('vi-VN')} đ
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={hasVAT ? 5 : 4} className="px-4 py-3 text-right font-semibold text-gray-900">
                                            Tổng cộng:
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">
                                            {calculateTotal().toLocaleString('vi-VN')} đ
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {items.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>Chưa có sản phẩm nào</p>
                            <p className="text-sm mt-1">Click "Thêm Sản Phẩm" hoặc "Sản Phẩm Tùy Chỉnh" để bắt đầu</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={handleClose} disabled={saving}>
                        Hủy
                    </Button>
                    <Button variant="secondary" onClick={() => handleSave('DRAFT')} disabled={saving}>
                        Lưu Nháp
                    </Button>
                    <Button onClick={() => handleSave('COMPLETED')} disabled={saving}>
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang lưu...
                            </>
                        ) : (
                            'Lưu Đơn Hàng'
                        )}
                    </Button>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
                {tempOrder && <OrderReceiptTemplate ref={pdfRef} order={tempOrder} config={companyConfig} />}
            </div>

            {/* Portal Dropdown */}
            {activeSearchItemId && activeSearchRect && (
                createPortal(
                    <div
                        className="fixed z-[9999]"
                        style={{
                            top: activeSearchRect.top + 5,
                            left: activeSearchRect.left,
                            width: Math.max(activeSearchRect.width, 400),
                        }}
                    >
                        <AnimatePresence>
                            {(() => {
                                const item = items.find(i => i.id === activeSearchItemId);
                                if (!item || !item.searchTerm) return null;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className="bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto ring-1 ring-black ring-opacity-5"
                                    >
                                        <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Gợi ý sản phẩm
                                        </div>
                                        {getFilteredProducts(item.searchTerm).map((product) => (
                                            <motion.div
                                                key={product.id}
                                                layoutId={`product-${product.id}`}
                                                onClick={() => {
                                                    handleSelectProduct(item.id, product.id);
                                                    setActiveSearchItemId(null);
                                                }}
                                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors group/item"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 pr-2">
                                                        <div className="font-medium text-sm text-gray-900 group-hover/item:text-blue-700 transition-colors">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-1 items-center">
                                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">{product.code}</span>
                                                            {product.supplier && (
                                                                <span className="text-gray-400">• {product.supplier}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="font-semibold text-blue-600 text-sm">
                                                            {product.price.toLocaleString('vi-VN')} đ
                                                        </span>
                                                        <span
                                                            className={`text-xs px-1.5 py-0.5 rounded-full mt-1 ${(product.stock || 0) > 0
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                                }`}
                                                        >
                                                            Tồn: {product.stock || 0} {product.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {getFilteredProducts(item.searchTerm).length === 0 && (
                                            <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                                                <Package className="w-8 h-8 text-gray-300 mb-2" />
                                                <span className="text-sm">Không tìm thấy sản phẩm nào</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </div>,
                    document.body
                )
            )}
        </Modal>
    );
}
