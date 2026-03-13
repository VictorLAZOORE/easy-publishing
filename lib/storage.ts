import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return { url, key };
}

export function publicFileUrl(key: string) {
  // Si vous utilisez CloudFront/R2: retournez l’URL publique
  return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
}

export async function getReadUrl(key: string, expiresIn = 3600) {
  const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return url;
}

export async function getObjectContentLength(key: string): Promise<number | null> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
    return head.ContentLength ?? null;
  } catch {
    return null;
  }
}