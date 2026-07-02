import { Module } from '@nestjs/common';
import { ListingMediaService } from './listing-media.service';
import { ListingMediaResolver } from './listing-media.resolver';

@Module({
  providers: [ListingMediaService, ListingMediaResolver],
})
export class ListingMediaModule {}
