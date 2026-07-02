import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

export const WATCHDOG_QUEUE = 'watchdog';
export const NOTIFICATION_QUEUE = 'notification';
export const MAIL_QUEUE = 'mail';

function createNoopQueue(): Queue {
  return {
    add: async () => ({ id: 'noop' }),
    close: async () => undefined,
  } as unknown as Queue;
}

const createQueue = (name: string, config: ConfigService): Queue => {
  const redisUrl = (config.get<string>('REDIS_URL') || '').trim();
  if (!redisUrl) return createNoopQueue();
  if (/localhost|127\.0\.0\.1/.test(redisUrl)) return createNoopQueue();
  return new Queue(name, { connection: { url: redisUrl } });
};

@Global()
@Module({
  providers: [
    {
      provide: WATCHDOG_QUEUE,
      useFactory: (config: ConfigService) => createQueue(WATCHDOG_QUEUE, config),
      inject: [ConfigService],
    },
    {
      provide: NOTIFICATION_QUEUE,
      useFactory: (config: ConfigService) => createQueue(NOTIFICATION_QUEUE, config),
      inject: [ConfigService],
    },
    {
      provide: MAIL_QUEUE,
      useFactory: (config: ConfigService) => createQueue(MAIL_QUEUE, config),
      inject: [ConfigService],
    },
  ],
  exports: [WATCHDOG_QUEUE, NOTIFICATION_QUEUE, MAIL_QUEUE],
})
export class QueueModule {}
