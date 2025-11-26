"use client"

import React, { useState } from "react"
import {
    Building,
    Globe,
    Bell,
    Database,
    Mail,
    Shield,
    Palette,
    Save,
} from "lucide-react"
import { showToast } from "@/components/ui/Toast"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        companyName: "Công ty Triệu Lợi",
        companyEmail: "contact@trieuloi.com",
        companyPhone: "0123456789",
        companyAddress: "123 Đường ABC, TP.HCM",
        currency: "VND",
        timezone: "Asia/Ho_Chi_Minh",
        dateFormat: "DD/MM/YYYY",
        language: "vi",
        lowStockThreshold: 10,
        emailNotifications: true,
        smsNotifications: false,
        stockAlerts: true,
        orderAlerts: true,
    })

    const [activeTab, setActiveTab] = useState("company")

    const handleSave = () => {
        showToast("Lưu cài đặt thành công", "success")
    }

    const menuItems = [
        { id: "company", icon: Building, label: "Thông tin công ty" },
        { id: "regional", icon: Globe, label: "Khu vực & Ngôn ngữ" },
        { id: "notifications", icon: Bell, label: "Thông báo" },
        { id: "inventory", icon: Database, label: "Tồn kho" },
        { id: "email", icon: Mail, label: "Email" },
        { id: "security", icon: Shield, label: "Bảo mật" },
        { id: "interface", icon: Palette, label: "Giao diện" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý cấu hình và tùy chỉnh hệ thống
                    </p>
                </div>
                <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Settings Navigation */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Danh mục</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors text-sm font-medium",
                                        activeTab === item.id
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </CardContent>
                </Card>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Company Info */}
                    <div className={activeTab === "company" ? "block" : "hidden"}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin công ty</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Tên công ty</label>
                                    <Input
                                        value={settings.companyName}
                                        onChange={(e) =>
                                            setSettings({ ...settings, companyName: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={settings.companyEmail}
                                        onChange={(e) =>
                                            setSettings({ ...settings, companyEmail: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Số điện thoại</label>
                                    <Input
                                        type="tel"
                                        value={settings.companyPhone}
                                        onChange={(e) =>
                                            setSettings({ ...settings, companyPhone: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Địa chỉ</label>
                                    <textarea
                                        value={settings.companyAddress}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                companyAddress: e.target.value,
                                            })
                                        }
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Regional Settings */}
                    <div className={activeTab === "regional" ? "block" : "hidden"}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Khu vực & Ngôn ngữ</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Tiền tệ</label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) =>
                                            setSettings({ ...settings, currency: e.target.value })
                                        }
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="VND">VND - Việt Nam Đồng</option>
                                        <option value="USD">USD - US Dollar</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Múi giờ</label>
                                    <select
                                        value={settings.timezone}
                                        onChange={(e) =>
                                            setSettings({ ...settings, timezone: e.target.value })
                                        }
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="Asia/Ho_Chi_Minh">
                                            GMT+7 - Hồ Chí Minh
                                        </option>
                                        <option value="Asia/Bangkok">GMT+7 - Bangkok</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Định dạng ngày</label>
                                    <select
                                        value={settings.dateFormat}
                                        onChange={(e) =>
                                            setSettings({ ...settings, dateFormat: e.target.value })
                                        }
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Ngôn ngữ</label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) =>
                                            setSettings({ ...settings, language: e.target.value })
                                        }
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notification Settings */}
                    <div className={activeTab === "notifications" ? "block" : "hidden"}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt thông báo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: "emailNotifications", label: "Thông báo qua Email" },
                                    { key: "smsNotifications", label: "Thông báo qua SMS" },
                                    { key: "stockAlerts", label: "Cảnh báo tồn kho thấp" },
                                    { key: "orderAlerts", label: "Cảnh báo đơn hàng mới" },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    settings[item.key as keyof typeof settings] as boolean
                                                }
                                                onChange={(e) =>
                                                    setSettings({
                                                        ...settings,
                                                        [item.key]: e.target.checked,
                                                    })
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Inventory Settings */}
                    <div className={activeTab === "inventory" ? "block" : "hidden"}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt tồn kho</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">
                                        Ngưỡng cảnh báo tồn kho thấp
                                    </label>
                                    <Input
                                        type="number"
                                        value={settings.lowStockThreshold}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                lowStockThreshold: parseInt(e.target.value),
                                            })
                                        }
                                        min="0"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Hệ thống sẽ cảnh báo khi số lượng tồn kho dưới ngưỡng này
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Other tabs placeholder */}
                    {["email", "security", "interface"].includes(activeTab) && (
                        <Card>
                            <CardContent className="p-12 text-center text-muted-foreground">
                                Tính năng đang được phát triển
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
