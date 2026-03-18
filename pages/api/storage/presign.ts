import type { NextApiRequest, NextApiResponse } from 'next';
import { getUploadUrl } from '../../../lib/storage';
import { getSessionFromApiRequest } from '../../../lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSessionFromApiRequest(req);
  const userId = session?.uid;
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const { filename, contentType } = req.body;
  const key = `${userId}/${Date.now()}-${filename}`;
  const { url } = await getUploadUrl(key, contentType);
  res.json({ url, key });
}