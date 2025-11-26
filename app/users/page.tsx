"use client"

import React, { useEffect, useState } from "react"
import apiClient from "@/lib/api"
import { showToast } from "@/components/ui/Toast"
import {
    Users as UsersIcon,
    Plus,
    Search,
    Edit,
    Trash2,
    Shield,
    Mail,
    RefreshCw,
    Key,
} from "lucide-react"
import { DataTable, Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import ChangePasswordModal from "@/components/users/ChangePasswordModal"

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("")

    // Modal state
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/users")
            setUsers(response.data || [])
        } catch (error: any) {
            console.error("Error fetching users:", error)
            showToast("Lỗi khi tải người dùng", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenPasswordModal = (user: any) => {
        setSelectedUser(user)
        setIsPasswordModalOpen(true)
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = !roleFilter || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const columns: Column<any>[] = [
        {
            header: "Tên",
            accessorKey: "name",
            sortable: true,
            cell: (user) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="font-medium">{user.name}</div>
                </div>
            ),
        },
        {
            header: "Email",
            accessorKey: "email",
            sortable: true,
            cell: (user) => (
                <div className="flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                </div>
            ),
        },
        {
            header: "Vai trò",
            accessorKey: "role",
            sortable: true,
            cell: (user) => (
                <Badge
                    variant={user.role === "ADMIN" ? "secondary" : "outline"}
                    className="gap-1"
                >
                    <Shield className="w-3 h-3" />
                    {user.role}
                </Badge>
            ),
        },
        {
            header: "Ngày tạo",
            accessorKey: "createdAt",
            sortable: true,
            cell: (user) => (
                <span className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            header: "Thao tác",
            className: "text-right",
            cell: (user) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        title="Đổi mật khẩu"
                        onClick={() => handleOpenPasswordModal(user)}
                    >
                        <Key className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Sửa"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Xóa"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-1">
                        Tổng số: <span className="font-semibold">{users.length}</span> người
                        dùng
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchUsers}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm người dùng
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="ADMIN">Admin</option>
                        <option value="USER">User</option>
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredUsers}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
                emptyMessage="Không tìm thấy người dùng nào"
            />

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                user={selectedUser}
            />
        </div>
    )
}
