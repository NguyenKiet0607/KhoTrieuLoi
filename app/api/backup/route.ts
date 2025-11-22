import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

// POST /api/backup - Tạo backup database
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        const backupDir = path.join(process.cwd(), 'backups');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupPath = path.join(backupDir, `manual-backup-${timestamp}.db`);

        // Ensure backup directory exists
        await fs.mkdir(backupDir, { recursive: true });

        // Copy database file
        await fs.copyFile(dbPath, backupPath);

        const stats = await fs.stat(backupPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        return NextResponse.json({
            message: 'Backup created successfully',
            filename: `manual-backup-${timestamp}.db`,
            size: `${sizeMB} MB`,
            path: backupPath,
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
    }
}
