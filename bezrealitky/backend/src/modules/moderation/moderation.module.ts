import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ModerationResolver } from './moderation.resolver';

@Module({ providers: [ModerationService, ModerationResolver], exports: [ModerationService] })
export class ModerationModule {}
