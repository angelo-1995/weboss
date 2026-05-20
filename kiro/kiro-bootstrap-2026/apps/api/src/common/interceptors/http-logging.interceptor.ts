import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { StructuredLoggerService } from '../logger/structured-logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const path = req.url;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        const duration = Date.now() - start;

        this.logger.log(
          `${method} ${path} ${statusCode} ${duration}ms`,
          'HttpLoggingInterceptor',
        );
      }),
    );
  }
}
