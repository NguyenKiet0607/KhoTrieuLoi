"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Printer, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import apiClient from "@/lib/api"
import DeliveryReceiptTemplate from "@/components/templates/DeliveryReceiptTemplate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { showToast } from "@/components/ui/Toast"

export default function NewDeliveryReceiptPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [shippingCompanies, setShippingCompanies] = useState<any[]>([])
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [companyConfig, setCompanyConfig] = useState<any>(null)

    const [formData, setFormData] = useState({
        orderId: "",
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryLocation: "",
        deliveryMethod: "SELF",
        shippingCompanyId: "",
        shippingCompanyName: "",
        shippingCompanyPhone: "",
        shippingCompanyAddress: "",
        saveShippingCompany: false,
        notes: "",
    })

    const [previewReceipt, setPreviewReceipt] = useState<any>(null)

    useEffect(() => {
        fetchOrders()
        fetchShippingCompanies()
        fetchConfig()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/orders")
            setOrders(response.data || [])
        } catch (error) {
            console.error("Error fetching orders:", error)
            showToast("Lỗi khi tải danh sách đơn hàng", "error")
        } finally {
            setLoading(false)
        }
    }

    const fetchShippingCompanies = async () => {
        try {
            const response = await apiClient.get("/shipping-companies")
            setShippingCompanies(response.data || [])
        } catch (error) {
            console.error("Error fetching shipping companies:", error)
        }
    }

    const fetchConfig = async () => {
        try {
            const response = await apiClient.get("/storage-config")
            setCompanyConfig(response.data)
        } catch (error) {
            console.error("Error fetching config:", error)
        }
    }

    const handleOrderChange = async (orderId: string) => {
        setFormData({ ...formData, orderId })

        if (orderId) {
            try {
                const response = await apiClient.get(`/orders/${orderId}`)
                setSelectedOrder(response.data)
                setFormData((prev) => ({
                    ...prev,
                    deliveryLocation: response.data.address || "",
                }))
            } catch (error) {
                console.error("Error fetching order:", error)
            }
        } else {
            setSelectedOrder(null)
        }
    }

    const handleShippingCompanySelect = (companyId: string) => {
        const company = shippingCompanies.find((c) => c.id === companyId)
        if (company) {
            setFormData({
                ...formData,
                shippingCompanyId: company.id,
                shippingCompanyName: company.name,
                shippingCompanyPhone: company.phone || "",
                shippingCompanyAddress: company.address || "",
            })
        }
    }

    const handlePreview = () => {
        if (!selectedOrder) {
            showToast("Vui lòng chọn đơn hàng", "error")
            return
        }

        const receipt = {
            Order: selectedOrder,
            deliveryDate: formData.deliveryDate,
            deliveryLocation: formData.deliveryLocation,
            deliveryMethod: formData.deliveryMethod,
            shippingCompanyName: formData.shippingCompanyName,
            shippingCompanyPhone: formData.shippingCompanyPhone,
            shippingCompanyAddress: formData.shippingCompanyAddress,
            notes: formData.notes,
        }

        setPreviewReceipt(receipt)
        setShowPreview(true)
    }

    const handleSave = async () => {
        if (!formData.orderId) {
            showToast("Vui lòng chọn đơn hàng", "error")
            return
        }

        try {
            setSaving(true)

            // Save shipping company if needed
            if (
                formData.deliveryMethod === "SHIPPING_COMPANY" &&
                formData.saveShippingCompany &&
                formData.shippingCompanyName &&
                !formData.shippingCompanyId
            ) {
                const companyResponse = await apiClient.post("/shipping-companies", {
                    name: formData.shippingCompanyName,
                    phone: formData.shippingCompanyPhone,
                    address: formData.shippingCompanyAddress,
                })
                formData.shippingCompanyId = companyResponse.data.id
            }

            // Create delivery receipt
            await apiClient.post("/delivery-receipts", formData)

            showToast("Tạo biên bản thành công", "success")
            router.push("/delivery-receipts")
        } catch (error) {
            console.error("Error creating delivery receipt:", error)
            showToast("Lỗi khi tạo biên bản", "error")
        } finally {
            setSaving(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tạo Biên Bản Giao Nhận
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tạo biên bản giao nhận hàng hóa mới
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay Lại
                </Button>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin biên bản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Step 1: Select Order */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">
                                1. Chọn Đơn Hàng
                            </h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Đơn hàng <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.orderId}
                                    onChange={(e) => handleOrderChange(e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">-- Chọn đơn hàng --</option>
                                    {orders.map((order) => (
                                        <option key={order.id} value={order.id}>
                                            {order.code} - {order.customer} -{" "}
                                            {new Date(order.date).toLocaleDateString("vi-VN")}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedOrder && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">
                                        Thông tin đơn hàng
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-blue-700">
                                                <strong>Mã:</strong> {selectedOrder.code}
                                            </p>
                                            <p className="text-blue-700">
                                                <strong>Khách hàng:</strong> {selectedOrder.customer}
                                            </p>
                                            <p className="text-blue-700">
                                                <strong>SĐT:</strong> {selectedOrder.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-blue-700">
                                                <strong>Địa chỉ:</strong> {selectedOrder.address}
                                            </p>
                                            <p className="text-blue-700">
                                                <strong>Tổng tiền:</strong>{" "}
                                                {selectedOrder.totalAmount?.toLocaleString("vi-VN")} đ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Delivery Info */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold text-foreground">
                                2. Thông Tin Giao Hàng
                            </h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Ngày giao hàng <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={formData.deliveryDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, deliveryDate: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Địa điểm giao hàng
                                </label>
                                <Input
                                    type="text"
                                    value={formData.deliveryLocation}
                                    onChange={(e) =>
                                        setFormData({ ...formData, deliveryLocation: e.target.value })
                                    }
                                    placeholder="Nhập địa điểm giao hàng"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Phương thức giao hàng <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value="SELF"
                                            checked={formData.deliveryMethod === "SELF"}
                                            onChange={(e) =>
                                                setFormData({ ...formData, deliveryMethod: e.target.value })
                                            }
                                            className="accent-blue-600"
                                        />
                                        <span>Tự giao</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value="SHIPPING_COMPANY"
                                            checked={formData.deliveryMethod === "SHIPPING_COMPANY"}
                                            onChange={(e) =>
                                                setFormData({ ...formData, deliveryMethod: e.target.value })
                                            }
                                            className="accent-blue-600"
                                        />
                                        <span>Chành xe</span>
                                    </label>
                                </div>
                            </div>

                            {/* Shipping Company Info */}
                            {formData.deliveryMethod === "SHIPPING_COMPANY" && (
                                <div className="bg-muted/50 border rounded-lg p-4 mt-4 space-y-4">
                                    <h4 className="font-semibold text-foreground">
                                        Thông tin chành xe
                                    </h4>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Chọn chành xe có sẵn
                                        </label>
                                        <select
                                            value={formData.shippingCompanyId}
                                            onChange={(e) =>
                                                handleShippingCompanySelect(e.target.value)
                                            }
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">-- Hoặc nhập thông tin mới --</option>
                                            {shippingCompanies.map((company) => (
                                                <option key={company.id} value={company.id}>
                                                    {company.name} - {company.phone}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Tên chành xe <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.shippingCompanyName}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    shippingCompanyName: e.target.value,
                                                })
                                            }
                                            placeholder="Nhập tên chành xe"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Số điện thoại
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.shippingCompanyPhone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    shippingCompanyPhone: e.target.value,
                                                })
                                            }
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Địa chỉ
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.shippingCompanyAddress}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    shippingCompanyAddress: e.target.value,
                                                })
                                            }
                                            placeholder="Nhập địa chỉ"
                                        />
                                    </div>

                                    {!formData.shippingCompanyId &&
                                        formData.shippingCompanyName && (
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.saveShippingCompany}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                saveShippingCompany: e.target.checked,
                                                            })
                                                        }
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-muted-foreground">
                                                        Lưu thông tin chành xe này để sử dụng sau
                                                    </span>
                                                </label>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Step 3: Notes */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold text-foreground">
                                3. Ghi Chú
                            </h3>
                            <textarea
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Nhập ghi chú (nếu có)"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                disabled={!selectedOrder}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Xem Trước
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !selectedOrder}
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Lưu Biên Bản
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Xem Trước Biên Bản"
                size="xl"
            >
                {previewReceipt && (
                    <>
                        <div className="max-h-[70vh] overflow-auto">
                            <DeliveryReceiptTemplate
                                receipt={previewReceipt}
                                companyConfig={companyConfig}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                Đóng
                            </Button>
                            <Button onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                In Biên Bản
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}
