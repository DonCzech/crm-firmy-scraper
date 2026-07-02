import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createConversation(senderId: string, recipientId: string, listingId: string, firstMessage: string) {
    const [a, b] = [senderId, recipientId].sort();
    let conversation = await this.prisma.conversation.findFirst({
      where: { participantAId: a, participantBId: b, listingId },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { participantAId: a, participantBId: b, listingId },
      });
      await this.prisma.listing.update({
        where: { id: listingId },
        data: { contactCount: { increment: 1 } },
      });
    }

    await this.prisma.message.create({
      data: { conversationId: conversation.id, senderId, content: firstMessage },
    });

    return conversation;
  }

  async sendMessage(senderId: string, conversationId: string, content: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (conv.participantAId !== senderId && conv.participantBId !== senderId) {
      throw new ForbiddenException();
    }
    return this.prisma.message.create({
      data: { conversationId, senderId, content },
    });
  }

  async myConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        participantA: { include: { profile: true } },
        participantB: { include: { profile: true } },
        listing: { include: { media: { where: { isCover: true }, take: 1 } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async conversationMessages(userId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (conv.participantAId !== userId && conv.participantBId !== userId) throw new ForbiddenException();

    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, status: 'SENT' },
      data: { status: 'READ' },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
