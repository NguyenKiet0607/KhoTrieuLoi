import React from 'react';

interface PaymentReceiptProps {
    receiptNo: string;
    date: Date;
    payerName: string;
    payerAddress: string;
    reason: string;
    amount: number;
    amountInWords: string;
    attachedDocs?: string;
    companyInfo?: {
        name: string;
        address: string;
        phone: string;
    };
}

export const PaymentReceiptTemplate: React.FC<PaymentReceiptProps> = ({
    receiptNo,
    date,
    payerName,
    payerAddress,
    reason,
    amount,
    amountInWords,
    attachedDocs = '................................................',
    companyInfo = {
        name: 'CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ TRIỀU LỢI',
        address: '525/15/21 Lê Trọng Tấn, Phường Tây Thạnh, Thành phố HCM',
        phone: '028 625 99771 - 028 625 99973 - 0358 768 434',
    },
}) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto text-sm font-serif leading-relaxed relative">
            {/* Watermark/Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                <div className="w-96 h-96 rounded-full border-8 border-red-200 flex items-center justify-center">
                    <span className="text-9xl font-bold text-red-200">TL</span>
                </div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="w-2/3">
                        <h3 className="font-bold uppercase text-base">{companyInfo.name}</h3>
                        <p>{companyInfo.address}</p>
                        <p>{companyInfo.phone}</p>
                    </div>
                    <div className="w-1/3 text-center">
                        <p className="font-bold">Mẫu số: 01 - TT</p>
                        <p className="text-xs italic">(Ban hành theo TT số: 200/2014/QĐ-BTC</p>
                        <p className="text-xs italic">Ngày 20/3/2006 của Bộ trưởng BTC)</p>
                        <div className="mt-2 text-left pl-8">
                            <p>Quyển số: ....................</p>
                            <p>Số: <span className="font-semibold">{receiptNo}</span></p>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold uppercase mb-2">PHIẾU THU</h1>
                    <p className="italic">Ngày {day} tháng {month} năm {year}</p>
                </div>

                {/* Content */}
                <div className="space-y-3 px-4">
                    <div className="flex">
                        <span className="w-48 flex-shrink-0">- Họ và tên người nộp tiền:</span>
                        <span className="font-bold">{payerName}</span>
                    </div>
                    <div className="flex">
                        <span className="w-48 flex-shrink-0">- Địa chỉ:</span>
                        <span className="border-b border-dotted border-gray-400 flex-grow border-b-[1px]">{payerAddress}</span>
                    </div>
                    <div className="flex">
                        <span className="w-48 flex-shrink-0">- Lý do thu:</span>
                        <span className="font-semibold">{reason}</span>
                    </div>
                    <div className="flex">
                        <span className="w-48 flex-shrink-0">- Số tiền:</span>
                        <span className="font-bold text-lg">{amount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex">
                        <span className="w-48 flex-shrink-0">- Bằng chữ:</span>
                        <span className="italic text-indigo-900">({amountInWords})</span>
                    </div>
                    <div className="flex">
                        <span className="w-48 flex-shrink-0">- Kèm theo:</span>
                        <span>{attachedDocs}</span>
                        <span className="ml-2">Chứng từ gốc:</span>
                        <span className="ml-8">Hàng miễn đổi trả</span>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-5 gap-4 mt-12 text-center">
                    <div>
                        <p className="font-bold">Giám đốc</p>
                        <p className="text-xs italic mb-16">(Ký, họ tên, đóng dấu)</p>
                    </div>
                    <div>
                        <p className="font-bold">Kế toán trưởng</p>
                        <p className="text-xs italic mb-16">(Ký, họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold">Thủ quỹ</p>
                        <p className="text-xs italic mb-16">(Ký, họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold">Người lập phiếu</p>
                        <p className="text-xs italic mb-16">(Ký, họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold text-blue-600">Người nộp tiền</p>
                        <p className="text-xs italic mb-16">(Ký, họ tên)</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 space-y-2 text-sm">
                    <p>- Đã nhận đủ số tiền (Viết bằng chữ): <span className="italic">{amountInWords}</span></p>
                    <p>- Tỷ giá ngoại tệ (Vàng, bạc, đá quý): ....................</p>
                    <p>- Số tiền quy đổi: ....................</p>
                </div>
            </div>
        </div>
    );
};
