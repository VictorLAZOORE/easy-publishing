import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../lib/prisma';
import { handleYouTubeUpload } from '../lib/providers/youtube';
import { handleFacebookUpload } from '../lib/providers/facebook';
import { handleInstagramUpload } from '../lib/providers/instagram';
import { handleTikTokUpload } from '../lib/providers/tiktok';

const connection = new IORedis(process.env.REDIS_URL!);

const worker = new Worker('upload-queue', async (job: Job) => {
  const { uploadTargetId } = job.data as { uploadTargetId: string };

  const target = await prisma.uploadTarget.findUnique({
    where: { id: uploadTargetId },
    include: { video: true, account: true },
  });
  if (!target) return;

  // Scheduling
  if (target.video.scheduledAt && target.video.scheduledAt.getTime() > Date.now()) {
    const delay = target.video.scheduledAt.getTime() - Date.now();
    throw new Error(`Not time yet; retry later (${delay}ms)`); // backoff/attempts géreront le report
  }

  await prisma.uploadTarget.update({ where: { id: target.id }, data: { status: 'UPLOADING', startedAt: new Date(), progress: 5 } });

  try {
    switch (target.provider) {
      case 'YOUTUBE':
        await handleYouTubeUpload(target);
        break;
      case 'FACEBOOK':
        await handleFacebookUpload(target);
        break;
      case 'INSTAGRAM':
        await handleInstagramUpload(target);
        break;
      case 'TIKTOK':
        await handleTikTokUpload(target);
        break;
    }
    await prisma.uploadTarget.update({ where: { id: target.id }, data: { status: 'PUBLISHED', progress: 100, publishedAt: new Date() } });
  } catch (e: any) {
    await prisma.uploadTarget.update({ where: { id: target.id }, data: { status: 'ERROR', errorMessage: e?.message ?? 'Unknown error' } });
  }
}, { connection, concurrency: 5 });

worker.on('completed', (job) => console.log('completed', job.id));
worker.on('failed', (job, err) => console.error('failed', job?.id, err));