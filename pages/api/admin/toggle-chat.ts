import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MOD')) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const setting = await prisma.systemSetting.findUnique({ where: { key: 'AUTO_CHAT_ENABLED' } });
        return res.status(200).json({ enabled: setting?.value === 'true' });
    }

    if (req.method === 'POST') {
        const { enabled } = req.body;
        await prisma.systemSetting.upsert({
            where: { key: 'AUTO_CHAT_ENABLED' },
            create: { key: 'AUTO_CHAT_ENABLED', value: String(enabled) },
            update: { value: String(enabled) }
        });
        return res.status(200).json({ success: true });
    }

    res.status(405).json({ message: 'Method not allowed' });
}
