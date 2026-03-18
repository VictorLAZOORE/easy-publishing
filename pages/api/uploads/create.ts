import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { enqueueUpload } from '../../../lib/queue';
import { Provider } from '@prisma/client';
import { getSessionFromApiRequest } from '../../../lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getSessionFromApiRequest(req);
  const userId = session?.uid;
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const { s3Key, title, description, tags, hashtags, thumbnailKey, visibility, scheduledAt, accountIds } = req.body as any;

  const video = await prisma.video.create({
    data: {
      userId,
      s3Key,
      title,
      description: description || null,
      tags: tags || [],
      hashtags: hashtags || [],
      thumbnailKey: thumbnailKey || null,
      visibility,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  const accounts = await prisma.socialAccount.findMany({ where: { id: { in: accountIds }, userId } });
  const targets = await prisma.$transaction(accounts.map((a) => prisma.uploadTarget.create({ data: {
    videoId: video.id,
    accountId: a.id,
    provider: a.provider as Provider,
  }})));

  // Enqueue (immédiat ou avec délai si scheduledAt)
  const delay = scheduledAt ? Math.max(0, new Date(scheduledAt).getTime() - Date.now()) : 0;
  await Promise.all(targets.map(t => enqueueUpload(t.id, delay)));

  res.json({ videoId: video.id, targets: targets.map(t => t.id) });
}