import { Resolver, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ListingMediaService } from './listing-media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ObjectType()
class PresignedUploadUrl {
  @Field() key: string;
  @Field() url: string;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class ListingMediaResolver {
  constructor(private mediaService: ListingMediaService) {}

  @Mutation(() => PresignedUploadUrl)
  async uploadListingMedia(
    @CurrentUser() user: any,
    @Args('listingId') listingId: string,
    @Args('mimeType') mimeType: string,
  ) {
    return this.mediaService.getPresignedUrl(listingId, user.id, mimeType);
  }

  @Mutation(() => Boolean)
  async confirmListingMedia(
    @CurrentUser() user: any,
    @Args('listingId') listingId: string,
    @Args('key') key: string,
    @Args('mimeType') mimeType: string,
    @Args('size', { type: () => Int }) size: number,
  ) {
    return this.mediaService.confirmMedia(listingId, user.id, key, mimeType, size);
  }

  @Mutation(() => Boolean)
  async reorderListingMedia(
    @CurrentUser() user: any,
    @Args('listingId') listingId: string,
    @Args('orderedIds', { type: () => [String] }) orderedIds: string[],
  ) {
    return this.mediaService.reorder(listingId, user.id, orderedIds);
  }

  @Mutation(() => Boolean)
  async deleteListingMedia(
    @CurrentUser() user: any,
    @Args('mediaId') mediaId: string,
  ) {
    return this.mediaService.delete(mediaId, user.id);
  }
}
