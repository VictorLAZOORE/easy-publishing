import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { getSessionFromApiRequest } from '../../../../lib/auth/session';
import { getAppBaseUrl } from '../../../../lib/env';

function getRedirectUri() {
  return `${getAppBaseUrl()}/api/oauth/youtube/callback`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSessionFromApiRequest(req);
  const userId = session?.uid;
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
