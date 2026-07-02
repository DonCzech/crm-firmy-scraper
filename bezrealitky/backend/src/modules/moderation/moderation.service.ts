import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus } from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async pendingListings() {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.PENDING_REVIEW },
      include: { owner: { include: { profile: true } }, media: { take: 3 } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveListing(id: string, moderatorId: string) {
    await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.ACTIVE, publishedAt: new Date() },
    });
    await this.prisma.moderationLog.create({
      data: { listingId: id, moderatorId, action: 'APPROVED' },
    });
    await this.prisma.notification.create({
      data: {
        userId: (await this.prisma.listing.findUnique({ where: { id } })).ownerId,
        type: 'LISTING_APPROVED',
        title: 'Inzerát byl schválen',
        body: 'Váš inzerát byl schválen a je nyní aktivní.',
      },
    });
    return true;
  }

  async rejectListing(id: string, moderatorId: string, reason: string) {
    await this.prisma.listing.update({ where: { id }, data: { status: ListingStatus.REJECTED } });
    await this.prisma.moderationLog.create({
      data: { listingId: id, moderatorId, action: 'REJECTED', reason },
    });
    await this.prisma.notification.create({
      data: {
        userId: (await this.prisma.listing.findUnique({ where: { id } })).ownerId,
        type: 'LISTING_REJECTED',
        title: 'Inzerát byl zamítnut',
        body: `Váš inzerát byl zamítnut. Důvod: ${reason}`,
      },
    });
    return true;
  }
}
