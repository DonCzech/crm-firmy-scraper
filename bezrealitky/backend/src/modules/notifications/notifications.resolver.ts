import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ObjectType()
class NotificationType {
  @Field(() => ID) id: string;
  @Field() type: string;
  @Field() title: string;
  @Field() body: string;
  @Field() read: boolean;
  @Field() createdAt: Date;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class NotificationsResolver {
  constructor(private notificationsService: NotificationsService) {}

  @Query(() => [NotificationType])
  async myNotifications(
    @CurrentUser() user: any,
    @Args('unreadOnly', { nullable: true }) unreadOnly?: boolean,
  ) {
    return this.notificationsService.myNotifications(user.id, unreadOnly);
  }

  @Query(() => Int)
  async unreadNotificationsCount(@CurrentUser() user: any) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Mutation(() => Boolean)
  async markNotificationsRead(
    @CurrentUser() user: any,
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    return this.notificationsService.markRead(user.id, ids);
  }

  @Mutation(() => Boolean)
  async markAllNotificationsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllRead(user.id);
  }
}
