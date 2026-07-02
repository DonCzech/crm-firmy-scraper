import { Resolver, Query, Args, ObjectType, Field, Int, Float, InputType } from '@nestjs/graphql';
import { OfferType, EstateType } from '@prisma/client';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';
import { ListingType } from '../listings/listings.resolver';

@InputType()
class SearchFiltersInput {
  @Field(() => OfferType, { nullable: true }) offerType?: OfferType;
  @Field(() => EstateType, { nullable: true }) estateType?: EstateType;
  @Field({ nullable: true }) city?: string;
  @Field({ nullable: true }) region?: string;
  @Field(() => Int, { nullable: true }) priceMin?: number;
  @Field(() => Int, { nullable: true }) priceMax?: number;
  @Field(() => Float, { nullable: true }) areaMin?: number;
  @Field(() => Float, { nullable: true }) areaMax?: number;
  @Field(() => [String], { nullable: true }) rooms?: string[];
  @Field({ nullable: true }) furnished?: boolean;
  @Field({ nullable: true }) parking?: boolean;
  @Field({ nullable: true }) balcony?: boolean;
  @Field({ nullable: true }) petFriendly?: boolean;
}

@InputType()
class PaginationInput {
  @Field(() => Int, { nullable: true }) page?: number;
  @Field(() => Int, { nullable: true }) limit?: number;
}

@InputType()
class SortInput {
  @Field({ nullable: true }) field?: string;
  @Field({ nullable: true }) direction?: string;
}

@ObjectType()
class SearchResult {
  @Field(() => [ListingType]) items: ListingType[];
  @Field(() => Int) total: number;
  @Field(() => Int) page: number;
  @Field(() => Int) limit: number;
  @Field(() => Int) pages: number;
}

@Resolver()
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Public()
  @Query(() => SearchResult)
  async searchListings(
    @Args('filters', { nullable: true }) filters?: SearchFiltersInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('sort', { nullable: true }) sort?: SortInput,
  ) {
    return this.searchService.searchListings(
      filters ?? {},
      pagination ?? {},
      (sort as any) ?? {},
    );
  }
}
