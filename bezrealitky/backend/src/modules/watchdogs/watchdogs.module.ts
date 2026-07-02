import { Module } from '@nestjs/common';
import { WatchdogsService } from './watchdogs.service';
import { WatchdogsResolver } from './watchdogs.resolver';
import { WatchdogProcessor } from './watchdog.processor';

@Module({ providers: [WatchdogsService, WatchdogsResolver, WatchdogProcessor] })
export class WatchdogsModule {}
