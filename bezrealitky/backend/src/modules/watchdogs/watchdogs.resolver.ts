import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, InputType, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OfferType, EstateType } from '@prisma/client';
import { WatchdogsService } from './watchdogs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ObjectType()
class WatchdogType {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) name: string | null;
  @Field(() => OfferType, { nullable: true }) offerType: OfferType | null;
  @Field(() => EstateType, { nullable: true }) estateType: EstateType | null;
  @Field(() => String, { nullable: true }) city: string | null;
  @Field(() => String, { nullable: true }) region: string | null;
  @Field(() => Int, { nullable: true }) priceMin: number | null;
  @Field(() => Int, { nullable: true }) priceMax: number | null;
  @Field(() => [String]) rooms: string[];
  @Field() active: boolean;
  @Field() createdAt: Date;
}

@InputType()
class WatchdogInput {
  @Field({ nullable: true }) name?: string;
  @Field(() => OfferType, { nullable: true }) offerType?: OfferType;
  @Field(() => EstateType, { nullable: true }) estateType?: EstateType;
  @Field({ nullable: true }) city?: string;
  @Field({ nullable: true }) region?: string;
  @Field(() => Int, { nullable: true }) priceMin?: number;
  @Field(() => Int, { nullable: true }) priceMax?: number;
  @Field(() => Float, { nullable: true }) areaMin?: number;
  @Field(() => Float, { nullable: true }) areaMax?: number;
  @Field(() => [String], { nullable: true }) rooms?: string[];
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class WatchdogsResolver {
  constructor(private watchdogsService: WatchdogsService) {}

  @Query(() => [WatchdogType])
  async myWatchdogs(@CurrentUser() user: any) {
    return this.watchdogsService.myWatchdogs(user.id);
  }

  @Mutation(() => WatchdogType)
  async createWatchdog(@CurrentUser() user: any, @Args('input') input: WatchdogInput) {
    return this.watchdogsService.create(user.id, input);
  }

  @Mutation(() => WatchdogType)
  async updateWatchdog(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('input') input: WatchdogInput,
  ) {
    return this.watchdogsService.update(id, user.id, input);
  }

  @Mutation(() => Boolean)
  async deleteWatchdog(@CurrentUser() user: any, @Args('id') id: string) {
    return this.watchdogsService.delete(id, user.id);
  }
}
