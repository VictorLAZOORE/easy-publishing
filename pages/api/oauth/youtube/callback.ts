import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { SESSION_COOKIE_NAME } from '../../../../lib/auth/session';
import { verifySessionToken } from '../../../../lib/auth/jwt';
import { getAppBaseUrl } from '../../../../lib/env';

function getRedirectUri() {
  return `${getAppBaseUrl()}/api/oauth/youtube/callback`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query as { code: string; state?: string };
  if (!code) return res.status(400).json({ error: 'Missing code' });
  let userId: string | undefined;
  try {
    if (state) {
      const parsed = JSON.parse(state);
      userId = parsed.userId;
    }
  } catch {}
  if (!userId) {
    const cookieHeader = req.headers.cookie || '';
    const token = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`))?.[1];
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';
    const session = token ? await verifySessionToken(decodeURIComponent(token), secret) : null;
    userId = session?.uid;
  }
  if (!userId) return res.status(400).json({ error: 'Missing user context' });

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    getRedirectUri()
  );

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });
  const channelRes = await youtube.channels.list({ part: ['snippet'], mine: true });
  const channel = channelRes.data.items?.[0];
  if (!channel) return res.status(400).json({ error: 'No YouTube channel found for this account' });

  const accessToken = tokens.access_token!;
  const refreshToken = tokens.refresh_token || undefined;
  const tokenExpiresAt = tokens.expiry_date
    ? new Date(tokens.expiry_date).toISOString()
    : undefined;

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  const baseUrl = getAppBaseUrl();

  let upsertRes: Response;
  try {
    upsertRes = await fetch(`${backendUrl}/accounts/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        provider: 'YOUTUBE',
        externalId: channel.id!,
        displayName: channel.snippet?.title || 'YouTube Channel',
        avatarUrl: channel.snippet?.thumbnails?.default?.url || undefined,
        accessToken,
        refreshToken: refreshToken || '',
        tokenExpiresAt: tokenExpiresAt || null,
        scope: 'youtube.upload youtube.readonly',
      }),
    });
  } catch (e) {
    console.error('Backend unreachable:', e);
    return res.redirect(`${baseUrl}/accounts?error=backend_unavailable`);
  }

  if (!upsertRes.ok) {
    const err = await upsertRes.json().catch(() => ({}));
    console.error('Backend accounts/upsert failed:', err);
    return res.redirect(`${baseUrl}/accounts?error=save_failed`);
  }

  res.redirect(`${baseUrl}/accounts?connected=youtube`);
}
