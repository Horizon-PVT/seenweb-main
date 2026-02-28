// pages/api/user/update-profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { name, phoneNumber } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Tên không được để trống' });
        }

        // Update the user in the database
        const updatedUser = await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                name: name.trim(),
                // If you added a phone number to your schema, uncomment the next line:
                // phoneNumber: phoneNumber?.trim() || null, 
                // Note: For now, if phoneNumber is missing from schema, we skip DB or store in metadata if applicable.
            },
        });

        // We return success. The client session might need a force refresh (via next-auth update hook).
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: { name: updatedUser.name }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Internal server error while updating profile' });
    }
}
