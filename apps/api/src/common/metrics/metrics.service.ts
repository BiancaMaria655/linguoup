import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: client.Registry;
  private readonly httpRequestsTotal: client.Counter<string>;
  private readonly httpRequestDurationSeconds: client.Histogram<string>;

  constructor() {
    this.registry = new client.Registry();
    
    // Collect default process/system metrics
    client.collectDefaultMetrics({ register: this.registry });

    // HTTP request counter metric
    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests processed',
      labelNames: ['method', 'route', 'status'],
    });

    // HTTP request latency histogram metric
    this.httpRequestDurationSeconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // detailed sub-second buckets
    });

    this.registry.registerMetric(this.httpRequestsTotal);
    this.registry.registerMetric(this.httpRequestDurationSeconds);
  }

  /**
   * Returns raw metrics text to be scraped by Prometheus.
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMetricsAsJSON(): Promise<any[]> {
    return this.registry.getMetricsAsJSON() as unknown as Promise<any[]>;
  }

  /**
   * Records details of an HTTP request.
   */
  recordRequest(method: string, route: string, status: string, durationSeconds: number): void {
    const labels = { method, route, status };
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationSeconds.observe(labels, durationSeconds);
  }
}
