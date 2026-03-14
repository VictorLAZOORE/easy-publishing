import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const userId = (req.headers['x-user-id'] as string) || (req.body?.userId as string);
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  const url = new URL('/upload', backendUrl);

  let resp: Response;
  try {
    resp = await fetch(url.toString(), {
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
  } catch (err) {
    console.error('Backend unreachable:', err);
    return res.status(502).json({ error: 'Backend indisponible. Lancez-le avec: npm run backend' });
  }

  let data: { videoId?: string; targets?: Array<{ videoId?: string }>; error?: string } = {};
  try {
    data = (await resp.json()) as typeof data;
  } catch {
    return res.status(502).json({ error: 'Réponse backend invalide' });
  }
  // Garantir videoId pour le front (backend envoie videoId + targets)
  if (resp.ok && !data.videoId && data.targets?.length) {
    data = { ...data, videoId: data.targets[0].videoId };
  }
  res.status(resp.status).json(data);
}
