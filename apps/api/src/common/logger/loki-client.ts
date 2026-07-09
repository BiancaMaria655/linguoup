// Global batch queue for Loki
interface LokiLogItem {
  timestampNs: string;
  line: string;
}

const lokiQueue: LokiLogItem[] = [];
let lokiTimeout: NodeJS.Timeout | null = null;
const BATCH_LIMIT = 50;
const FLUSH_INTERVAL_MS = 2000;

export function pushToLoki(logLine: string) {
  const url = process.env.GRAFANA_CLOUD_LOKI_URL;
  const user = process.env.GRAFANA_CLOUD_LOKI_USER;
  const apiKey = process.env.GRAFANA_CLOUD_LOKI_API_KEY;

  // Only attempt to queue if credentials are fully configured
  if (!url || !user || !apiKey) {
    return;
  }

  // Use current time in nanoseconds
  const timestampNs = (Date.now() * 1000000 + lokiQueue.length).toString();
  lokiQueue.push({ timestampNs, line: logLine });

  if (lokiQueue.length >= BATCH_LIMIT) {
    flushLokiQueue();
  } else if (!lokiTimeout) {
    lokiTimeout = setTimeout(flushLokiQueue, FLUSH_INTERVAL_MS);
  }
}

export async function flushLokiQueue() {
  if (lokiTimeout) {
    clearTimeout(lokiTimeout);
    lokiTimeout = null;
  }

  if (lokiQueue.length === 0) {
    return;
  }

  const batch = [...lokiQueue];
  lokiQueue.length = 0; // Clear the queue

  const url = process.env.GRAFANA_CLOUD_LOKI_URL;
  const user = process.env.GRAFANA_CLOUD_LOKI_USER;
  const apiKey = process.env.GRAFANA_CLOUD_LOKI_API_KEY;

  if (!url || !user || !apiKey) {
    return;
  }

  // Build the push URL
  const pushUrl = url.endsWith('/loki/api/v1/push') ? url : `${url}/loki/api/v1/push`;
  const authHeader = 'Basic ' + Buffer.from(`${user}:${apiKey}`).toString('base64');

  try {
    const response = await fetch(pushUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        streams: [
          {
            stream: {
              job: 'api',
              env: process.env.NODE_ENV || 'development',
            },
            values: batch.map(item => [item.timestampNs, item.line]),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[Loki] Failed to push logs. Status: ${response.status}. Error: ${errorText}`);
    }
  } catch (err) {
    console.error('[Loki] Network error pushing logs:', err);
  }
}

// Flush pending logs on process exit if any
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    flushLokiQueue().catch(() => {});
  });
}
