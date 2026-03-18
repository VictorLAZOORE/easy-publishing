import type { NextApiRequest, NextApiResponse } from 'next';
import { listBucketFiles, getReadUrl } from '../../../lib/storage';
import { getSessionFromApiRequest } from '../../../lib/auth/session';

const MAX_FILES_WITH_URL = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getSessionFromApiRequest(req);
  const userId = session?.uid;
  if (!userId) return res.status(401).json({ error: 'Missing user context' });
  const prefix = `${userId}/`;

  try {
    const files = await listBucketFiles(prefix, MAX_FILES_WITH_URL);
    const withUrls = await Promise.all(
      files.map(async (f) => {
        const url = await getReadUrl(f.name, 3600);
        return { ...f, url };
      })
    );
    res.status(200).json({ files: withUrls });
  } catch (err) {
    console.error('Bucket list error:', err);
    res.status(500).json({ error: 'Impossible de lister le bucket' });
  }
}
