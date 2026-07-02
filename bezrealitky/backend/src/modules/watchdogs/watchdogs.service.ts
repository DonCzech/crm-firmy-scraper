import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { Queue } from 'bullmq';
import { WATCHDOG_QUEUE } from '../../common/queue/queue.module';
import { OfferType, EstateType, ListingStatus } from '@prisma/client';

export interface CreateWatchdogInput {
  name?: string;
  offerType?: OfferType;
  estateType?: EstateType;
  city?: string;
  region?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  rooms?: string[];
}

@Injectable()
export class WatchdogsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    @Inject(WATCHDOG_QUEUE) private watchdogQueue: Queue,
  ) {}

  async create(userId: string, input: CreateWatchdogInput) {
    return this.prisma.watchdog.create({ data: { userId, ...input } });
  }

  async update(id: string, userId: string, input: Partial<CreateWatchdogInput>) {
    return this.prisma.watchdog.update({ where: { id }, data: input });
  }

  async delete(id: string, userId: string) {
    await this.prisma.watchdog.delete({ where: { id } });
    return true;
  }

  async myWatchdogs(userId: string) {
    return this.prisma.watchdog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async runMatchingForListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== ListingStatus.ACTIVE) return;

    const watchdogs = await this.prisma.watchdog.findMany({ where: { active: true } });

    for (const wd of watchdogs) {
      const matches =
        (!wd.offerType || wd.offerType === listing.offerType) &&
        (!wd.estateType || wd.estateType === listing.estateType) &&
        (!wd.city || listing.city.toLowerCase().includes(wd.city.toLowerCase())) &&
        (!wd.region || wd.region === listing.region) &&
        (!wd.priceMin || listing.price >= wd.priceMin) &&
        (!wd.priceMax || listing.price <= wd.priceMax) &&
        (!wd.areaMin || (listing.area ?? 0) >= wd.areaMin) &&
        (!wd.areaMax || (listing.area ?? 0) <= wd.areaMax) &&
        (!wd.rooms?.length || (listing.rooms && wd.rooms.includes(listing.rooms)));

      if (matches) {
        const already = await this.prisma.watchdogMatch.findUnique({
          where: { watchdogId_listingId: { watchdogId: wd.id, listingId } },
        });
        if (!already) {
          await this.prisma.watchdogMatch.create({ data: { watchdogId: wd.id, listingId } });
          await this.watchdogQueue.add('notify', { watchdogId: wd.id, listingId, userId: wd.userId });
        }
      }
    }
  }
}
