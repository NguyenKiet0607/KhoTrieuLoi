import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'company-config.json');

const DEFAULT_CONFIG = {
    companyName: 'CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ TRIỆU LỢI',
    companyAddress: '525/15/21 Lê Trọng Tấn, Phường Tây Thạnh, Thành phố HCM',
    companyPhone: '028 625 99973 - 0358 768 434',
    logoPath: '/logo/logo.png'
};

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Read config from file
        if (existsSync(CONFIG_PATH)) {
            const data = await readFile(CONFIG_PATH, 'utf-8');
            return NextResponse.json(JSON.parse(data));
        }

        // Return default values
        return NextResponse.json(DEFAULT_CONFIG);
    } catch (error) {
        console.error('Error fetching company config:', error);
        return NextResponse.json(DEFAULT_CONFIG);
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid || authResult.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Save to file
        await writeFile(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error saving company config:', error);
        return NextResponse.json(
            { error: 'Failed to save config' },
            { status: 500 }
        );
    }
}
