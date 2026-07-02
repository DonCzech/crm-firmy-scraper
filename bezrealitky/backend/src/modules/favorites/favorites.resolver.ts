import { Resolver, Query, Mutation, Args, ObjectType, Field, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListingType } from '../listings/listings.resolver';

@ObjectType()
class FavoriteType {
  @Field(() => ID) id: string;
  @Field(() => ListingType) listing: ListingType;
  @Field() createdAt: Date;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class FavoritesResolver {
  constructor(private favoritesService: FavoritesService) {}

  @Query(() => [FavoriteType])
  async myFavorites(@CurrentUser() user: any) {
    return this.favoritesService.myFavorites(user.id);
  }

  @Mutation(() => Boolean)
  async toggleFavorite(
    @CurrentUser() user: any,
    @Args('listingId') listingId: string,
  ) {
    return this.favoritesService.toggle(user.id, listingId);
  }
}
