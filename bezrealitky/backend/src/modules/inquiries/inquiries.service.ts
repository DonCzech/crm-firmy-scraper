import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    listingId: string;
    senderName: string;
    senderEmail: string;
    senderPhone?: string;
    message: string;
  }) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: data.listingId },
      select: { ownerId: true },
    });
    if (!listing) throw new Error('Inzerát nenalezen');

    const inquiry = await this.prisma.inquiry.create({
      data: {
        listingId: data.listingId,
        ownerId: listing.ownerId,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        senderPhone: data.senderPhone,
        message: data.message,
      },
      include: { listing: { select: { title: true, slug: true } } },
    });

    await this.prisma.listing.update({
      where: { id: data.listingId },
      data: { contactCount: { increment: 1 } },
    });

    return inquiry;
  }

  async myInquiries(ownerId: string) {
    return this.prisma.inquiry.findMany({
      where: { ownerId },
      include: { listing: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, ownerId: string) {
    return this.prisma.inquiry.updateMany({
      where: { id, ownerId },
      data: { read: true },
    });
  }
}
