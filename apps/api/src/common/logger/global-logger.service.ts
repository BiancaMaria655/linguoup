import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { pushToLoki } from './loki-client';

let logStream: fs.WriteStream | null = null;

function getLogStream(): fs.WriteStream | null {
  if (logStream) return logStream;
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    logStream = fs.createWriteStream(path.join(logDir, 'api.log'), { flags: 'a' });
    return logStream;
  } catch (err) {
    console.error('Failed to initialize global file logger:', err);
    return null;
  }
}

@Injectable()
export class GlobalLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    this.print('info', message, context);
  }

  error(message: any, stack?: string, context?: string) {
    this.print('error', message, context, stack);
  }

  warn(message: any, context?: string) {
    this.print('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.print('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.print('verbose', message, context);
  }

  private print(level: string, message: any, context?: string, stack?: string) {
    const logObject: any = {
      timestamp: new Date().toISOString(),
      level,
      service: context || 'api',
      message,
    };

    if (stack) {
      logObject.stack = stack;
    }

    const logLine = JSON.stringify(logObject);
    console.log(logLine);

    try {
      const stream = getLogStream();
      if (stream) {
        stream.write(logLine + '\n');
      }
    } catch (err) {
      console.error('Failed to write log to file:', err);
    }

    // Direct push to Loki in production/cloud environment
    pushToLoki(logLine);
  }
}

