"use client"

import React from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/authStore"
import { Users, Shield, Activity, Database, ArrowLeft } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function AdminPage() {
    const { user } = useAuthStore()

    if (user?.role !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <Shield className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold text-destructive">
                    Truy cập bị từ chối
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Bạn không có quyền truy cập trang này.
                </p>
                <Link href="/dashboard" className="mt-6">
                    <Button>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Về trang chủ
                    </Button>
                </Link>
            </div>
        )
    }

    const adminModules = [
        {
            title: "Quản lý người dùng",
            description: "Thêm, sửa, xóa và phân quyền người dùng.",
            icon: Users,
            href: "/users",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Phân quyền chi tiết",
            description: "Cấu hình quyền truy cập chi tiết cho từng vai trò.",
            icon: Shield,
            href: "/admin/permissions",
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Nhật ký hoạt động",
            description: "Xem lịch sử thao tác của người dùng trên hệ thống.",
            icon: Activity,
            href: "/activity-logs",
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
        {
            title: "Sao lưu & Phục hồi",
            description: "Quản lý sao lưu dữ liệu và phục hồi khi cần thiết.",
            icon: Database,
            href: "/admin/backup",
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản trị hệ thống</h1>
                <p className="text-muted-foreground mt-1">
                    Trung tâm điều khiển và cấu hình hệ thống
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminModules.map((module) => {
                    const Icon = module.icon
                    return (
                        <Link key={module.href} href={module.href}>
                            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <div
                                            className={`p-3 rounded-lg ${module.bgColor} ${module.color}`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                    <CardDescription>{module.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
