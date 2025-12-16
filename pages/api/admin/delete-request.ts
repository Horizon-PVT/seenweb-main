import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { requestId } = req.body;

  try {
    await prisma.paymentRequest.delete({ where: { id: requestId } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi xóa đơn' });
  }
}