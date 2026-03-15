import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const results = {
        deletedFiles: 0,
        cancelledPayments: 0,
        deletedProjects: 0,
        errors: [] as string[]
    };

    try {
        // 1. CLEANUP STORAGE LEAKS (public/temp)
        // Delete all files in public/temp older than 24 hours
        const publicTempDir = path.join(process.cwd(), 'public', 'temp');
        if (fs.existsSync(publicTempDir)) {
            const files = fs.readdirSync(publicTempDir);
            const now = Date.now();
            const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

            files.forEach(file => {
                const filePath = path.join(publicTempDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    const ageMs = now - stats.mtimeMs;
                    
                    if (ageMs > MAX_AGE_MS && stats.isFile()) {
                        fs.unlinkSync(filePath);
                        results.deletedFiles++;
                    }
                } catch (err: any) {
                    results.errors.push(`Failed to delete file ${file}: ${err.message}`);
                }
            });
        }

        // 2. CLEANUP STALE PAYMENT REQUESTS
        // Cancel PENDING_PAYOS requests older than 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const stalePayments = await prisma.paymentRequest.updateMany({
            where: {
                status: 'PENDING_PAYOS',
                createdAt: {
                    lt: oneDayAgo
                }
            },
            data: {
                status: 'CANCELLED',
                note: 'Auto-cancelled by system after 24h'
            }
        });
        results.cancelledPayments = stalePayments.count;

        // 3. CLEANUP ABANDONED DUBBING PROJECTS
        // Delete processing/completed projects older than 48 hours to save DB space
        // since they have no UI to access them anyway.
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const staleProjects = await prisma.dubbingProject.deleteMany({
            where: {
                createdAt: {
                    lt: twoDaysAgo
                }
            }
        });
        results.deletedProjects = staleProjects.count;

    } catch (error: any) {
        console.error('CRON Cleanup Error:', error);
        return res.status(500).json({ error: error.message, results });
    }

    return res.status(200).json({
        success: true,
        message: 'System resources cleaned up successfully',
        ...results
    });
}
