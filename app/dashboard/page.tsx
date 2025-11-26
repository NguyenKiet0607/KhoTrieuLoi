"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { useSpring, animated } from "@react-spring/web"
import {
    Package,
    DollarSign,
    AlertTriangle,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    PackagePlus,
    PackageMinus,
    ArrowLeftRight,
    Sparkles,
    Zap,
} from "lucide-react"
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { staggerContainer, staggerItem } from "@/lib/animations"

interface DashboardStats {
    totalProducts: number
    totalStockValue: number
    lowStockItems: number
    pendingOrders: number
    monthlyRevenue: number
    totalWarehouses: number
    totalUsers: number
}

interface RecentActivity {
    orders: any[]
    receipts: any[]
    issues: any[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

// Animated Counter Component
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
    const { number } = useSpring({
        from: { number: 0 },
        number: value,
        delay: 200,
        config: { mass: 1, tension: 20, friction: 10 },
    })

    return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalStockValue: 0,
        lowStockItems: 0,
        pendingOrders: 0,
        monthlyRevenue: 0,
        totalWarehouses: 0,
        totalUsers: 0,
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity>({
        orders: [],
        receipts: [],
        issues: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await apiClient.get("/dashboard/stats")
            setStats(response.data.stats || {})
            setRecentActivity(response.data.recentActivity || {})
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Mock data for charts
    const revenueData = [
        { month: "T1", revenue: 4000000 },
        { month: "T2", revenue: 3000000 },
        { month: "T3", revenue: 5000000 },
        { month: "T4", revenue: 4500000 },
        { month: "T5", revenue: 6000000 },
        { month: "T6", revenue: 5500000 },
    ]

    const stockByCategoryData = [
        { name: "Xi măng", value: 400 },
        { name: "Sắt thép", value: 300 },
        { name: "Gạch", value: 200 },
        { name: "Cát đá", value: 150 },
        { name: "Khác", value: 100 },
    ]

    const statCards = [
        {
            title: "Tổng sản phẩm",
            value: stats.totalProducts,
            icon: Package,
            gradient: "from-blue-500 to-cyan-500",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
            trend: "+12%",
            trendUp: true,
        },
        {
            title: "Giá trị tồn kho",
            value: `${((stats.totalStockValue || 0) / 1000000).toFixed(1)}M`,
            icon: DollarSign,
            gradient: "from-emerald-500 to-teal-500",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-600",
            trend: "+8%",
            trendUp: true,
            suffix: "đ",
        },
        {
            title: "Sản phẩm sắp hết",
            value: stats.lowStockItems,
            icon: AlertTriangle,
            gradient: "from-amber-500 to-orange-500",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
            trend: "-3",
            trendUp: false,
        },
        {
            title: "Đơn hàng chờ",
            value: stats.pendingOrders,
            icon: ShoppingCart,
            gradient: "from-purple-500 to-pink-500",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-600",
            trend: "+5",
            trendUp: true,
        },
    ]

    const quickActions = [
        {
            title: "Tạo đơn hàng",
            icon: ShoppingCart,
            href: "/orders/new",
            gradient: "from-blue-500 to-purple-500",
        },
        {
            title: "Nhập kho",
            icon: PackagePlus,
            href: "/receipts",
            gradient: "from-emerald-500 to-teal-500",
        },
        {
            title: "Xuất kho",
            icon: PackageMinus,
            href: "/issues",
            gradient: "from-rose-500 to-pink-500",
        },
        {
            title: "Chuyển kho",
            icon: ArrowLeftRight,
            href: "/transfers",
            gradient: "from-violet-500 to-purple-500",
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Sparkles className="w-12 h-12 text-primary" />
                </motion.div>
            </div>
        )
    }

    return (
        <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Header */}
            <motion.div variants={staggerItem} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-from to-primary-to opacity-5 rounded-2xl" />
                <div className="relative p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2">
                                <span className="text-gradient">Dashboard</span>
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.
                            </p>
                        </div>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Zap className="w-16 h-16 text-amber-500" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                variants={staggerItem}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {statCards.map((card, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Card variant="elevated" className="relative overflow-hidden group">
                            {/* Gradient Background */}
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                                card.gradient
                            )} />

                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-3 rounded-xl", card.iconBg)}>
                                        <card.icon className={cn("w-6 h-6", card.iconColor)} />
                                    </div>
                                    <div className="flex items-center text-sm">
                                        {card.trendUp ? (
                                            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-rose-500 mr-1" />
                                        )}
                                        <span
                                            className={cn(
                                                "font-semibold",
                                                card.trendUp ? "text-emerald-500" : "text-rose-500"
                                            )}
                                        >
                                            {card.trend}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    {card.title}
                                </p>
                                <p className="text-3xl font-bold">
                                    {typeof card.value === 'number' ? (
                                        <AnimatedCounter value={card.value} />
                                    ) : (
                                        card.value
                                    )}
                                    {card.suffix && <span className="text-lg ml-1">{card.suffix}</span>}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={staggerItem}>
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                            Thao tác nhanh
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <Link key={index} href={action.href}>
                                    <motion.div
                                        className={cn(
                                            "relative overflow-hidden rounded-xl p-6 text-white cursor-pointer group",
                                            "bg-gradient-to-br shadow-lg hover:shadow-glow-lg transition-all duration-300",
                                            action.gradient
                                        )}
                                        whileHover={{ scale: 1.05, rotate: 2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                                        <action.icon className="w-8 h-8 mb-3" />
                                        <p className="text-sm font-semibold">{action.title}</p>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <motion.div variants={staggerItem}>
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle>Doanh thu 6 tháng gần đây</CardTitle>
                            <CardDescription>Biểu đồ doanh thu theo tháng</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000000}M`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "0.75rem",
                                            boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
                                        }}
                                        formatter={(value: any) =>
                                            `${(value / 1000000).toFixed(1)}M đ`
                                        }
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="url(#colorRevenue)"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: "#3b82f6" }}
                                        activeDot={{ r: 8, fill: "#8b5cf6" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stock by Category */}
                <motion.div variants={staggerItem}>
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle>Tồn kho theo danh mục</CardTitle>
                            <CardDescription>Phân bố sản phẩm theo danh mục</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stockByCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stockByCategoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "0.75rem",
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Low Stock Alert */}
            <AnimatePresence>
                {stats.lowStockItems > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-l-4 border-amber-500 p-6"
                    >
                        <div className="flex items-start">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <AlertTriangle className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                    Cảnh báo tồn kho!
                                </p>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                    Có <span className="font-bold">{stats.lowStockItems}</span> sản phẩm sắp hết hàng.
                                </p>
                                <Link
                                    href="/inventory/overview?filter=low-stock"
                                    className="text-sm text-amber-700 dark:text-amber-300 underline hover:text-amber-800 dark:hover:text-amber-200 mt-2 inline-flex items-center font-medium"
                                >
                                    Xem chi tiết <ArrowUpRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
