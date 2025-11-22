/**
 * Modern Sidebar Component - Complete Redesign
 * Clean, Professional, Unified Design
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { hasPageAccess as checkPageAccess } from '@/lib/permissionsConfig';
import { cn } from '@/lib/utils';
import {
    Home,
    Package,
    ClipboardList,
    Gift,
    Download,
    FileText,
    ArrowRightLeft,
    ShoppingCart,
    Files,
    BarChart3,
    Users,
    TrendingUp,
    Factory,
    Folder,
    History,
    FileEdit,
    HardDrive,
    Save,
    LogOut,
    Menu,
    X
} from 'lucide-react';

interface MenuItem {
    key: string;
    label: string;
    href: string;
    icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
    { key: 'dashboard', label: 'Trang chủ', href: '/dashboard', icon: <Home size={20} /> },
    { key: 'inventory', label: 'Tổng quan Kho', href: '/inventory', icon: <Package size={20} /> },
    { key: 'stock_details', label: 'Chi tiết Tồn kho', href: '/stock-details', icon: <ClipboardList size={20} /> },
    { key: 'products', label: 'Sản phẩm', href: '/products', icon: <Gift size={20} /> },
    { key: 'receipt', label: 'Nhập Kho', href: '/receipts', icon: <Download size={20} /> },
    { key: 'issue', label: 'Biên Bản Giao Nhận', href: '/issues', icon: <FileText size={20} /> },
    { key: 'transfer', label: 'Chuyển Kho', href: '/transfers', icon: <ArrowRightLeft size={20} /> },
    { key: 'order', label: 'Tạo Đơn hàng', href: '/orders', icon: <ShoppingCart size={20} /> },
    { key: 'management', label: 'Quản lý Chứng từ', href: '/management', icon: <Files size={20} /> },
    { key: 'reports', label: 'Báo cáo & Thống kê', href: '/reports', icon: <BarChart3 size={20} /> },
];

const adminMenuItems: MenuItem[] = [
    { key: 'admin', label: 'Quản lý Tài khoản', href: '/admin', icon: <Users size={20} /> },
    { key: 'admin-products', label: 'Quản Lý Số Lượng SP', href: '/admin/products', icon: <TrendingUp size={20} /> },
    { key: 'warehouses', label: 'Quản lý Kho', href: '/warehouses', icon: <Factory size={20} /> },
    { key: 'categories', label: 'Quản lý Danh mục', href: '/categories', icon: <Folder size={20} /> },
    { key: 'history', label: 'Lịch sử Hoạt động', href: '/history', icon: <History size={20} /> },
    { key: 'template-config', label: 'Cấu Hình Template PDF', href: '/template-config', icon: <FileEdit size={20} /> },
    { key: 'storage-config', label: 'Cấu Hình Đường Dẫn', href: '/storage-config', icon: <HardDrive size={20} /> },
    { key: 'backup', label: 'Quản Lý Backup', href: '/backup', icon: <Save size={20} /> },
];

interface MenuLinkProps {
    item: MenuItem;
    isActive: boolean;
    onClick?: () => void;
}

const MenuLink: React.FC<MenuLinkProps> = ({ item, isActive, onClick }) => {
    return (
        <Link
            href={item.href}
            prefetch={true}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
        >
            <span className="text-gray-500">{item.icon}</span>
            <span>{item.label}</span>
            {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            )}
        </Link>
    );
};

export const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const { filteredItems, filteredAdminItems, isAdmin, isAuthenticated } = useMemo(() => {
        if (!user) {
            return {
                filteredItems: [],
                filteredAdminItems: [],
                isAdmin: false,
                isAuthenticated: false,
            };
        }

        const pagePermissions = user.pagePermissions ?? {};
        const admin = user.role === 'ADMIN';

        return {
            filteredItems: menuItems.filter((item) =>
                checkPageAccess(pagePermissions, item.key, admin)
            ),
            filteredAdminItems: adminMenuItems.filter((item) =>
                checkPageAccess(pagePermissions, item.key, admin)
            ),
            isAdmin: admin,
            isAuthenticated: true,
        };
    }, [user]);

    if (!mounted || !isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out z-50',
                    'md:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">KW</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">KhoWeb</h1>
                                <p className="text-xs text-gray-500">v2.0</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-700 font-semibold text-sm">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        {/* Main Menu */}
                        {filteredItems.length > 0 && (
                            <div className="space-y-1">
                                {filteredItems.map((item) => (
                                    <MenuLink
                                        key={item.key}
                                        item={item}
                                        isActive={pathname === item.href}
                                        onClick={() => setIsOpen(false)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Admin Menu */}
                        {filteredAdminItems.length > 0 && (
                            <>
                                <div className="pt-4 pb-2">
                                    <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Quản trị
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {filteredAdminItems.map((item) => (
                                        <MenuLink
                                            key={item.key}
                                            item={item}
                                            isActive={pathname === item.href}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
