import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  const url = new URL('/uploads/status', backendUrl);
  url.searchParams.set('userId', userId);

  const resp = await fetch(url.toString(), {
    headers: { 'x-user-id': userId },
  });
  const data = await resp.json();
  res.status(resp.status).json(data);
}
