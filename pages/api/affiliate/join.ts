import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.isAffiliate) return res.status(400).json({ error: 'Already joined or invalid' });

  let code: string;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (await prisma.user.findUnique({ where: { affiliateCode: code } }));

  await prisma.user.update({
    where: { id: user.id },
    data: { isAffiliate: true, affiliateCode: code },
  });

  res.status(200).json({ success: true, code, link: `https://seenyt.net/?ref=${code}` });
}