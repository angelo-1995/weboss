import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './cache.constants';
import Redis from 'ioredis';

export { REDIS_CLIENT } from './cache.constants';

const logger = new Logger('CacheModule');

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        const parsedUrl = new URL(url);
        const useTls = url.startsWith('rediss://');

        logger.log(`Connecting to Redis cache: ${parsedUrl.hostname} (TLS: ${useTls})`);

        const client = new Redis({
          host: parsedUrl.hostname,
          port: parseInt(parsedUrl.port || '6379', 10),
          password: decodeURIComponent(parsedUrl.password || ''),
          tls: useTls ? {} : undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 3) {
              logger.warn('Redis cache connection failed after 3 retries');
              return null;
            }
            return Math.min(times * 500, 2000);
          },
        });
        client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
        return client;
      },
    },
    CacheService,
  ],
  exports: [REDIS_CLIENT, CacheService],
})
export class CacheModule {}
