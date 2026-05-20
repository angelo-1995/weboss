import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { AsyncContextService } from './async-context.service';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  traceId?: string;
  userId?: string;
  [key: string]: unknown;
}

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly isProduction = process.env['NODE_ENV'] === 'production';

  constructor(private readonly asyncContext: AsyncContextService) {}

  log(message: string, context?: string): void {
    this.emit('info', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.emit('error', message, context, { trace });
  }

  warn(message: string, context?: string): void {
    this.emit('warn', message, context);
  }

  debug(message: string, context?: string): void {
    if (this.isProduction) return;
    this.emit('debug', message, context);
  }

  verbose(message: string, context?: string): void {
    if (this.isProduction) return;
    this.emit('debug', message, context);
  }

  setLogLevels?(levels: LogLevel[]): void {
    // No-op: level filtering handled by isProduction check
  }

  private emit(level: string, message: string, context?: string, extra?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId: this.asyncContext.getTraceId(),
      userId: this.asyncContext.getUserId(),
      ...extra,
    };

    // Remove undefined fields for cleaner output
    const clean = Object.fromEntries(
      Object.entries(entry).filter(([, v]) => v !== undefined),
    );

    console.log(JSON.stringify(clean));
  }
}
