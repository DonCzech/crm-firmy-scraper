import { Module } from '@nestjs/common';
import { BoostingService } from './boosting.service';
import { BoostingResolver } from './boosting.resolver';

@Module({ providers: [BoostingService, BoostingResolver] })
export class BoostingModule {}
