import { Global, Module } from '@nestjs/common';
import { AsyncContextService } from './async-context.service';
import { StructuredLoggerService } from './structured-logger.service';

@Global()
@Module({
  providers: [AsyncContextService, StructuredLoggerService],
  exports: [AsyncContextService, StructuredLoggerService],
})
export class LoggerModule {}
