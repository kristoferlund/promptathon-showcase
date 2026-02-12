import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;  // e.g., https://images.yourdomain.com
};

export class R2Uploader {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(config: R2Config) {
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl || `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadImage(key: string, imageBuffer: Buffer, contentType: string = 'image/jpeg'): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await this.s3Client.send(command);

    return `${this.publicUrl}/${key}`;
  }

  async uploadScreenshots(id: string, largeBuf: Buffer, smallBuf: Buffer): Promise<{ large: string; small: string }> {
    const [large, small] = await Promise.all([
      this.uploadImage(`${id}_1500.jpg`, largeBuf),
      this.uploadImage(`${id}_200.jpg`, smallBuf),
    ]);

    return { large, small };
  }
}
