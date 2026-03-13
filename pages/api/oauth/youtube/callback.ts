import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { prisma } from '../../../../lib/prisma';

function getRedirectUri() {
  const base = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/oauth/youtube/callback`;
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
  if (!userId) return res.status(400).json({ error: 'Missing user context (state.userId)' });

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    getRedirectUri()
  );

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Use the tokens to fetch the channel info for the selected account
  const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });
  const channelRes = await youtube.channels.list({ part: ['snippet'], mine: true });
  const channel = channelRes.data.items?.[0];
  if (!channel) return res.status(400).json({ error: 'No YouTube channel found for this account' });

  const accessToken = tokens.access_token!;
  const refreshToken = tokens.refresh_token || undefined; // Might be undefined if not first consent; ensure prompt=consent
  const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined;

  // Upsert SocialAccount for this channel
  const account = await prisma.socialAccount.upsert({
    where: {
      // unique compound alternative would be (userId, provider, externalId), but here we use an id fallback
      // Use a synthetic unique key via (provider, externalId, userId)
      id: `${userId}-YOUTUBE-${channel.id}`,
    },
    create: {
      id: `${userId}-YOUTUBE-${channel.id}`,
      userId,
      provider: 'YOUTUBE',
      externalId: channel.id!,
      displayName: channel.snippet?.title || 'YouTube Channel',
      avatarUrl: channel.snippet?.thumbnails?.default?.url || undefined,
      accessToken,
      refreshToken,
      tokenExpiresAt: expiryDate,
      scope: 'youtube.upload youtube.readonly',
      meta: { kind: channel.kind, country: channel.snippet?.country },
    },
    update: {
      displayName: channel.snippet?.title || undefined,
      avatarUrl: channel.snippet?.thumbnails?.default?.url || undefined,
      accessToken,
      refreshToken: refreshToken || undefined,
      tokenExpiresAt: expiryDate,
    },
  });

  // Redirect back to accounts page
  const redirectTo = (process.env.APP_BASE_URL || 'http://localhost:3000') + '/accounts?connected=youtube';
  res.redirect(redirectTo);
}
