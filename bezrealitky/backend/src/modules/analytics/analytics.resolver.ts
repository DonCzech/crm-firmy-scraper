import { Resolver, Query, Args, ObjectType, Field, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ObjectType()
class ListingStatsType {
  @Field(() => Int) views: number;
  @Field(() => Int) contacts: number;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class AnalyticsResolver {
  constructor(private analyticsService: AnalyticsService) {}

  @Query(() => ListingStatsType)
  async listingStats(@Args('listingId') listingId: string) {
    return this.analyticsService.listingStats(listingId);
  }
}
