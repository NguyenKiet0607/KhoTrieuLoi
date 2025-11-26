import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid || authResult.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('logo') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PNG and JPG are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define paths
        const logoDir = path.join(process.cwd(), 'public', 'logo');
        const logoPath = path.join(logoDir, 'logo.png');

        // Delete old logo if exists
        if (existsSync(logoPath)) {
            await unlink(logoPath);
        }

        // Save new logo
        await writeFile(logoPath, buffer);

        return NextResponse.json({
            success: true,
            path: '/logo/logo.png',
            message: 'Logo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading logo:', error);
        return NextResponse.json(
            { error: 'Failed to upload logo' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid || authResult.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const logoPath = path.join(process.cwd(), 'public', 'logo', 'logo.png');

        if (existsSync(logoPath)) {
            await unlink(logoPath);
        }

        return NextResponse.json({
            success: true,
            message: 'Logo deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting logo:', error);
        return NextResponse.json(
            { error: 'Failed to delete logo' },
            { status: 500 }
        );
    }
}
