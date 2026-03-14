import type { NextApiRequest, NextApiResponse } from 'next';
import { listBucketFiles } from '../../../lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const userId = req.headers['x-user-id'] as string;
  const prefix = userId ? `${userId}/` : undefined;

  try {
    const files = await listBucketFiles(prefix, 100);
    res.status(200).json({ files });
  } catch (err) {
    console.error('Bucket list error:', err);
    res.status(500).json({ error: 'Impossible de lister le bucket' });
  }
}
