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
        const lastBackup = fs.existsSync(backupDir)
            ? fs.readdirSync(backupDir)
                .filter(file => file.endsWith('.db'))
                .sort()
                .pop()
            : null;

        return NextResponse.json({
            enabled: true,
            location: backupDir,
            lastBackup: lastBackup ? {
                name: lastBackup,
                date: fs.statSync(path.join(backupDir, lastBackup)).mtime
            } : null
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch backup info' }, { status: 500 });
    }
}
