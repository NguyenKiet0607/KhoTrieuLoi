"use client"

import React, { useState } from "react"
import {
    BarChart3,
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Package,
    ShoppingCart,
    DollarSign,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
    })

    const reportCategories = [
        {
            title: "Báo cáo tồn kho",
            icon: Package,
            color: "bg-blue-500",
            reports: [
                {
                    name: "Báo cáo tồn kho tổng hợp",
                    href: "/reports/inventory/summary",
                },
                { name: "Báo cáo giá trị tồn kho", href: "/reports/inventory/value" },
                {
                    name: "Báo cáo nhập xuất tồn",
                    href: "/reports/inventory/movement",
                },
                { name: "Báo cáo hàng tồn kho lâu", href: "/reports/inventory/aging" },
            ],
        },
        {
            title: "Báo cáo bán hàng",
            icon: ShoppingCart,
            color: "bg-green-500",
            reports: [
                { name: "Báo cáo doanh thu", href: "/reports/sales/revenue" },
                { name: "Báo cáo theo sản phẩm", href: "/reports/sales/by-product" },
                { name: "Báo cáo theo khách hàng", href: "/reports/sales/by-customer" },
                { name: "Báo cáo lợi nhuận", href: "/reports/sales/profit" },
            ],
        },
        {
            title: "Báo cáo mua hàng",
            icon: TrendingUp,
            color: "bg-purple-500",
            reports: [
                { name: "Báo cáo nhập hàng", href: "/reports/purchase/receipts" },
                {
                    name: "Báo cáo theo nhà cung cấp",
                    href: "/reports/purchase/by-supplier",
                },
                { name: "Báo cáo chi phí", href: "/reports/purchase/costs" },
            ],
        },
        {
            title: "Báo cáo tài chính",
            icon: DollarSign,
            color: "bg-yellow-500",
            reports: [
                { name: "Báo cáo thu chi", href: "/reports/financial/cash-flow" },
                { name: "Báo cáo công nợ", href: "/reports/financial/debts" },
                { name: "Báo cáo lãi lỗ", href: "/reports/financial/profit-loss" },
            ],
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Báo cáo & Thống kê
                </h1>
                <p className="text-muted-foreground mt-1">
                    Xem và xuất các báo cáo hệ thống
                </p>
            </div>

            {/* Date Range Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Chọn khoảng thời gian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Từ ngày</label>
                            <Input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) =>
                                    setDateRange({ ...dateRange, from: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Đến ngày</label>
                            <Input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) =>
                                    setDateRange({ ...dateRange, to: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex items-end">
                            <Button className="w-full">
                                <Calendar className="w-4 h-4 mr-2" />
                                Áp dụng
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportCategories.map((category, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                                <div
                                    className={cn(
                                        "p-2 rounded-lg text-white shadow-sm",
                                        category.color
                                    )}
                                >
                                    <category.icon className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg">{category.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {category.reports.map((report, idx) => (
                                    <Link
                                        key={idx}
                                        href={report.href}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                {report.name}
                                            </span>
                                        </div>
                                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Thống kê nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                Doanh thu tháng này
                            </p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                                125.5M đ
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                +12% so với tháng trước
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Đơn hàng mới
                            </p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
                                48
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                +8% so với tháng trước
                            </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                                Tồn kho
                            </p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                                1,245
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                Sản phẩm
                            </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                Lợi nhuận
                            </p>
                            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">
                                32.1M đ
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                25.6% biên lợi nhuận
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
