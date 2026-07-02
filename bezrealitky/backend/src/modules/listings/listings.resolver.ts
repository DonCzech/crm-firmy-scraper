import {
  Resolver, Query, Mutation, Args, ObjectType, Field, ID,
  InputType, Int, Float, registerEnumType, ResolveField, Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OfferType, EstateType, ListingStatus } from '@prisma/client';
import { ListingsService, CreateListingInput } from './listings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

registerEnumType(OfferType, { name: 'OfferType' });
registerEnumType(EstateType, { name: 'EstateType' });
registerEnumType(ListingStatus, { name: 'ListingStatus' });

@ObjectType()
export class ListingMediaType {
  @Field(() => ID) id: string;
  @Field() url: string;
  @Field() isCover: boolean;
  @Field(() => Int) order: number;
}

@ObjectType()
export class ListingType {
  @Field(() => ID) id: string;
  @Field() slug: string;
  @Field(() => OfferType) offerType: OfferType;
  @Field(() => EstateType) estateType: EstateType;
  @Field() title: string;
  @Field() description: string;
  @Field(() => Int) price: number;
  @Field(() => Float, { nullable: true }) area: number | null;
  @Field(() => Int, { nullable: true }) floor: number | null;
  @Field(() => Int, { nullable: true }) totalFloors: number | null;
  @Field(() => String, { nullable: true }) rooms: string | null;
  @Field(() => Boolean, { nullable: true }) furnished: boolean | null;
  @Field(() => Boolean, { nullable: true }) parking: boolean | null;
  @Field(() => Boolean, { nullable: true }) balcony: boolean | null;
  @Field(() => Boolean, { nullable: true }) cellar: boolean | null;
  @Field(() => Boolean, { nullable: true }) elevator: boolean | null;
  @Field(() => Boolean, { nullable: true }) petFriendly: boolean | null;
  @Field(() => String, { nullable: true }) street: string | null;
  @Field(() => String, { nullable: true }) city: string;
  @Field(() => String, { nullable: true }) district: string | null;
  @Field(() => String, { nullable: true }) region: string | null;
  @Field(() => String, { nullable: true }) zip: string | null;
  @Field(() => Float, { nullable: true }) lat: number | null;
  @Field(() => Float, { nullable: true }) lon: number | null;
  @Field(() => ListingStatus) status: ListingStatus;
  @Field(() => Int) viewCount: number;
  @Field(() => Int) contactCount: number;
  @Field() ownerId: string;
  @Field(() => String, { nullable: true }) ownerPhone: string | null;
  @Field(() => [ListingMediaType]) media: ListingMediaType[];
  @Field() createdAt: Date;
  @Field(() => Date, { nullable: true }) publishedAt: Date | null;
}

@InputType()
class CreateListingGqlInput implements CreateListingInput {
  @Field(() => OfferType) offerType: OfferType;
  @Field(() => EstateType) estateType: EstateType;
  @Field() title: string;
  @Field() description: string;
  @Field(() => Int) price: number;
  @Field(() => Float, { nullable: true }) area?: number;
  @Field(() => Int, { nullable: true }) floor?: number;
  @Field(() => Int, { nullable: true }) totalFloors?: number;
  @Field(() => String, { nullable: true }) rooms?: string;
  @Field(() => Boolean, { nullable: true }) furnished?: boolean;
  @Field(() => Boolean, { nullable: true }) parking?: boolean;
  @Field(() => Boolean, { nullable: true }) balcony?: boolean;
  @Field(() => Boolean, { nullable: true }) cellar?: boolean;
  @Field(() => Boolean, { nullable: true }) elevator?: boolean;
  @Field(() => Boolean, { nullable: true }) petFriendly?: boolean;
  @Field(() => String, { nullable: true }) street?: string;
  @Field() city: string;
  @Field(() => String, { nullable: true }) district?: string;
  @Field(() => String, { nullable: true }) region?: string;
  @Field(() => String, { nullable: true }) zip?: string;
  @Field(() => Float, { nullable: true }) lat?: number;
  @Field(() => Float, { nullable: true }) lon?: number;
}

@Resolver(() => ListingType)
export class ListingsResolver {
  constructor(private listingsService: ListingsService) {}

  @Public()
  @Query(() => ListingType, { nullable: true })
  async listing(
    @Args('id', { nullable: true }) id?: string,
    @Args('slug', { nullable: true }) slug?: string,
  ) {
    if (slug) return this.listingsService.findBySlug(slug);
    return this.listingsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [ListingType])
  async myListings(@CurrentUser() user: any) {
    return this.listingsService.myListings(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ListingType)
  async createListing(
    @CurrentUser() user: any,
    @Args('input') input: CreateListingGqlInput,
  ) {
    return this.listingsService.create(user.id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ListingType)
  async publishListing(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ) {
    return this.listingsService.publish(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ListingType)
  async updateListing(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('input') input: CreateListingGqlInput,
  ) {
    return this.listingsService.update(id, user.id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ListingType)
  async archiveListing(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ) {
    return this.listingsService.archive(id, user.id);
  }

  @ResolveField(() => String, { nullable: true })
  ownerPhone(@Parent() listing: any): string | null {
    return listing.owner?.profile?.phone ?? null;
  }
}
