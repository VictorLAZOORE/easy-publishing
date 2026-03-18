import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!);

export const uploadQueue = new Queue('upload-queue', { connection: connection as any });

export type UploadJobData = {
  uploadTargetId: string;
};

export async function enqueueUpload(uploadTargetId: string, delayMs?: number) {
  await uploadQueue.add('upload', { uploadTargetId }, { delay: delayMs ?? 0, attempts: 3, backoff: { type: 'exponential', delay: 30000 } });
}