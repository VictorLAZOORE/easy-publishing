import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadStream } from '../../../lib/storage';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = req.headers['x-user-id'] as string;
  const key = req.headers['x-key'] as string;
  if (!userId || !key) return res.status(400).json({ error: 'Missing x-user-id or x-key header' });

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
