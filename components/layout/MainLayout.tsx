"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { Toaster } from "@/components/ui/Toaster"
import { TooltipProvider } from "@/components/ui/Tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
    const pathname = usePathname()

    // Don't show layout on login page
    const isLoginPage = pathname === "/login" || pathname === "/register"

    if (isLoginPage) {
        return <>{children}</>
    }

    return (
        <TooltipProvider>
            <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                <div className="flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out">
                    <Header />
                    <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                        <div className="mx-auto max-w-7xl space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={pathname}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>

                <Toaster />
            </div>
        </TooltipProvider>
    )
}
