import { Storage } from '@google-cloud/storage';
import type { Readable } from 'stream';

const bucketName = process.env.GCS_BUCKET!;
const storage = new Storage();
const bucket = storage.bucket(bucketName);

/** Upload a stream to GCS (avoids CORS by proxying through the server). */
export function uploadStream(
  key: string,
  stream: Readable,
  options: { contentType?: string } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = bucket.file(key);
    const writeStream = file.createWriteStream({
      resumable: false,
      contentType: options.contentType || 'application/octet-stream',
    });
    stream.pipe(writeStream);
    writeStream.on('error', reject);
    writeStream.on('finish', () => resolve());
  });
}

export async function getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const file = bucket.file(key);
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + expiresIn * 1000,
    contentType,
  });
  return { url, key };
}

export function publicFileUrl(key: string) {
  return `https://storage.googleapis.com/${bucketName}/${key}`;
}

export async function getReadUrl(key: string, expiresIn = 3600) {
  const file = bucket.file(key);
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresIn * 1000,
  });
  return url;
}

export async function getObjectContentLength(key: string): Promise<number | null> {
  try {
    const [meta] = await bucket.file(key).getMetadata();
    const size = meta.size ? Number(meta.size) : NaN;
    return Number.isNaN(size) ? null : size;
  } catch {
    return null;
  }
}

