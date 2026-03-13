import { prisma } from '../prisma';
import { UploadTarget, Video } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { getReadUrl } from '../storage';

function getOAuthClient(account: any) {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!);
  client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.tokenExpiresAt ? new Date(account.tokenExpiresAt).getTime() : undefined,
  });
  return client;
}

export async function handleYouTubeUpload(target: UploadTarget & { video: Video; account: any }) {
  const oAuth2Client = getOAuthClient(target.account);
  const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });

  // Signed GET URL to fetch the video from S3/R2
  const readUrl = await getReadUrl(target.video.s3Key);

  // Prepare metadata
  const privacyStatus = target.video.visibility === 'PRIVATE' ? 'private' : target.video.visibility === 'SCHEDULED' ? 'private' : 'public';

  // Create a readable stream from the remote file (Node 18+ has global fetch)
  const res = await fetch(readUrl);
  if (!res.ok || !res.body) throw new Error(`Failed to read source video: HTTP ${res.status}`);

  await prisma.uploadTarget.update({ where: { id: target.id }, data: { progress: 20 } });

  // Upload via googleapis client (resumable handled internally)
  const insertRes = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: target.video.title,
        description: target.video.description ?? '',
        tags: target.video.tags,
      },
      status: {
        privacyStatus,
        publishAt: target.video.scheduledAt ?? undefined,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: res.body as any,
    },
  } as any);

  const videoId = insertRes.data.id;
  if (!videoId) throw new Error('YouTube upload did not return a video ID');

  await prisma.uploadTarget.update({ where: { id: target.id }, data: { progress: 90 } });

  // Optionally set custom thumbnail later if available (thumbnails.set requires multipart upload)
  const remoteUrl = `https://www.youtube.com/watch?v=${videoId}`;
  await prisma.uploadTarget.update({ where: { id: target.id }, data: { remoteId: videoId, remoteUrl } });
}