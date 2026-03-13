import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { enqueueUpload } from '../../../lib/queue';
import { Visibility } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const userId = (req.headers['x-user-id'] as string) || (req.body?.userId as string);
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const { accountId, s3Key, title, description, tags, hashtags, thumbnailKey, visibility, scheduledAt } = req.body as {
    accountId: string;
    s3Key: string;
    title: string;
    description?: string;
    tags?: string[];
    hashtags?: string[];
    thumbnailKey?: string;
    visibility?: Visibility;
    scheduledAt?: string | null;
  };

  const account = await prisma.socialAccount.findFirst({ where: { id: accountId, userId, provider: 'YOUTUBE' } });
  if (!account) return res.status(404).json({ error: 'Account not found' });

  const video = await prisma.video.create({
    data: {
      userId,
      s3Key,
      title,
      description: description || null,
      tags: tags || [],
      hashtags: hashtags || [],
      thumbnailKey: thumbnailKey || null,
      visibility: visibility || 'PUBLIC',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  const target = await prisma.uploadTarget.create({
    data: {
      videoId: video.id,
      accountId: account.id,
      provider: 'YOUTUBE',
      status: 'PENDING',
    },
  });

  const delay = scheduledAt ? Math.max(0, new Date(scheduledAt).getTime() - Date.now()) : 0;
  await enqueueUpload(target.id, delay);

  res.json({ videoId: video.id, uploadTargetId: target.id });
}
