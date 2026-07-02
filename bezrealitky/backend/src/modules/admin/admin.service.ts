import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [users, listings, activeListings, subscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { tier: { not: 'FREE' } } }),
    ]);
    return { users, listings, activeListings, paidSubscriptions: subscriptions };
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take: limit,
        include: { profile: true, subscription: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total };
  }

  async banUser(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { role: 'USER' } });
    return true;
  }

  async listInvoices(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        skip, take: limit,
        include: { user: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count(),
    ]);
    return { items, total };
  }
}
