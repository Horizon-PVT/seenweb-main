import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

  // Lấy cookie aff_ref từ request
  const refCode = req.cookies.aff_ref;
  if (!refCode) return res.status(400).json({ error: 'No referral code' });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.referrerId) return res.status(400).json({ error: 'Already applied or no user' });

  const referrer = await prisma.user.findUnique({
    where: { affiliateCode: refCode },
  });

  if (referrer && referrer.isAffiliate) {
    await prisma.user.update({
      where: { id: user.id },
      data: { referrerId: referrer.id },
    });

    // Note: Referral tracking is managed via user.referrerId relation
    // Commission will be calculated when payment is confirmed

    // Clear cookie
    res.setHeader('Set-Cookie', 'aff_ref=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
    return res.status(200).json({ success: true });
  }

  res.status(400).json({ error: 'Invalid referral code' });
}