import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import MainLayout from "@/components/layout/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Kho Triệu Lợi - Hệ thống quản lý kho",
    description: "Hệ thống quản lý kho hàng chuyên nghiệp",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head />
            <body className={inter.className} suppressHydrationWarning>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <MainLayout>
                            {children}
                        </MainLayout>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
