import React from 'react';

interface StockReceiptProps {
    receiptNo: string;
    date: Date;
    supplierName: string;
    notes?: string;
    items: {
        name: string;
        unit: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    companyInfo?: {
        name: string;
        address: string;
        taxId: string;
        phone: string;
    };
}

export const StockReceiptTemplate: React.FC<StockReceiptProps> = ({
    receiptNo,
    date,
    supplierName,
    notes = '',
    items,
    totalAmount,
    companyInfo = {
        name: 'CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ TRIỀU LỢI',
        address: '525/15/21 Lê Trọng Tấn, Phường Tây Thạnh, Thành phố HCM',
        taxId: '0311835604',
        phone: '028 625 99771 - 028 625 99973 - 0358 768 434',
    },
}) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto text-sm font-sans leading-relaxed relative">
            {/* Watermark/Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                <div className="w-96 h-96 rounded-full border-8 border-red-200 flex items-center justify-center">
                    <span className="text-9xl font-bold text-red-200">TL</span>
                </div>
            </div>

            <div className="relative z-10">
                {/* Header Title */}
                <div className="text-center mb-2">
                    <h1 className="text-2xl font-bold uppercase">PHIẾU NHẬP KHO</h1>
                    <p className="italic">Ngày {day}/{month}/{year}</p>
                </div>

                {/* Header Info */}
                <div className="flex justify-end mb-6">
                    <div className="text-sm">
                        <p>Mẫu số: ........................</p>
                        <p>Ký hiệu: ........................</p>
                        <p>Số: <span className="font-semibold">{receiptNo}</span></p>
                    </div>
                </div>

                {/* Company & Supplier Info */}
                <div className="mb-6 space-y-1">
                    <div className="flex">
                        <span className="w-32 flex-shrink-0">Đơn vị nhập hàng:</span>
                        <span className="font-bold uppercase">{companyInfo.name}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 flex-shrink-0">Địa chỉ:</span>
                        <span>{companyInfo.address}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 flex-shrink-0">Mã số thuế:</span>
                        <span>{companyInfo.taxId}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 flex-shrink-0">Số điện thoại:</span>
                        <span>{companyInfo.phone}</span>
                    </div>
                    <div className="flex mt-4">
                        <span className="w-32 flex-shrink-0">Nhà cung cấp:</span>
                        <span className="font-semibold">{supplierName}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 flex-shrink-0">Ghi chú:</span>
                        <span>{notes}</span>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse border border-black mb-4">
                    <thead>
                        <tr className="bg-white">
                            <th className="border border-black px-2 py-1 w-12 text-center">STT</th>
                            <th className="border border-black px-2 py-1 text-left">Tên hàng hoá</th>
                            <th className="border border-black px-2 py-1 w-20 text-center">ĐVT</th>
                            <th className="border border-black px-2 py-1 w-24 text-center">Số lượng</th>
                            <th className="border border-black px-2 py-1 w-32 text-right">Đơn giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                <td className="border border-black px-2 py-1">{item.name}</td>
                                <td className="border border-black px-2 py-1 text-center">{item.unit}</td>
                                <td className="border border-black px-2 py-1 text-center">{item.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right">{item.price.toLocaleString('vi-VN')} đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div className="text-right mb-12">
                    <p className="font-bold text-lg">Tổng tiền: {totalAmount.toLocaleString('vi-VN')} đ</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="font-bold">Người lập phiếu</p>
                    </div>
                    <div>
                        <p className="font-bold">Thủ kho</p>
                    </div>
                    <div>
                        <p className="font-bold">Kế toán</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
