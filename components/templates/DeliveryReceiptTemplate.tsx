import React from 'react';

interface DeliveryReceiptTemplateProps {
    receipt: any;
    companyConfig?: any;
}

export default function DeliveryReceiptTemplate({ receipt, companyConfig }: DeliveryReceiptTemplateProps) {
    const config = companyConfig || {
        companyName: 'CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ TRIỆU LỢI',
        companyAddress: '525/15/21 Lê Trọng Tấn, Phường Tây Thạnh, Thành phố HCM',
        companyPhone: '028 625 99973 - 0358 768 434',
        email: 'trieuloi1976@gmail.com',
        taxCode: '0311835604',
        logoPath: '/logo/logo.png'
    };

    const order = receipt.Order;
    const deliveryDate = new Date(receipt.deliveryDate).toLocaleDateString('vi-VN');

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto relative" id="delivery-receipt-print">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <img
                    src={config.logoPath + '?t=' + Date.now()}
                    alt="Watermark"
                    className="w-96 h-96 object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-lg font-bold text-gray-900">
                        {config.companyName}
                    </h1>
                    <p className="text-sm text-gray-600">{config.companyAddress}</p>
                    <p className="text-sm text-gray-600">
                        MST: {config.taxCode}
                    </p>
                    <p className="text-sm text-gray-600">
                        Tel: {config.companyPhone}
                    </p>
                    <p className="text-sm text-gray-600">
                        {config.email}
                    </p>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        BIÊN BẢN GIAO NHẬN HÀNG HÓA
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Ngày tháng {deliveryDate}
                    </p>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                    <p className="mb-2">
                        <strong>Đơn vị mua hàng:</strong>
                    </p>
                    <p className="ml-4">Tên: {order.customer}</p>
                    <p className="ml-4">Địa chỉ: {order.address || '..................'}</p>
                    <p className="ml-4">Điện thoại: {order.phone || '..................'}</p>
                </div>

                {/* Delivery Info */}
                {receipt.deliveryMethod === 'SHIPPING_COMPANY' && receipt.shippingCompanyName && (
                    <div className="mb-6">
                        <p className="mb-2">
                            <strong>Thông tin vận chuyển:</strong>
                        </p>
                        <p className="ml-4">Chành xe: {receipt.shippingCompanyName}</p>
                        {receipt.shippingCompanyPhone && (
                            <p className="ml-4">SĐT: {receipt.shippingCompanyPhone}</p>
                        )}
                        {receipt.shippingCompanyAddress && (
                            <p className="ml-4">Địa chỉ: {receipt.shippingCompanyAddress}</p>
                        )}
                    </div>
                )}

                {/* Items Table */}
                <div className="mb-6">
                    <p className="mb-2">
                        <strong>Thông nhất giao nhận hàng hóa với nội dung sau:</strong>
                    </p>
                    <table className="w-full border-collapse border border-gray-300 mt-2">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Stt</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Tên hàng hóa</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Đvt</th>
                                <th className="border border-gray-300 px-4 py-2 text-right">Số lượng</th>
                                <th className="border border-gray-300 px-4 py-2 text-right">Đơn giá</th>
                                <th className="border border-gray-300 px-4 py-2 text-right">Thành tiền</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.OrderItem.map((item: any, index: number) => (
                                <tr key={item.id}>
                                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.Product.name}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{item.Product.unit}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-right">
                                        {item.price.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-right">
                                        {(item.quantity * item.price).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Delivery Location */}
                {receipt.deliveryLocation && (
                    <div className="mb-6">
                        <p>
                            <strong>- Địa điểm giao hàng:</strong> {receipt.deliveryLocation}
                        </p>
                    </div>
                )}

                {/* Terms */}
                <div className="mb-6 text-sm">
                    <p className="mb-2">
                        <strong>- Hàng mới 100%, đã kiểm tra, đóng gói cẩn thận</strong>
                    </p>
                    <p className="mb-2">
                        • Nếu có mất mát, gây hư hỏng hàng hóa thì bên nhận phải bồi thường 100% giá trị cho hàng hóa bị mất mát, hư hỏng đó mà không có bất cứ lý do gì.
                    </p>
                    <p className="mb-2">
                        • Thủ tục ký thuận của hàng hóa đúng chất lượng, phù hợp với yêu cầu đã thoả thuận giữa hai bên.
                    </p>
                    <p className="mb-2">
                        • Biên bản được lập thành hai (02) bản, mỗi bên giữ một (01) bản có giá trị pháp lý như nhau.
                    </p>
                </div>

                {/* Notes */}
                {receipt.notes && (
                    <div className="mb-6">
                        <p>
                            <strong>Ghi chú:</strong> {receipt.notes}
                        </p>
                    </div>
                )}

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="text-center">
                        <p className="font-semibold mb-16">Đại diện bên giao</p>
                        <p className="text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold mb-16">Đại diện bên nhận</p>
                        <p className="text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #delivery-receipt-print,
                    #delivery-receipt-print * {
                        visibility: visible;
                    }
                    #delivery-receipt-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
