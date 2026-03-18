import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromApiRequest } from '../../../lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSessionFromApiRequest(req);
  const userId = session?.uid;
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

  const url = new URL('/accounts', backendUrl);
  url.searchParams.set('userId', userId);

  const resp = await fetch(url.toString(), {
    headers: { 'x-user-id': userId },
  });

  const data = await resp.json();
  res.status(resp.status).json(data);
}
