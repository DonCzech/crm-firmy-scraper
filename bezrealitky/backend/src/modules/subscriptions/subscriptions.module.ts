import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsResolver } from './subscriptions.resolver';

@Module({ providers: [SubscriptionsService, SubscriptionsResolver], exports: [SubscriptionsService] })
export class SubscriptionsModule {}
