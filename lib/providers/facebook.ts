import { UploadTarget, Video } from '@prisma/client';

export async function handleFacebookUpload(_target: UploadTarget & { video: Video; account: any }) {
  throw new Error('Facebook upload provider not implemented yet');
}
