import { NextRequest, NextResponse } from 'next/server';
import { saveFile, validateFile } from '@/lib/fileUpload';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const auth = await verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file (allow images, PDFs, Excel)
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        const error = validateFile(file, allowedTypes, 10); // Max 10MB

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        // Save file
        const fileUrl = await saveFile(file);

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
