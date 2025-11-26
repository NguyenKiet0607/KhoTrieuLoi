"use client"

import * as React from "react"
import { useAuthStore } from "@/stores/authStore"
import { Bell, Search, User, LogOut, Settings, Sun, Moon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { cn } from "@/lib/utils"

export default function Header() {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const [theme, setTheme] = React.useState<"light" | "dark">("light")

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        document.documentElement.classList.toggle("dark")
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-6">
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl hidden md:block">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
                        icon={Search}
                        className="bg-muted/50 border-muted-foreground/20 focus-visible:bg-background transition-colors"
                    />
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-2 ml-auto">
                    {/* Theme Toggle */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleTheme}
                                    className="rounded-full"
                                >
                                    {theme === "light" ? (
                                        <Moon className="h-5 w-5" />
                                    ) : (
                                        <Sun className="h-5 w-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Chuyển chế độ {theme === "light" ? "tối" : "sáng"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative rounded-full">
                                <Bell className="h-5 w-5" />
                                <Badge
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                                >
                                    2
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                <div className="px-2 py-3 hover:bg-muted/50 cursor-pointer transition-colors rounded-md">
                                    <p className="text-sm font-medium">Sản phẩm sắp hết hàng</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        5 sản phẩm dưới mức tồn kho tối thiểu
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        2 giờ trước
                                    </p>
                                </div>
                                <div className="px-2 py-3 hover:bg-muted/50 cursor-pointer transition-colors rounded-md">
                                    <p className="text-sm font-medium">Đơn hàng mới</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Đơn hàng #ORD-001 cần xử lý
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        5 giờ trước
                                    </p>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="p-2">
                                <Button variant="ghost" className="w-full h-auto p-2 text-xs">
                                    Xem tất cả
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 pl-2 pr-4 rounded-full hover:bg-muted/50"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar} alt={user?.name} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {user?.name ? getInitials(user.name) : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {user?.role || "USER"}
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/users/" + user?.id)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Hồ sơ</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Cài đặt</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
