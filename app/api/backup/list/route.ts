import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.db') || file.endsWith('.zip'))
            .map(file => {
                const stats = fs.statSync(path.join(backupDir, file));
                return {
                    name: file,
                    size: stats.size,
                    createdAt: stats.birthtime,
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return NextResponse.json(files);
    } catch (error) {
        console.error('Error fetching backups:', error);
        return NextResponse.json(
            { error: 'Failed to fetch backups' },
            { status: 500 }
        );
    }
}
