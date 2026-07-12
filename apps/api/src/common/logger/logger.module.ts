import { Module, Global } from '@nestjs/common';
import { StructuredLogger } from './structured-logger.service';
import { GlobalLogger } from './global-logger.service';

@Global()
@Module({
  providers: [StructuredLogger, GlobalLogger],
  exports: [StructuredLogger, GlobalLogger],
})
export class LoggerModule {}
