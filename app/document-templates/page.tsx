"use client"

import React, { useState, useEffect } from "react"
import {
    FileText,
    PackagePlus,
    PackageMinus,
    ArrowLeftRight,
    Download,
    Eye,
} from "lucide-react"
import Modal from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import apiClient from "@/lib/api"
import { cn } from "@/lib/utils"

interface DocumentTemplate {
    id: string
    name: string
    description: string
    icon: any
    color: string
    sampleData: any
}

interface CompanyConfig {
    companyName: string
    companyAddress: string
    companyPhone: string
    logoPath: string
}

export default function DocumentTemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] =
        useState<DocumentTemplate | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [config, setConfig] = useState<CompanyConfig>({
        companyName: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ TRIỆU LỢI",
        companyAddress: "525/15/21 Lê Trọng Tấn, Phường Tây Thạnh, Thành phố HCM",
        companyPhone: "028 625 99973 - 0358 768 434",
        logoPath: "/logo/logo.png",
    })

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const response = await apiClient.get("/storage-config")
            setConfig(response.data)
        } catch (error) {
            console.error("Error fetching config:", error)
        }
    }

    const templates: DocumentTemplate[] = [
        {
            id: "order-receipt",
            name: "Phiếu Thu",
            description: "Phiếu thu tiền từ đơn hàng bán hàng",
            icon: FileText,
            color: "bg-blue-500",
            sampleData: {
                code: "DH-2025-001",
                date: "22/11/2025",
                customer: "Công ty TNHH ABC",
                phone: "0909123456",
                address: "123 Đường Lê Lợi, Q.1, TP.HCM",
                items: [
                    {
                        name: "Xi măng PCB40",
                        unit: "Bao",
                        quantity: 100,
                        price: 95000,
                        total: 9500000,
                    },
                    {
                        name: "Sắt thép D10",
                        unit: "Cây",
                        quantity: 50,
                        price: 85000,
                        total: 4250000,
                    },
                ],
                subtotal: 13750000,
                discount: 0,
                total: 850000,
                notes: "Giao hàng trong 3 ngày",
            },
        },
        {
            id: "stock-receipt",
            name: "Phiếu Nhập Kho",
            description: "Phiếu nhập hàng hóa vào kho từ nhà cung cấp",
            icon: PackagePlus,
            color: "bg-green-500",
            sampleData: {
                code: "PN-2025-001",
                date: "22/11/2025",
                supplier: "Công ty Xi măng Hoàng Thạch",
                warehouse: "Kho Trung Tâm",
                items: [
                    {
                        name: "Xi măng PCB40",
                        unit: "Bao",
                        quantity: 500,
                        price: 85000,
                        total: 42500000,
                    },
                    {
                        name: "Xi măng PCB30",
                        unit: "Bao",
                        quantity: 300,
                        price: 80000,
                        total: 24000000,
                    },
                ],
                total: 66500000,
                notes: "Hàng nhập từ nhà máy",
            },
        },
        {
            id: "issue-note",
            name: "Phiếu Xuất Kho",
            description: "Phiếu xuất hàng hóa ra khỏi kho",
            icon: PackageMinus,
            color: "bg-orange-500",
            sampleData: {
                code: "PX-2025-001",
                date: "22/11/2025",
                receiver: "Nguyễn Văn A",
                warehouse: "Kho Trung Tâm",
                items: [
                    {
                        name: "Xi măng PCB40",
                        unit: "Bao",
                        quantity: 100,
                        price: 95000,
                        total: 9500000,
                    },
                    {
                        name: "Gạch đỏ",
                        unit: "Viên",
                        quantity: 1000,
                        price: 2500,
                        total: 2500000,
                    },
                ],
                total: 12000000,
                notes: "Xuất cho công trình ABC",
            },
        },
        {
            id: "transfer-note",
            name: "Phiếu Chuyển Kho",
            description: "Phiếu chuyển hàng giữa các kho",
            icon: ArrowLeftRight,
            color: "bg-purple-500",
            sampleData: {
                code: "PC-2025-001",
                date: "22/11/2025",
                fromWarehouse: "Kho Trung Tâm",
                toWarehouse: "Kho Chi Nhánh 1",
                items: [
                    { name: "Xi măng PCB40", unit: "Bao", quantity: 200 },
                    { name: "Sắt thép D10", unit: "Cây", quantity: 100 },
                ],
                notes: "Chuyển hàng bổ sung cho chi nhánh",
            },
        },
    ]

    const handlePreview = (template: DocumentTemplate) => {
        setSelectedTemplate(template)
        setShowPreview(true)
    }

    const handlePrint = () => {
        window.print()
    }

    const renderPreviewContent = () => {
        if (!selectedTemplate) return null

        const { sampleData } = selectedTemplate

        // For receipt template (Phiếu Thu)
        if (selectedTemplate.id === "order-receipt") {
            return (
                <div
                    className="bg-white p-8 max-w-4xl mx-auto relative"
                    id="print-content"
                >
                    {/* Watermark Logo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <img
                            src={config.logoPath + "?t=" + Date.now()}
                            alt="Watermark"
                            className="w-96 h-96 object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = "none"
                            }}
                        />
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 relative z-10">
                        <div className="text-left">
                            <h1 className="text-sm font-bold text-gray-900">
                                {config.companyName}
                            </h1>
                            <p className="text-xs text-gray-600">{config.companyAddress}</p>
                            <p className="text-xs text-gray-600">
                                ĐT: {config.companyPhone}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold">Mẫu số: 01 - TT</p>
                            <p className="text-xs">
                                (Ban hành theo TT số: 200/2014/QĐ8-BTC
                            </p>
                            <p className="text-xs">Ngày 20/3/2006 của Bộ trưởng BTC)</p>
                            <p className="text-xs mt-2">
                                Quyển số: ..................
                            </p>
                            <p className="text-xs">
                                Số: DH{sampleData.code?.split("-")[2] || "001"}/01-162909
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6 relative z-10">
                        <h2 className="text-2xl font-bold text-gray-900">PHIẾU THU</h2>
                        <p className="text-sm text-gray-600">Ngày {sampleData.date}</p>
                    </div>

                    {/* Content */}
                    <div className="mb-6 text-sm relative z-10">
                        <p className="mb-2">
                            - Họ và tên người nộp tiền :{" "}
                            <span className="font-semibold">{sampleData.customer}</span>
                        </p>
                        <p className="mb-2">
                            - Địa chỉ: <span className="ml-32">.....................</span>
                        </p>
                        <p className="mb-2">
                            - Lý do thu:{" "}
                            <span className="ml-32">{sampleData.items[0]?.name}</span>
                        </p>
                        <p className="mb-2">
                            - Số tiền:{" "}
                            <span className="ml-36 font-semibold">
                                {sampleData.total.toLocaleString("vi-VN")} đ
                            </span>
                        </p>
                        <p className="mb-2">
                            - Bằng chữ :{" "}
                            <span className="ml-32 italic">
                                (Tám trăm năm mươi nghìn đồng)
                            </span>
                        </p>
                        <p className="mb-2">
                            - Kèm theo :{" "}
                            <span className="ml-32 font-semibold">Chứng từ gốc</span>
                        </p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-5 gap-4 mt-12 text-center text-sm relative z-10">
                        <div>
                            <p className="font-semibold mb-16">Giám đốc</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-16">Kế toán trưởng</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-16">Thủ quỹ</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-16">Người lập phiếu</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-16">Người nộp tiền</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-xs text-gray-600 relative z-10">
                        <p className="mb-1">
                            - Đã nhận đủ số tiền (Viết bằng chữ):{" "}
                            <span className="italic">Bé Mát - Đẹp Công Trình</span>
                        </p>
                        <p className="mb-1 ml-8 italic">
                            (Tám trăm năm mươi nghìn đồng)
                        </p>
                        <p className="mb-1">
                            - Tỉ giá ngoại tệ (Vàng, bạc, đá quý):
                        </p>
                        <p className="ml-8">.....................</p>
                        <p className="mt-2">- Số tiền quy đổi:</p>
                        <p className="ml-8">.....................</p>
                    </div>
                </div>
            )
        }

        // For other templates, use standard format with dynamic config
        return (
            <div
                className="bg-white p-8 max-w-4xl mx-auto relative"
                id="print-content"
            >
                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <img
                        src={config.logoPath + "?t=" + Date.now()}
                        alt="Watermark"
                        className="w-96 h-96 object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = "none"
                        }}
                    />
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {config.companyName}
                        </h1>
                        <p className="text-sm text-gray-600">
                            Địa chỉ: {config.companyAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                            Điện thoại: {config.companyPhone}
                        </p>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 uppercase">
                            {selectedTemplate.name}
                        </h2>
                        <p className="text-sm text-gray-600">Mã: {sampleData.code}</p>
                        <p className="text-sm text-gray-600">Ngày: {sampleData.date}</p>
                    </div>

                    <div className="mb-6 space-y-2">
                        {sampleData.customer && (
                            <>
                                <p>
                                    <strong>Khách hàng:</strong> {sampleData.customer}
                                </p>
                                <p>
                                    <strong>Số điện thoại:</strong> {sampleData.phone}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong> {sampleData.address}
                                </p>
                            </>
                        )}
                        {sampleData.supplier && (
                            <p>
                                <strong>Nhà cung cấp:</strong> {sampleData.supplier}
                            </p>
                        )}
                        {sampleData.receiver && (
                            <p>
                                <strong>Người nhận:</strong> {sampleData.receiver}
                            </p>
                        )}
                        {sampleData.warehouse && (
                            <p>
                                <strong>Kho:</strong> {sampleData.warehouse}
                            </p>
                        )}
                        {sampleData.fromWarehouse && (
                            <>
                                <p>
                                    <strong>Từ kho:</strong> {sampleData.fromWarehouse}
                                </p>
                                <p>
                                    <strong>Đến kho:</strong> {sampleData.toWarehouse}
                                </p>
                            </>
                        )}
                    </div>

                    <table className="w-full border-collapse border border-gray-300 mb-6">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">
                                    STT
                                </th>
                                <th className="border border-gray-300 px-4 py-2 text-left">
                                    Tên hàng
                                </th>
                                <th className="border border-gray-300 px-4 py-2 text-center">
                                    ĐVT
                                </th>
                                <th className="border border-gray-300 px-4 py-2 text-right">
                                    Số lượng
                                </th>
                                {sampleData.items[0]?.price && (
                                    <>
                                        <th className="border border-gray-300 px-4 py-2 text-right">
                                            Đơn giá
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-right">
                                            Thành tiền
                                        </th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {sampleData.items.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {index + 1}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {item.name}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                        {item.unit}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-right">
                                        {item.quantity}
                                    </td>
                                    {item.price && (
                                        <>
                                            <td className="border border-gray-300 px-4 py-2 text-right">
                                                {item.price.toLocaleString("vi-VN")}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-right">
                                                {item.total.toLocaleString("vi-VN")}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {sampleData.total && (
                        <div className="flex justify-end mb-6">
                            <div className="w-64">
                                {sampleData.subtotal && (
                                    <div className="flex justify-between mb-2">
                                        <span>Tạm tính:</span>
                                        <span className="font-semibold">
                                            {sampleData.subtotal.toLocaleString("vi-VN")} đ
                                        </span>
                                    </div>
                                )}
                                {sampleData.discount !== undefined && (
                                    <div className="flex justify-between mb-2">
                                        <span>Giảm giá:</span>
                                        <span className="font-semibold">
                                            {sampleData.discount.toLocaleString("vi-VN")} đ
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2">
                                    <span className="font-bold">Tổng cộng:</span>
                                    <span className="font-bold text-lg">
                                        {sampleData.total.toLocaleString("vi-VN")} đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {sampleData.notes && (
                        <div className="mb-6">
                            <p>
                                <strong>Ghi chú:</strong> {sampleData.notes}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-8 mt-12">
                        <div className="text-center">
                            <p className="font-semibold mb-16">Người lập phiếu</p>
                            <p className="text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold mb-16">Người duyệt</p>
                            <p className="text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Chứng Từ Mẫu</h1>
                <p className="text-muted-foreground mt-1">
                    Xem trước các loại chứng từ có thể tạo trong hệ thống
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => {
                    const Icon = template.icon
                    return (
                        <Card key={template.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={cn(
                                            "p-3 rounded-lg text-white shadow-sm",
                                            template.color
                                        )}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {template.description}
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePreview(template)}
                                            className="w-full"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Xem Mẫu
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title={selectedTemplate?.name || ""}
                size="xl"
            >
                <div className="max-h-[70vh] overflow-auto">
                    {renderPreviewContent()}
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowPreview(false)}>
                        Đóng
                    </Button>
                    <Button onClick={handlePrint}>
                        <Download className="w-4 h-4 mr-2" />
                        In Mẫu
                    </Button>
                </div>
            </Modal>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content,
          #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    )
}
