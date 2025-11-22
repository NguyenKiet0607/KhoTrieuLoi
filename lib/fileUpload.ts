import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number): string | null => {
    if (!allowedTypes.includes(file.type)) {
        return `Loại file không hợp lệ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return `Kích thước file quá lớn. Tối đa: ${maxSizeMB}MB`;
    }

    return null;
};

export const saveFile = async (file: File): Promise<string> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const fileName = `${randomUUID()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.promises.writeFile(filePath, buffer);

    return `/uploads/${fileName}`;
};

export const deleteFile = async (fileUrl: string): Promise<boolean> => {
    try {
        const fileName = path.basename(fileUrl);
        const filePath = path.join(UPLOAD_DIR, fileName);

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};
