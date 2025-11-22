'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    accept?: string;
    maxSizeMB?: number;
    label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUploadComplete,
    accept = 'image/*,.pdf,.xlsx,.xls',
    maxSizeMB = 10,
    label = 'Tải lên file',
}) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            showToast(`File quá lớn. Tối đa ${maxSizeMB}MB`, 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const fileUrl = response.data.url;
            onUploadComplete(fileUrl);
            showToast('Tải file thành công', 'success');

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Lỗi khi tải file', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
                id="file-upload-input"
            />
            <label htmlFor="file-upload-input">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <i className="fas fa-upload mr-2"></i>
                    {uploading ? 'Đang tải...' : label}
                </Button>
            </label>
        </div>
    );
};
