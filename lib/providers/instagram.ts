import { UploadTarget, Video } from '@prisma/client';

export async function handleInstagramUpload(_target: UploadTarget & { video: Video; account: any }) {
  throw new Error('Instagram upload provider not implemented yet');
}
