"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { showToast } from "@/components/ui/Toast"
import { User, Lock, Loader2, Eye, EyeOff, Warehouse } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"

const loginSchema = z.object({
    identifier: z.string().min(1, "Vui lòng nhập tên đăng nhập hoặc email"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
    rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
            rememberMe: false,
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Đăng nhập thất bại")
            }

            login(result.token, result.user)
            showToast("Đăng nhập thành công", "success")

            // Set cookie for middleware
            document.cookie = `token=${result.token}; path=/; max-age=${data.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60
                }`

            router.push("/dashboard")
        } catch (error: any) {
            showToast(error.message, "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <Card className="w-full max-w-md z-10 shadow-2xl border-t-4 border-t-blue-600">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Warehouse className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        Đăng nhập
                    </CardTitle>
                    <CardDescription className="text-base">
                        Hệ thống quản lý kho Triệu Lợi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="identifier"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Tên đăng nhập hoặc Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="identifier"
                                        placeholder="Nhập tài khoản đi chứ"
                                        className={`pl-10 ${errors.identifier ? "border-red-500 focus-visible:ring-red-500" : ""
                                            }`}
                                        {...register("identifier")}
                                    />
                                </div>
                                {errors.identifier && (
                                    <p className="text-sm text-red-500">
                                        {errors.identifier.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••"
                                        className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                                            }`}
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    {...register("rememberMe")}
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-lg h-12"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                        © 2025 Kho Triệu Lợi. All rights reserved.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
