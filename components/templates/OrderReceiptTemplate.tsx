import React from 'react';
import { readMoney } from '@/lib/readMoney';

interface OrderReceiptTemplateProps {
    order: any;
    config: any;
}

export const OrderReceiptTemplate = React.forwardRef<HTMLDivElement, OrderReceiptTemplateProps>(({ order, config }, ref) => {
    // Normalize items
    const items = order.items || order.OrderItem?.map((i: any) => ({
        name: i.productName || i.Product?.name,
        unit: i.unit,
        quantity: i.quantity,
        price: i.price,
        total: i.amount || (i.quantity * i.price)
    })) || [];

    const total = order.totalAmount || order.total || 0;
    const moneyText = readMoney(total);
    const date = new Date(order.date);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return (
        <div ref={ref} className="bg-white p-4 max-w-4xl mx-auto relative text-black" style={{ width: '210mm', minHeight: '148mm' }}>
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <img
                    src={config.logoPath || "/logo/logo.png"}
                    alt="Watermark"
                    className="w-96 h-96 object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = "none"
                    }}
                />
            </div>

            {/* Header */}
            <div className="flex justify-between mb-2 relative z-10">
                <div className="text-left">
                    <h1 className="text-xs font-bold text-gray-900 uppercase">
                        {config.companyName}
                    </h1>
                    <p className="text-[10px] text-gray-600">{config.companyAddress}</p>
                    <p className="text-[10px] text-gray-600">
                        ĐT: {config.companyPhone}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-semibold">Mẫu số: 01 - TT</p>
                    <p className="text-[10px]">
                        (Ban hành theo TT số: 200/2014/QĐ8-BTC
                    </p>
                    <p className="text-[10px]">Ngày 20/3/2006 của Bộ trưởng BTC)</p>
                    <p className="text-[10px] mt-1">
                        Quyển số: ..................
                    </p>
                    <p className="text-[10px]">
                        Số: {order.code}
                    </p>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-2 relative z-10">
                <h2 className="text-lg font-bold text-gray-900">PHIẾU THU</h2>
                <p className="text-[10px] text-gray-600">Ngày {dateStr}</p>
            </div>

            {/* Content */}
            <div className="mb-2 text-xs relative z-10 leading-snug">
                <p className="mb-1">
                    - Họ và tên người nộp tiền :{" "}
                    <span className="font-semibold">{order.customer}</span>
                </p>
                <p className="mb-1">
                    - Địa chỉ: <span className="ml-2">{order.address || ".................................................................."}</span>
                </p>
                <p className="mb-1">
                    - Lý do thu:{" "}
                    <span className="ml-2">
                        {items.length > 0 ? `Thu tiền ${items[0].name}` : "....................."}
                        {items.length > 1 ? ` và ${items.length - 1} sản phẩm khác` : ""}
                    </span>
                </p>
                <p className="mb-1">
                    - Số tiền:{" "}
                    <span className="ml-2 font-semibold">
                        {total.toLocaleString("vi-VN")} đ
                    </span>
                </p>
                <p className="mb-1">
                    - Bằng chữ :{" "}
                    <span className="ml-2 italic">
                        ({moneyText})
                    </span>
                </p>
                <p className="mb-1">
                    - Kèm theo :{" "}
                    <span className="ml-2 font-semibold">Chứng từ gốc</span>
                </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-5 gap-2 mt-4 text-center text-[10px] relative z-10">
                <div>
                    <p className="font-semibold mb-24">Giám đốc</p>
                </div>
                <div>
                    <p className="font-semibold mb-24">Kế toán trưởng</p>
                </div>
                <div>
                    <p className="font-semibold mb-24">Thủ quỹ</p>
                </div>
                <div>
                    <p className="font-semibold mb-24">Người lập phiếu</p>
                </div>
                <div>
                    <p className="font-semibold mb-24">Người nộp tiền</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 text-[10px] text-gray-600 relative z-10">
                <p className="mb-0.5">
                    - Đã nhận đủ số tiền (Viết bằng chữ):{" "}
                    <span className="italic">{moneyText}</span>
                </p>
                <p className="mb-0.5">
                    - Tỉ giá ngoại tệ (Vàng, bạc, đá quý): .....................
                </p>
                <p className="mt-1">- Số tiền quy đổi: .....................</p>
            </div>
        </div>
    );
});

OrderReceiptTemplate.displayName = "OrderReceiptTemplate";
