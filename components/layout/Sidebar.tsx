"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Package,
    Warehouse,
    ShoppingCart,
    FileText,
    Users,
    Settings,
    BarChart3,
    PackagePlus,
    PackageMinus,
    ArrowLeftRight,
    FolderTree,
    Shield,
    Activity,
    Database,
    ChevronLeft,
    ChevronRight,
    Menu,
    LogOut,
    HelpCircle,
    ChevronDown,
    MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/Separator"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { useAuthStore } from "@/stores/authStore"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

const menuItems = [
    {
        title: "Tổng quan",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        title: "Quản lý kho",
        icon: Warehouse,
        items: [
            { title: "Tổng quan tồn kho", icon: Package, href: "/inventory/overview" },
            { title: "Danh sách sản phẩm", icon: Package, href: "/products" },
            { title: "Danh mục", icon: FolderTree, href: "/categories" },
            { title: "Kho hàng", icon: Warehouse, href: "/warehouses" },
        ],
    },
    {
        title: "Giao dịch",
        icon: ShoppingCart,
        items: [
            { title: "Đơn hàng", icon: ShoppingCart, href: "/orders" },
            { title: "Nhập kho", icon: PackagePlus, href: "/receipts" },
            { title: "Xuất kho", icon: PackageMinus, href: "/issues" },
            { title: "Chuyển kho", icon: ArrowLeftRight, href: "/transfers" },
            { title: "Khách hàng", icon: Users, href: "/customers" },
        ],
    },
    {
        title: "Báo cáo",
        icon: BarChart3,
        items: [
            { title: "Tổng quan", icon: BarChart3, href: "/reports" },
            { title: "Tồn kho", icon: Package, href: "/reports/inventory" },
            { title: "Doanh thu", icon: ShoppingCart, href: "/reports/sales" },
        ],
    },
    {
        title: "Hệ thống",
        icon: Settings,
        items: [
            { title: "Chứng từ mẫu", icon: FileText, href: "/document-templates" },
            { title: "Cài đặt chứng từ", icon: Settings, href: "/document-settings" },
            { title: "Điều chỉnh tồn kho", icon: Settings, href: "/inventory/adjustments" },
            { title: "Người dùng", icon: Users, href: "/users" },
            { title: "Phân quyền", icon: Shield, href: "/admin/permissions" },
            { title: "Nhật ký", icon: Activity, href: "/activity-logs" },
            { title: "Sao lưu", icon: Database, href: "/admin/backup" },
            { title: "Cấu hình", icon: Settings, href: "/settings" },
        ],
    },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const [openMenus, setOpenMenus] = React.useState<string[]>(["Quản lý kho", "Giao dịch"])
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    const toggleMenu = (title: string) => {
        if (collapsed) return
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        )
    }

    const isActive = (href: string) => {
        return pathname === href || pathname?.startsWith(href + "/")
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-card/95 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl border border-border/50">
            {/* Logo Area */}
            <div className={cn(
                "flex h-20 items-center px-6 transition-all duration-300 flex-shrink-0",
                collapsed ? "justify-center px-2" : "justify-between"
            )}>
                <Link href="/dashboard" className="flex items-center space-x-3 group overflow-hidden whitespace-nowrap">
                    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                        <span className="text-xl font-bold">TL</span>
                    </div>
                    <motion.div
                        initial={false}
                        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col overflow-hidden"
                    >
                        <span className="text-lg font-bold text-foreground leading-none tracking-tight">Triệu Lợi</span>
                        <span className="text-[10px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">Warehouse</span>
                    </motion.div>
                </Link>
            </div>

            {/* Menu Items */}
            <ScrollArea className="flex-1 px-3 py-2">
                <nav className="space-y-1.5">
                    <TooltipProvider delayDuration={0}>
                        <LayoutGroup>
                            {menuItems.map((item) => {
                                const isParentActive = item.items?.some(sub => isActive(sub.href))
                                const isOpen = openMenus.includes(item.title)

                                if (item.items) {
                                    return (
                                        <div key={item.title} className="mb-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => !collapsed && toggleMenu(item.title)}
                                                        className={cn(
                                                            "w-full justify-between group transition-all duration-200 relative overflow-hidden rounded-xl",
                                                            collapsed ? "h-12 w-12 p-0 mx-auto" : "h-11 px-4",
                                                            isParentActive
                                                                ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                                : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        <div className="flex items-center flex-1 overflow-hidden">
                                                            <item.icon className={cn(
                                                                "h-[1.15rem] w-[1.15rem] flex-shrink-0 transition-colors",
                                                                !collapsed && "mr-3",
                                                                isParentActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                                            )} />
                                                            <motion.span
                                                                initial={false}
                                                                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                                                                transition={{ duration: 0.2 }}
                                                                className="whitespace-nowrap overflow-hidden font-medium"
                                                            >
                                                                {item.title}
                                                            </motion.span>
                                                        </div>
                                                        {!collapsed && (
                                                            <motion.div
                                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                                                            </motion.div>
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                {collapsed && (
                                                    <TooltipContent side="right" className="font-medium z-50 ml-2">
                                                        <p>{item.title}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>

                                            <AnimatePresence initial={false}>
                                                {!collapsed && isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="ml-4 mt-1 space-y-1 pl-3 border-l-2 border-border/40">
                                                            {item.items.map((subItem) => (
                                                                <Link
                                                                    key={subItem.href}
                                                                    href={subItem.href}
                                                                    className={cn(
                                                                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden group/item",
                                                                        isActive(subItem.href)
                                                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium"
                                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                                    )}
                                                                >
                                                                    <span className="whitespace-nowrap truncate">{subItem.title}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                }

                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href!}
                                                className={cn(
                                                    "flex items-center rounded-xl transition-all duration-200 mb-2 relative overflow-hidden",
                                                    collapsed ? "h-12 w-12 justify-center mx-auto" : "h-11 px-4",
                                                    isActive(item.href!)
                                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                                )}
                                            >
                                                <item.icon className={cn("h-[1.15rem] w-[1.15rem] flex-shrink-0", !collapsed && "mr-3")} />
                                                <motion.span
                                                    initial={false}
                                                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                                                    transition={{ duration: 0.2 }}
                                                    className="font-medium whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.title}
                                                </motion.span>
                                            </Link>
                                        </TooltipTrigger>
                                        {collapsed && (
                                            <TooltipContent side="right" className="font-medium z-50 ml-2">
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                )
                            })}
                        </LayoutGroup>
                    </TooltipProvider>
                </nav>
            </ScrollArea>

            {/* Profile Section */}
            <div className="p-4 mt-auto">
                <div className={cn(
                    "rounded-xl bg-muted/40 border border-border/50 p-3 transition-all duration-300",
                    collapsed ? "p-2 bg-transparent border-0" : ""
                )}>
                    <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <motion.div
                                initial={false}
                                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                                className="flex flex-col overflow-hidden"
                            >
                                <span className="text-sm font-semibold truncate">{user?.name || "User"}</span>
                                <span className="text-xs text-muted-foreground truncate">{user?.role || "Admin"}</span>
                            </motion.div>
                        </div>

                        {!collapsed && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background rounded-lg">
                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Hồ sơ</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Cài đặt</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className={cn(
                        "w-full mt-2 text-muted-foreground hover:text-foreground hover:bg-transparent",
                        collapsed ? "h-8 w-8 p-0" : "h-8"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <div className="flex items-center text-xs font-medium uppercase tracking-wider opacity-70">
                            <ChevronLeft className="mr-1 h-3 w-3" />
                            Thu gọn
                        </div>
                    )}
                </Button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="fixed left-4 top-4 z-50 md:hidden">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="shadow-lg bg-background rounded-xl"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 p-4 md:hidden"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.div
                className={cn(
                    "hidden h-screen md:flex sticky top-0 left-0 z-40 p-4 will-change-[width]",
                )}
                initial={false}
                animate={{ width: collapsed ? 100 : 290 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
                <SidebarContent />
            </motion.div>
        </>
    )
}
