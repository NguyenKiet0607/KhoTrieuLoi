import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import { Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: { id: string; name: string } | null;
}

export default function ChangePasswordModal({ isOpen, onClose, user }: ChangePasswordModalProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (password.length < 6) {
            showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        try {
            setLoading(true);
            await apiClient.put(`/users/${user.id}`, { password });
            showToast('Đổi mật khẩu thành công', 'success');
            onClose();
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            showToast(error.response?.data?.error || 'Lỗi khi đổi mật khẩu', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Đổi mật khẩu cho ${user.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Mật khẩu mới</label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        disabled={loading}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
