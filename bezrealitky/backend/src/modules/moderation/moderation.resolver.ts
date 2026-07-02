import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListingType } from '../listings/listings.resolver';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
export class ModerationResolver {
  constructor(private moderationService: ModerationService) {}

  @Query(() => [ListingType])
  async pendingListings() {
    return this.moderationService.pendingListings();
  }

  @Mutation(() => Boolean)
  async adminApproveListing(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ) {
    return this.moderationService.approveListing(id, user.id);
  }

  @Mutation(() => Boolean)
  async adminRejectListing(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('reason') reason: string,
  ) {
    return this.moderationService.rejectListing(id, user.id, reason);
  }
}
