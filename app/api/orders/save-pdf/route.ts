import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const filename = formData.get('filename') as string || `order-${Date.now()}.pdf`;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const targetDir = 'H:\\My Drive\\Tổng Hợp Các Chứng Từ\\orders';

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, filename);
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ success: true, path: filePath });
    } catch (error) {
        console.error('Error saving PDF:', error);
        return NextResponse.json({ error: 'Failed to save PDF' }, { status: 500 });
    }
}
