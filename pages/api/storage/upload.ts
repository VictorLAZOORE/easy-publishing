import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadStream } from '../../../lib/storage';
import { getSessionFromApiRequest } from '../../../lib/auth/session';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getSessionFromApiRequest(req);
  const userId = session?.uid;
  const key = req.headers['x-key'] as string;
  if (!userId || !key) return res.status(400).json({ error: 'Missing user context or x-key header' });

  if (!key.startsWith(userId + '/')) return res.status(403).json({ error: 'Key must be under user path' });

  try {
    const contentType = (req.headers['content-type'] as string) || 'application/octet-stream';
    await uploadStream(key, req, { contentType });
    res.status(200).json({ key });
  } catch (err) {
    console.error('Upload to GCS failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
}
