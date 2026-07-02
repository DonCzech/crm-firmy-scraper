import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async track(event: string, data?: Record<string, any>, listingId?: string, userId?: string) {
    return this.prisma.analyticsEvent.create({
      data: { event, data, listingId, userId },
    });
  }

  async listingStats(listingId: string) {
    const [views, contacts] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { listingId, event: 'view' } }),
      this.prisma.analyticsEvent.count({ where: { listingId, event: 'contact' } }),
    ]);
    return { views, contacts };
  }
}
