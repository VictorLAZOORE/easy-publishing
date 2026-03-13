import { UploadTarget, Video } from '@prisma/client';

export async function handleTikTokUpload(_target: UploadTarget & { video: Video; account: any }) {
  throw new Error('TikTok upload provider not implemented yet');
}
