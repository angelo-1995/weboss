import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { AsyncContextService } from '../logger/async-context.service';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  constructor(private readonly asyncContext: AsyncContextService) {}

  use(req: IncomingMessage, res: ServerResponse, next: () => void): void {
    const traceId = randomUUID();

    res.setHeader('X-Trace-Id', traceId);

    this.asyncContext.run({ traceId }, next);
  }
}
