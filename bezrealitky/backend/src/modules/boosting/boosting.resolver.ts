import { Resolver, Mutation, Args, ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BoostType } from '@prisma/client';
import { BoostingService } from './boosting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

registerEnumType(BoostType, { name: 'BoostType' });

@ObjectType()
class BoostCheckoutResult {
  @Field() checkoutUrl: string;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class BoostingResolver {
  constructor(private boostingService: BoostingService) {}

  @Mutation(() => BoostCheckoutResult)
  async purchaseBoost(
    @CurrentUser() user: any,
    @Args('listingId') listingId: string,
    @Args('type', { type: () => BoostType }) type: BoostType,
  ) {
    return this.boostingService.purchaseBoost(user.id, listingId, type);
  }
}
