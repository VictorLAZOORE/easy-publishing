import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

function getRedirectUri() {
  // Prefer explicit APP_BASE_URL, fallback to NEXTAUTH_URL for local dev
  const base = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/oauth/youtube/callback`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For MVP, accept x-user-id header to bind the account. Replace with NextAuth session in production.
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: 'Missing user context' });

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    getRedirectUri()
  );

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent select_account',
    include_granted_scopes: true,
    state: JSON.stringify({ userId }),
  } as any);

  res.redirect(url);
}
