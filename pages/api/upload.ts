import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const userId = (req.headers['x-user-id'] as string) || (req.body?.userId as string);
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  const url = new URL('/upload', backendUrl);

  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({
      ...req.body,
      userId,
    }),
  });

  const data = await resp.json();
  res.status(resp.status).json(data);
}
