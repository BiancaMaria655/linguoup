import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * MetricsInterceptor — logs request latency for all routes.
 * Designed to be replaced/enhanced with OpenTelemetry spans when the SDK is wired in.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('MetricsInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req as { method: string; url: string };
    const startMs = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startMs;
          this.logger.log(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level: 'info',
              service: 'api',
              event: 'http.request',
              method,
              url,
              durationMs,
            }),
          );
        },
        error: (err: Error) => {
          const durationMs = Date.now() - startMs;
          this.logger.error(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level: 'error',
              service: 'api',
              event: 'http.request.error',
              method,
              url,
              durationMs,
              error: err.message,
            }),
          );
        },
      }),
    );
  }
}
