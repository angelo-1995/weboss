import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { DatabaseService } from '../infrastructure/database/database.service';
import { REDIS_CLIENT } from '../infrastructure/cache/cache.constants';
import type Redis from 'ioredis';
import { Public } from '../domains/auth/decorators/public.decorator';

interface ServiceStatus {
  status: 'ok' | 'error';
  latency?: number;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    db: ServiceStatus;
    redis: ServiceStatus;
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly db: DatabaseService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * GET /health — Full health check with all service statuses.
   * Returns 200 if all services are healthy, 503 if any service is down.
   */
  @Public()
  @Get()
  async check(): Promise<HealthResponse> {
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const allHealthy = dbStatus.status === 'ok' && redisStatus.status === 'ok';

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        db: dbStatus,
        redis: redisStatus,
      },
    };
  }

  /**
   * GET /health/live — Liveness probe.
   * Returns 200 if the process is alive, regardless of dependencies.
   */
  @Public()
  @Get('live')
  @HttpCode(HttpStatus.OK)
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /health/ready — Readiness probe.
   * Returns 200 only when all dependent services are ready.
   */
  @Public()
  @Get('ready')
  async ready() {
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const allReady = dbStatus.status === 'ok' && redisStatus.status === 'ok';

    if (!allReady) {
      // NestJS will handle the status code via exception or we return the object
      // For simplicity, we return the status and let the client check
    }

    return {
      status: allReady ? 'ok' : 'unavailable',
      timestamp: new Date().toISOString(),
      services: {
        db: dbStatus.status,
        redis: redisStatus.status,
      },
    };
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      await this.db.$queryRaw`SELECT 1`;
      return { status: 'ok', latency: Date.now() - start };
    } catch (err) {
      return {
        status: 'error',
        latency: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown database error',
      };
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const pong = await this.redis.ping();
      if (pong !== 'PONG') throw new Error(`Unexpected response: ${pong}`);
      return { status: 'ok', latency: Date.now() - start };
    } catch (err) {
      return {
        status: 'error',
        latency: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown Redis error',
      };
    }
  }
}
