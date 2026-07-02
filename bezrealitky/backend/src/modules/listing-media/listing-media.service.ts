import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class ListingMediaService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private config: ConfigService,
  ) {}

  async uploadMedia(listingId: string, ownerId: string, buffer: Buffer, mimeType: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (listing.ownerId !== ownerId) throw new ForbiddenException();

    const { key, url } = await this.storage.uploadBuffer(buffer, mimeType, `listings/${listingId}`);
    const count = await this.prisma.listingMedia.count({ where: { listingId } });

    return this.prisma.listingMedia.create({
      data: { listingId, url, key, mimeType, size: buffer.length, order: count, isCover: count === 0 },
    });
  }

  async reorder(listingId: string, ownerId: string, orderedIds: string[]) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (listing.ownerId !== ownerId) throw new ForbiddenException();

    await Promise.all(
      orderedIds.map((id, index) =>
        this.prisma.listingMedia.update({
          where: { id },
          data: { order: index, isCover: index === 0 },
        }),
      ),
    );
    return true;
  }

  async delete(mediaId: string, ownerId: string) {
    const media = await this.prisma.listingMedia.findUnique({
      where: { id: mediaId },
      include: { listing: true },
    });
    if (media.listing.ownerId !== ownerId) throw new ForbiddenException();
    await this.storage.delete(media.key);
    await this.prisma.listingMedia.delete({ where: { id: mediaId } });
    return true;
  }

  async getPresignedUrl(listingId: string, ownerId: string, mimeType: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (listing.ownerId !== ownerId) throw new ForbiddenException();
    const key = `listings/${listingId}/${Date.now()}.${mimeType.split('/')[1]}`;
    const url = await this.storage.getPresignedUploadUrl(key, mimeType);
    return { key, url };
  }

  async confirmMedia(listingId: string, ownerId: string, key: string, mimeType: string, size: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (listing.ownerId !== ownerId) throw new ForbiddenException();
    const endpoint = this.config.get('S3_ENDPOINT', 'http://localhost:9000');
    const bucket = this.config.get('S3_BUCKET', 'bezrealitky');
    const url = `${endpoint}/${bucket}/${key}`;
    const count = await this.prisma.listingMedia.count({ where: { listingId } });
    await this.prisma.listingMedia.create({
      data: { listingId, url, key, mimeType, size, order: count, isCover: count === 0 },
    });
    return true;
  }
}
