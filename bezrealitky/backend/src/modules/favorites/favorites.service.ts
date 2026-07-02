import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, listingId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return false;
    }
    await this.prisma.favorite.create({ data: { userId, listingId } });
    return true;
  }

  async myFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { listing: { include: { media: { where: { isCover: true }, take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
