/**
 * Permissions Configuration
 * 
 * NEW VERSION: Updated for Next.js with TypeScript
 */

export interface PagePermission {
    key: string;
    name: string;
    path: string;
    buttons?: ButtonPermission[];
}

export interface ButtonPermission {
    key: string;
    name: string;
    selector: string; // CSS selector or ID of button
}

// Định nghĩa tất cả các trang và button
export const PAGE_PERMISSIONS: Record<string, PagePermission> = {
    dashboard: {
        key: 'dashboard',
        name: 'Trang chủ / Dashboard',
        path: '/dashboard',
        buttons: [],
    },
    inventory: {
        key: 'inventory',
        name: 'Tổng quan Kho',
        path: '/inventory',
        buttons: [],
    },
    stock_details: {
        key: 'stock_details',
        name: 'Chi tiết Tồn kho',
        path: '/stock-details',
        buttons: [],
    },
    products: {
        key: 'products',
        name: 'Quản lý Sản phẩm',
        path: '/products',
        buttons: [
            { key: 'add_product', name: 'Thêm Sản phẩm', selector: '#add-product-btn' },
            { key: 'edit_product', name: 'Sửa Sản phẩm', selector: '.edit-btn' },
            { key: 'delete_product', name: 'Xóa Sản phẩm', selector: '.delete-btn' },
            { key: 'bundle_product', name: 'Quản lý Bundle', selector: '.bundle-btn' },
            { key: 'delete_bundle', name: 'Xóa Bundle', selector: '.delete-bundle-btn' },
        ],
    },
    receipt: {
        key: 'receipt',
        name: 'Nhập Kho',
        path: '/receipt',
        buttons: [
            { key: 'add_item', name: 'Thêm Sản phẩm', selector: '#add-item-btn' },
            { key: 'save_draft', name: 'Lưu Nháp', selector: '#save-draft-btn' },
            { key: 'submit', name: 'Hoàn Thành', selector: 'form#receipt-form button[type="submit"]' },
            { key: 'delete_item', name: 'Xóa Item', selector: '.btn-delete' },
            { key: 'copy_item', name: 'Nhân bản Item', selector: '.btn-copy' },
        ],
    },
    issue: {
        key: 'issue',
        name: 'Biên Bản Giao Nhận',
        path: '/issue',
        buttons: [
            { key: 'create_hang_hoa', name: 'Tạo Biên Bản Hàng Hóa', selector: '#create-hang-hoa-btn' },
            { key: 'create_chanh_xe', name: 'Tạo Biên Bản Chành Xe', selector: '#create-chanh-xe-btn' },
            { key: 'submit', name: 'Xác nhận', selector: '#submit-chanh-xe-btn' },
        ],
    },
    transfer: {
        key: 'transfer',
        name: 'Chuyển Kho',
        path: '/transfer',
        buttons: [
            { key: 'add_item', name: 'Thêm Sản phẩm', selector: '#add-item-btn' },
            { key: 'save_draft', name: 'Lưu Nháp', selector: '#save-draft-btn' },
            { key: 'submit', name: 'Hoàn Thành', selector: 'form#transfer-form button[type="submit"]' },
            { key: 'delete_item', name: 'Xóa Item', selector: '.btn-delete' },
            { key: 'copy_item', name: 'Nhân bản Item', selector: '.btn-copy' },
        ],
    },
    order: {
        key: 'order',
        name: 'Tạo Đơn hàng',
        path: '/orders',
        buttons: [
            { key: 'add_item', name: 'Thêm Sản phẩm', selector: '#add-item-btn' },
            { key: 'add_custom_item', name: 'Thêm SP Tùy chỉnh', selector: '#add-custom-item-btn' },
            { key: 'save_draft', name: 'Lưu Nháp', selector: '#save-draft-btn' },
            { key: 'submit', name: 'Hoàn Thành', selector: 'form#order-form button[type="submit"]' },
            { key: 'delete_item', name: 'Xóa Item', selector: '.btn-delete' },
            { key: 'copy_item', name: 'Nhân bản Item', selector: '.btn-copy' },
        ],
    },
    management: {
        key: 'management',
        name: 'Quản lý Chứng từ',
        path: '/management',
        buttons: [
            { key: 'view', name: 'Xem', selector: '.view-btn' },
            { key: 'edit', name: 'Sửa', selector: '.edit-btn' },
            { key: 'delete', name: 'Xóa', selector: '.delete-btn' },
            { key: 'print', name: 'In', selector: '.print-btn' },
        ],
    },
    reports: {
        key: 'reports',
        name: 'Báo cáo & Thống kê',
        path: '/reports',
        buttons: [
            { key: 'export', name: 'Xuất Excel', selector: '.export-btn' },
            { key: 'print', name: 'In báo cáo', selector: '.print-btn' },
        ],
    },
    // Admin pages - mặc định user không được vào
    admin: {
        key: 'admin',
        name: 'Quản lý Tài khoản',
        path: '/admin',
        buttons: [
            { key: 'create_user', name: 'Tạo User', selector: '#create-user-btn, button:has-text("Tạo mới")' },
            { key: 'edit_user', name: 'Sửa User', selector: '.edit-user-btn, button:has-text("Sửa")' },
            { key: 'delete_user', name: 'Xóa User', selector: '.delete-user-btn, button:has-text("Xóa")' },
            { key: 'manage_permissions', name: 'Quản lý Phân quyền', selector: '.manage-permissions-btn, button:has-text("Quyền")' },
            { key: 'change_password', name: 'Đổi Mật khẩu', selector: 'button:has-text("Mật khẩu")' },
        ],
    },
    warehouses: {
        key: 'warehouses',
        name: 'Quản lý Kho',
        path: '/warehouses',
        buttons: [
            { key: 'add_warehouse', name: 'Thêm Kho', selector: '#add-warehouse-btn' },
            { key: 'edit_warehouse', name: 'Sửa Kho', selector: '.edit-warehouse-btn' },
            { key: 'delete_warehouse', name: 'Xóa Kho', selector: '.delete-warehouse-btn' },
        ],
    },
    categories: {
        key: 'categories',
        name: 'Quản lý Danh mục',
        path: '/categories',
        buttons: [
            { key: 'add_category', name: 'Thêm Danh mục', selector: '#add-category-btn' },
            { key: 'edit_category', name: 'Sửa Danh mục', selector: '.edit-category-btn' },
            { key: 'delete_category', name: 'Xóa Danh mục', selector: '.delete-category-btn' },
        ],
    },
    history: {
        key: 'history',
        name: 'Lịch sử Hoạt động',
        path: '/history',
        buttons: [
            { key: 'export', name: 'Xuất Excel', selector: '.export-btn' },
            { key: 'filter', name: 'Lọc', selector: '.filter-btn' },
            { key: 'clear_history', name: 'Xóa Lịch Sử', selector: 'button:has-text("Xóa Lịch Sử")' },
        ],
    },
    backup: {
        key: 'backup',
        name: 'Quản Lý Backup',
        path: '/backup',
        buttons: [
            { key: 'create_backup', name: 'Tạo Backup', selector: 'button:has-text("Tạo Backup Ngay")' },
            { key: 'download_backup', name: 'Download Backup', selector: '.download-btn, button:has-text("Download")' },
            { key: 'restore_backup', name: 'Restore Backup', selector: 'button:has-text("Restore")' },
            { key: 'delete_backup', name: 'Xóa Backup', selector: 'button:has-text("Xóa")' },
            { key: 'clear_data', name: 'Xóa Toàn Bộ Dữ Liệu', selector: 'button:has-text("Xóa Toàn Bộ Dữ Liệu")' },
        ],
    },
    'storage-config': {
        key: 'storage-config',
        name: 'Cấu Hình Đường Dẫn Lưu Trữ',
        path: '/storage-config',
        buttons: [
            { key: 'save_config', name: 'Lưu Cấu Hình', selector: 'button:has-text("Lưu Cấu Hình")' },
            { key: 'reset_config', name: 'Reset Về Mặc Định', selector: 'button:has-text("Reset Về Mặc Định")' },
        ],
    },
    'template-config': {
        key: 'template-config',
        name: 'Cấu Hình Template PDF',
        path: '/template-config',
        buttons: [
            { key: 'save_config', name: 'Lưu Cấu Hình', selector: 'button:has-text("Lưu Cấu Hình")' },
            { key: 'reset_config', name: 'Reset Mặc Định', selector: 'button:has-text("Reset Mặc Định")' },
            { key: 'upload_logo', name: 'Upload Logo', selector: 'button:has-text("Upload")' },
            { key: 'remove_logo', name: 'Xóa Logo', selector: 'button:has-text("Xóa")' },
        ],
    },
    'admin-products': {
        key: 'admin-products',
        name: 'Quản Lý Số Lượng Sản Phẩm',
        path: '/admin/products',
        buttons: [
            { key: 'edit_quantity', name: 'Chỉnh Sửa Số Lượng', selector: 'button:has-text("Chỉnh Sửa")' },
        ],
    },
};

// Helper functions
export function getAllPageKeys(): string[] {
    return Object.keys(PAGE_PERMISSIONS);
}

export function getPagePermission(pageKey: string): PagePermission | undefined {
    return PAGE_PERMISSIONS[pageKey];
}

export function getAllButtonKeys(pageKey: string): string[] {
    const page = PAGE_PERMISSIONS[pageKey];
    if (!page || !page.buttons) return [];
    return page.buttons.map((btn) => btn.key);
}

// Kiểm tra quyền truy cập trang
export function hasPageAccess(
    pagePermissions: Record<string, any>,
    pageKey: string,
    isAdmin: boolean
): boolean {
    // ADMIN luôn có quyền truy cập TẤT CẢ các trang, không cần kiểm tra gì thêm
    if (isAdmin) return true;

    // Admin pages - user mặc định KHÔNG được vào
    // Chỉ được vào khi được cấp quyền cụ thể (allowed === true)
    if (['admin', 'warehouses', 'categories', 'history', 'backup', 'storage-config', 'template-config', 'admin-products'].includes(pageKey)) {
        const pagePerm = pagePermissions[pageKey];
        // Chỉ cho phép nếu có permission và allowed === true
        return pagePerm !== undefined && pagePerm !== null && pagePerm.allowed === true;
    }

    // User mặc định có quyền vào tất cả trang TRỪ admin pages
    // Nếu có custom permission thì dùng custom (có thể bị từ chối nếu allowed === false)
    if (pagePermissions[pageKey] !== undefined && pagePermissions[pageKey] !== null) {
        return pagePermissions[pageKey].allowed === true;
    }

    // Mặc định: User có quyền vào trang (trừ admin pages đã xử lý ở trên)
    return true;
}

// Kiểm tra quyền sử dụng button
export function hasButtonAccess(
    pagePermissions: Record<string, any>,
    pageKey: string,
    buttonKey: string,
    isAdmin: boolean
): boolean {
    // Admin luôn có quyền sử dụng tất cả button
    if (isAdmin) return true;

    const pagePerm = pagePermissions[pageKey];

    // Nếu không có permission object
    if (!pagePerm) {
        // Admin pages: không có permission = không có quyền
        if (['admin', 'warehouses', 'categories', 'history', 'backup', 'storage-config', 'template-config', 'admin-products'].includes(pageKey)) {
            return false;
        }
        // Other pages: không có permission = có quyền mặc định (tất cả buttons)
        return true;
    }

    // Kiểm tra quyền truy cập trang trước
    if (!pagePerm.allowed) return false;

    // Kiểm tra quyền button
    // Nếu buttons array không tồn tại hoặc rỗng
    if (!pagePerm.buttons || !Array.isArray(pagePerm.buttons)) {
        // Admin pages: cần có buttons array rõ ràng
        if (['admin', 'warehouses', 'categories', 'history', 'backup', 'storage-config', 'template-config', 'admin-products'].includes(pageKey)) {
            return false;
        }
        // Other pages: nếu allowed = true và không có buttons array, cho phép tất cả
        return true;
    }

    // Kiểm tra xem button key có trong array không
    return pagePerm.buttons.includes(buttonKey);
}

// Tạo permissions mặc định cho user mới (tất cả trang TRỪ admin pages, tất cả button)
export function getDefaultUserPermissions(): Record<string, any> {
    const defaultPerms: Record<string, any> = {};

    Object.keys(PAGE_PERMISSIONS).forEach((pageKey) => {
        // Admin pages - mặc định không cho phép
        if (['admin', 'warehouses', 'categories', 'history', 'backup', 'storage-config', 'template-config', 'admin-products'].includes(pageKey)) {
            defaultPerms[pageKey] = { allowed: false, buttons: [] };
        } else {
            // Các trang khác - mặc định cho phép tất cả button
            const page = PAGE_PERMISSIONS[pageKey];
            const allButtonKeys = page.buttons ? page.buttons.map((btn) => btn.key) : [];
            defaultPerms[pageKey] = { allowed: true, buttons: allButtonKeys };
        }
    });

    return defaultPerms;
}
