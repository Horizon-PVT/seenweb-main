import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const email = req.query.email as string || 'kevin687979@gmail.com';
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email.toLowerCase(),
                    mode: 'insensitive'
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({
            id: user.id,
            email: user.email,
            role: user.role,
            membershipExpiry: user.membershipExpiry,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
