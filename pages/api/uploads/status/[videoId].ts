import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query as { videoId: string };
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  const targets = await prisma.uploadTarget.findMany({ where: { videoId }, orderBy: { createdAt: 'asc' } });
  res.json({ targets });
}
