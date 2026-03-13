import type { NextApiRequest, NextApiResponse } from 'next';
import { getUploadUrl } from '../../../lib/storage';
// import { getServerSession } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const session = await getServerSession(req, res, /* nextAuthOptions */);
  // Fallback MVP: accept x-user-id header if NextAuth not configured yet
  const userId = (req.headers['x-user-id'] as string) || (req.body?.userId as string);
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const { filename, contentType } = req.body;
  const key = `${userId}/${Date.now()}-${filename}`;
  const { url } = await getUploadUrl(key, contentType);
  res.json({ url, key });
}