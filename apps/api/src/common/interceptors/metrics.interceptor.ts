import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';

/**
 * MetricsInterceptor — logs request latency and records Prometheus metrics.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('MetricsInterceptor');

  constructor(@Optional() private readonly metricsService?: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    
    const { method, url } = req as { method: string; url: string };
    const startMs = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startMs;
          const status = res ? res.statusCode.toString() : '200';
          const route = req.route ? req.route.path : url;
          
          if (this.metricsService) {
            this.metricsService.recordRequest(method, route, status, durationMs / 1000);
          }

          this.logger.log(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level: 'info',
              service: 'api',
              event: 'http.request',
              method,
              url,
              route,
              status,
              durationMs,
            }),
          );
        },
        error: (err: Error) => {
          const durationMs = Date.now() - startMs;
          const status = err && (err as any).status ? (err as any).status.toString() : '500';
          const route = req.route ? req.route.path : url;
          
          if (this.metricsService) {
            this.metricsService.recordRequest(method, route, status, durationMs / 1000);
          }

          this.logger.error(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level: 'error',
              service: 'api',
              event: 'http.request.error',
              method,
              url,
              route,
              status,
              durationMs,
              error: err.message,
            }),
          );
        },
      }),
    );
  }
}
