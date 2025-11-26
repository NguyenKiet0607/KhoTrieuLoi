"use client"

import React, { useState, useEffect } from "react"
import { Upload, Save, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"

interface CompanyConfig {
    companyName: string
    companyAddress: string
    companyPhone: string
    logoPath: string
}

export default function DocumentSettingsPage() {
    const [config, setConfig] = useState<CompanyConfig>({
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        logoPath: "/logo/logo.png",
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string>("")

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/storage-config")
            setConfig(response.data)
            setLogoPreview(response.data.logoPath + "?t=" + Date.now())
        } catch (error) {
            console.error("Error fetching config:", error)
            showToast("Lỗi khi tải cài đặt", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await apiClient.post("/storage-config", config)
            showToast("Lưu cài đặt thành công", "success")
        } catch (error) {
            console.error("Error saving config:", error)
            showToast("Lỗi khi lưu cài đặt", "error")
        } finally {
            setSaving(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
            showToast("Chỉ chấp nhận file PNG hoặc JPG", "error")
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast("File quá lớn. Tối đa 5MB", "error")
            return
        }

        try {
            const formData = new FormData()
            formData.append("logo", file)

            const response = await apiClient.post("/upload-logo", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            setConfig({ ...config, logoPath: response.data.path })
            setLogoPreview(response.data.path + "?t=" + Date.now())
            showToast("Upload logo thành công", "success")
        } catch (error: any) {
            console.error("Error uploading logo:", error)
            showToast(error.response?.data?.error || "Lỗi khi upload logo", "error")
        }
    }

    const handleDeleteLogo = async () => {
        if (!confirm("Bạn có chắc muốn xóa logo?")) return

        try {
            await apiClient.delete("/upload-logo")
            setConfig({ ...config, logoPath: "" })
            setLogoPreview("")
            showToast("Xóa logo thành công", "success")
        } catch (error) {
            console.error("Error deleting logo:", error)
            showToast("Lỗi khi xóa logo", "error")
        }
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cài Đặt Chứng Từ</h1>
                <p className="text-muted-foreground mt-1">
                    Cấu hình thông tin công ty hiển thị trên các chứng từ
                </p>
            </div>

            <div className="max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin chung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Company Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Tên Công Ty <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={config.companyName}
                                onChange={(e) =>
                                    setConfig({ ...config, companyName: e.target.value })
                                }
                                placeholder="Nhập tên công ty"
                            />
                        </div>

                        {/* Company Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Địa Chỉ <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={config.companyAddress}
                                onChange={(e) =>
                                    setConfig({ ...config, companyAddress: e.target.value })
                                }
                                placeholder="Nhập địa chỉ công ty"
                            />
                        </div>

                        {/* Company Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Số Điện Thoại <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={config.companyPhone}
                                onChange={(e) =>
                                    setConfig({ ...config, companyPhone: e.target.value })
                                }
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Logo Công Ty (Watermark)
                            </label>
                            <p className="text-sm text-muted-foreground mb-3">
                                Logo sẽ hiển thị làm watermark ở giữa các chứng từ. Chấp nhận
                                file PNG hoặc JPG, tối đa 5MB.
                            </p>

                            {logoPreview && (
                                <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                                    <p className="text-sm font-medium mb-2">Preview:</p>
                                    <div className="relative w-48 h-48 mx-auto">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none"
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <label className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    <div className="flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                        <Upload className="w-4 h-4 mr-2" />
                                        <span>Upload Logo</span>
                                    </div>
                                </label>

                                {logoPreview && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteLogo}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Xóa Logo
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="min-w-32"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Lưu Cài Đặt
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        ℹ️ Lưu ý:
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                            • Thông tin này sẽ hiển thị trên tất cả các loại chứng từ (Phiếu
                            Thu, Phiếu Nhập, Phiếu Xuất, Phiếu Chuyển)
                        </li>
                        <li>
                            • Logo sẽ tự động thay thế logo cũ khi bạn upload logo mới
                        </li>
                        <li>
                            • Sau khi lưu, vào trang "Chứng từ mẫu" để xem kết quả
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
