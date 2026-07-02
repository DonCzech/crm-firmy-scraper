import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import net from 'net';

let cachedServer: express.Express | null = null;
let processHooksInstalled = false;

async function bootstrap(): Promise<express.Express> {
  if (cachedServer) return cachedServer;

  if (!processHooksInstalled) {
    processHooksInstalled = true;
    process.on('uncaughtException', (error) => {
      console.error('uncaughtException', error);
    });
    process.on('unhandledRejection', (reason) => {
      console.error('unhandledRejection', reason);
    });
  }

  try {
    console.log('bootstrap:start');
    const server = express();
    const { AppModule } = await import('../src/app.module');
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
    });
    console.log('bootstrap:app-created');

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
    console.log('bootstrap:init-start');
    await app.init();
    console.log('bootstrap:init-done');
    cachedServer = server;
    return server;
  } catch (error) {
    console.error('bootstrap:failed', error);
    throw error;
  }
}

export default async function handler(req: express.Request, res: express.Response) {
  if (req.url?.startsWith('/healthz')) {
    let dbHost = '';
    let tcpReachable: boolean | null = null;
    try {
      const raw = (process.env.DATABASE_URL || '').trim();
      dbHost = raw ? new URL(raw).hostname : '';
      const probe = new URL(req.url, 'http://localhost').searchParams.get('probe');
      if (probe === '1' && dbHost) {
        tcpReachable = await new Promise<boolean>((resolve) => {
          const socket = net.connect({ host: dbHost, port: 5432 });
          const done = (value: boolean) => {
            socket.removeAllListeners();
            socket.destroy();
            resolve(value);
          };
          socket.setTimeout(2500);
          socket.once('connect', () => done(true));
          socket.once('timeout', () => done(false));
          socket.once('error', () => done(false));
        });
      }
    } catch {
      dbHost = '';
    }
    return res.status(200).json({
      ok: true,
      nodeEnv: process.env.NODE_ENV || '',
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseHost: dbHost,
      tcpReachable,
      vercelRegion: process.env.VERCEL_REGION || '',
    });
  }

  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('Bootstrap failed', error);
    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : 'unknown bootstrap error',
      });
    }
  }
}
