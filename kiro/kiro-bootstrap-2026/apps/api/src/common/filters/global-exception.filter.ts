import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StructuredLoggerService } from '../logger/structured-logger.service';
import { AsyncContextService } from '../logger/async-context.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly asyncContext: AsyncContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const obj = exResponse as Record<string, unknown>;
        message = (obj.message as string) || message;
        code = (obj.code as string) || code;
      }
    }

    // Log error with full stack trace for non-client errors
    if (status >= 500) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
      );
    }

    const traceId = this.asyncContext.getTraceId();

    response.status(status).send({
      statusCode: status,
      message,
      code,
      traceId,
      timestamp: new Date().toISOString(),
    });
  }
}
