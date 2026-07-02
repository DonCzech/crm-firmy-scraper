import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ListingsModule } from './modules/listings/listings.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { ListingMediaModule } from './modules/listing-media/listing-media.module';
import { SearchModule } from './modules/search/search.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { MessagesModule } from './modules/messages/messages.module';
import { WatchdogsModule } from './modules/watchdogs/watchdogs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { BillingModule } from './modules/billing/billing.module';
import { BoostingModule } from './modules/boosting/boosting.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SeoModule } from './modules/seo/seo.module';
import { StorageModule } from './common/storage/storage.module';
import { MailModule } from './common/mail/mail.module';
import { QueueModule } from './common/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (config: ConfigService) => {
        const nodeEnv = (config.get<string>('NODE_ENV') || '').trim();
        const isServerless = Boolean(config.get<string>('VERCEL'));
        return {
          autoSchemaFile: nodeEnv === 'production'
            ? true
            : join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: !isServerless && nodeEnv !== 'production',
          context: ({ req, res }) => ({ req, res }),
          subscriptions: isServerless
            ? undefined
            : { 'graphql-ws': true },
        };
      },
      inject: [ConfigService],
    }),

    PrismaModule,
    StorageModule,
    MailModule,
    QueueModule,

    AuthModule,
    UsersModule,
    ProfilesModule,
    ListingsModule,
    InquiriesModule,
    ListingMediaModule,
    SearchModule,
    FavoritesModule,
    MessagesModule,
    WatchdogsModule,
    NotificationsModule,
    SubscriptionsModule,
    BillingModule,
    BoostingModule,
    ModerationModule,
    AdminModule,
    AnalyticsModule,
    SeoModule,
  ],
})
export class AppModule {}
