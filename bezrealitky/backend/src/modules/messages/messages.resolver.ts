import { Resolver, Query, Mutation, Args, ObjectType, Field, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ObjectType()
class MessageType {
  @Field(() => ID) id: string;
  @Field() content: string;
  @Field() senderId: string;
  @Field() status: string;
  @Field() createdAt: Date;
}

@ObjectType()
class ConversationType {
  @Field(() => ID) id: string;
  @Field() participantAId: string;
  @Field() participantBId: string;
  @Field(() => String, { nullable: true }) participantAEmail: string | null;
  @Field(() => String, { nullable: true }) participantBEmail: string | null;
  @Field(() => String, { nullable: true }) participantAName: string | null;
  @Field(() => String, { nullable: true }) participantBName: string | null;
  @Field(() => String, { nullable: true }) participantAPhone: string | null;
  @Field(() => String, { nullable: true }) participantBPhone: string | null;
  @Field(() => String, { nullable: true }) listingId: string | null;
  @Field(() => [MessageType]) messages: MessageType[];
  @Field() updatedAt: Date;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class MessagesResolver {
  constructor(private messagesService: MessagesService) {}

  @Query(() => [ConversationType])
  async myConversations(@CurrentUser() user: any) {
    const convs = await this.messagesService.myConversations(user.id);
    return convs.map((c: any) => ({
      ...c,
      participantAEmail: c.participantA?.email ?? null,
      participantBEmail: c.participantB?.email ?? null,
      participantAName: [c.participantA?.profile?.firstName, c.participantA?.profile?.lastName].filter(Boolean).join(' ') || c.participantA?.email?.split('@')[0] || null,
      participantBName: [c.participantB?.profile?.firstName, c.participantB?.profile?.lastName].filter(Boolean).join(' ') || c.participantB?.email?.split('@')[0] || null,
      participantAPhone: c.participantA?.profile?.phone ?? null,
      participantBPhone: c.participantB?.profile?.phone ?? null,
    }));
  }

  @Query(() => [MessageType])
  async conversationMessages(
    @CurrentUser() user: any,
    @Args('conversationId') conversationId: string,
  ) {
    return this.messagesService.conversationMessages(user.id, conversationId);
  }

  @Mutation(() => ConversationType)
  async createConversation(
    @CurrentUser() user: any,
    @Args('recipientId') recipientId: string,
    @Args('listingId') listingId: string,
    @Args('message') message: string,
  ) {
    return this.messagesService.createConversation(user.id, recipientId, listingId, message);
  }

  @Mutation(() => MessageType)
  async sendMessage(
    @CurrentUser() user: any,
    @Args('conversationId') conversationId: string,
    @Args('content') content: string,
  ) {
    return this.messagesService.sendMessage(user.id, conversationId, content);
  }
}
