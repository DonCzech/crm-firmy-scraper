import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

registerEnumType(SubscriptionTier, { name: 'SubscriptionTier' });
registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });

@ObjectType()
class SubscriptionType {
  @Field(() => ID) id: string;
  @Field(() => SubscriptionTier) tier: SubscriptionTier;
  @Field(() => SubscriptionStatus) status: SubscriptionStatus;
  @Field(() => Date, { nullable: true }) currentPeriodEnd: Date | null;
  @Field() cancelAtPeriodEnd: boolean;
}

@ObjectType()
class CheckoutResult {
  @Field() checkoutUrl: string;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class SubscriptionsResolver {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Query(() => SubscriptionType, { nullable: true })
  async mySubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.mySubscription(user.id);
  }

  @Mutation(() => CheckoutResult)
  async startSubscription(
    @CurrentUser() user: any,
    @Args('tier', { type: () => SubscriptionTier }) tier: SubscriptionTier,
  ) {
    return this.subscriptionsService.startSubscription(user.id, tier);
  }

  @Mutation(() => Boolean)
  async cancelSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }
}
