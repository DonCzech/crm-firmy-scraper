import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsResolver } from './listings.resolver';

@Module({
  providers: [ListingsService, ListingsResolver],
  exports: [ListingsService],
})
export class ListingsModule {}
