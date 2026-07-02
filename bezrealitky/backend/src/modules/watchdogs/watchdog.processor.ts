import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Worker, Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { WATCHDOG_QUEUE } from '../../common/queue/queue.module';

@Injectable()
export class WatchdogProcessor implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private config: ConfigService,
    @Inject(WATCHDOG_QUEUE) private queue: Queue,
  ) {}

  onModuleInit() {
    const worker = new Worker(
      WATCHDOG_QUEUE,
      async (job) => {
        const { watchdogId, listingId, userId } = job.data;

        const [user, listing] = await Promise.all([
          this.prisma.user.findUnique({ where: { id: userId } }),
          this.prisma.listing.findUnique({ where: { id: listingId } }),
        ]);
        if (!user || !listing) return;

        const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
        await this.mail.sendWatchdogAlert(
          user.email,
          listing.title,
          `${appUrl}/inzerat/${listing.slug}`,
        );

        await this.prisma.watchdogMatch.updateMany({
          where: { watchdogId, listingId },
          data: { notified: true },
        });

        await this.prisma.notification.create({
          data: {
            userId,
            type: 'WATCHDOG_MATCH',
            title: 'Hlídací pes našel shodu',
            body: `Nový inzerát: ${listing.title}`,
            data: { listingId, slug: listing.slug },
          },
        });
      },
      { connection: { url: this.config.get('REDIS_URL', 'redis://localhost:6379') } },
    );
  }
}
