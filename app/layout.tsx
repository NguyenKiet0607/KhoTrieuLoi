import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Kho Trieu Loi",
    description: "Hệ thống quản lý kho Triệu Lợi",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <head>
            </head>
            <body className={inter.className}>
                <AuthProvider>
                    <div className="flex h-screen bg-gray-100">
                        <Sidebar />
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 md:ml-64 transition-all duration-300">
                            {children}
                        </main>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
