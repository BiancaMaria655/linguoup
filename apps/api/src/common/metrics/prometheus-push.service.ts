import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Snappy = require('snappyjs');
import { MetricsService } from './metrics.service';

// ─── Minimal Protobuf encoder for Prometheus WriteRequest ───────────────────

function writeVarint(n: bigint): Buffer {
  const bytes: number[] = [];
  let v = n < 0n ? BigInt.asUintN(64, n) : n;
  while (v >= 128n) {
    bytes.push(Number((v & 127n) | 128n));
    v >>= 7n;
  }
  bytes.push(Number(v));
  return Buffer.from(bytes);
}

function writeTag(field: number, wireType: number): Buffer {
  return writeVarint(BigInt((field << 3) | wireType));
}

function writeLenDelimited(field: number, data: Buffer): Buffer {
  return Buffer.concat([writeTag(field, 2), writeVarint(BigInt(data.length)), data]);
}

function writeStringField(field: number, s: string): Buffer {
  return writeLenDelimited(field, Buffer.from(s, 'utf8'));
}

function writeDoubleField(field: number, v: number): Buffer {
  const tag = writeTag(field, 1); // wire type 1 = 64-bit
  const buf = Buffer.allocUnsafe(8);
  buf.writeDoubleLE(v, 0);
  return Buffer.concat([tag, buf]);
}

function writeInt64Field(field: number, v: number): Buffer {
  return Buffer.concat([writeTag(field, 0), writeVarint(BigInt(v))]);
}

/** Encode a Label { name, value } */
function encodeLabel(name: string, value: string): Buffer {
  return Buffer.concat([writeStringField(1, name), writeStringField(2, value)]);
}

/** Encode a Sample { value, timestamp } */
function encodeSample(value: number, timestampMs: number): Buffer {
  return Buffer.concat([writeDoubleField(1, value), writeInt64Field(2, timestampMs)]);
}

interface TimeSeriesEntry {
  labels: Record<string, string>;
  metricName?: string;
  value: number;
}

function buildWriteRequestBuffer(metricFamilies: any[], timestampMs: number): Buffer {
  const timeseriesBuffers: Buffer[] = [];

  for (const family of metricFamilies) {
    const entries: TimeSeriesEntry[] = family.values ?? [];

    for (const entry of entries) {
      const name = (entry.metricName ?? family.name) as string;
      const rawValue = entry.value as number;

      if (!isFinite(rawValue)) continue;

      // Build labels list: __name__ first (required by Prometheus), then sorted rest
      const userLabels = entry.labels as Record<string, string>;
      const labelPairs: [string, string][] = [['__name__', name]];
      for (const [k, v] of Object.entries(userLabels).sort(([a], [b]) => a.localeCompare(b))) {
        labelPairs.push([k, String(v)]);
      }

      const labelsBuffer = Buffer.concat(
        labelPairs.map(([k, v]) => writeLenDelimited(1, encodeLabel(k, v))),
      );
      const samplesBuffer = writeLenDelimited(2, encodeSample(rawValue, timestampMs));

      const tsBuffer = Buffer.concat([labelsBuffer, samplesBuffer]);
      timeseriesBuffers.push(writeLenDelimited(1, tsBuffer));
    }
  }

  return Buffer.concat(timeseriesBuffers);
}

// ─── Service ────────────────────────────────────────────────────────────────

@Injectable()
export class PrometheusPushService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrometheusPushService.name);
  private intervalHandle: NodeJS.Timeout | null = null;
  private readonly PUSH_INTERVAL_MS = 30_000;

  constructor(private readonly metricsService: MetricsService) {}

  onModuleInit() {
    const url = process.env.GRAFANA_CLOUD_PROMETHEUS_URL;
    const user = process.env.GRAFANA_CLOUD_PROMETHEUS_USER;
    const apiKey = process.env.GRAFANA_CLOUD_PROMETHEUS_API_KEY;

    if (!url || !user || !apiKey) {
      this.logger.warn(
        'Grafana Cloud Prometheus credentials not set — metrics push disabled.',
      );
      return;
    }

    // Initial push shortly after boot
    setTimeout(() => {
      this.pushMetrics().catch((err) =>
        this.logger.error('Initial metrics push failed', err?.message),
      );
    }, 5_000);

    this.intervalHandle = setInterval(() => {
      this.pushMetrics().catch((err) =>
        this.logger.error('Metrics push failed', err?.message),
      );
    }, this.PUSH_INTERVAL_MS);

    this.logger.log(
      `Prometheus remote_write enabled → ${url} (interval: ${this.PUSH_INTERVAL_MS / 1000}s)`,
    );
  }

  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async pushMetrics(): Promise<void> {
    const url = process.env.GRAFANA_CLOUD_PROMETHEUS_URL;
    const user = process.env.GRAFANA_CLOUD_PROMETHEUS_USER;
    const apiKey = process.env.GRAFANA_CLOUD_PROMETHEUS_API_KEY;

    if (!url || !user || !apiKey) return;

    const metricsJson = await this.metricsService.getMetricsAsJSON();
    const timestampMs = Date.now();

    const writeRequestBuf = buildWriteRequestBuffer(metricsJson, timestampMs);
    if (writeRequestBuf.length === 0) return;

    // Snappy-compress the protobuf payload
    const compressed: Uint8Array = Snappy.compress(writeRequestBuf) as Uint8Array;

    // Grafana Cloud remote_write endpoint: <base_url>/api/prom/push
    const pushUrl = url.replace(/\/api\/prom$/, '') + '/api/prom/push';
    const authHeader = 'Basic ' + Buffer.from(`${user}:${apiKey}`).toString('base64');

    try {
      const response = await fetch(pushUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-protobuf',
          'Content-Encoding': 'snappy',
          'X-Prometheus-Remote-Write-Version': '0.1.0',
          Authorization: authHeader,
        },
        body: compressed as unknown as BodyInit,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.error(
          `[Prometheus Push] HTTP ${response.status}: ${text.slice(0, 200)}`,
        );
      } else {
        this.logger.debug(
          `[Prometheus Push] OK — ${metricsJson.length} metric families sent`,
        );
      }
    } catch (err) {
      this.logger.error('[Prometheus Push] Network error', (err as Error)?.message);
    }
  }
}
