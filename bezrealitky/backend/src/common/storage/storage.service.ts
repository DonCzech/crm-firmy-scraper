import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      endpoint: config.get('S3_ENDPOINT'),
      region: config.get('S3_REGION', 'eu-central-1'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY'),
        secretAccessKey: config.get('S3_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
    this.bucket = config.get('S3_BUCKET', 'bezrealitky');
  }

  async uploadBuffer(buffer: Buffer, mimeType: string, folder = 'media'): Promise<{ key: string; url: string }> {
    const ext = mimeType.split('/')[1] ?? 'bin';
    const key = `${folder}/${randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    const url = `${this.config.get('S3_ENDPOINT')}/${this.bucket}/${key}`;
    return { key, url };
  }

  async getPresignedUploadUrl(key: string, mimeType: string, expiresIn = 300): Promise<string> {
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: mimeType });
    return getSignedUrl(this.s3, cmd, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
