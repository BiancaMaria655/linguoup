import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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
    console.error('Failed to initialize file logger:', err);
    return null;
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger implements NestLoggerService {
  private serviceName: string = 'api';

  setService(name: string) {
    this.serviceName = name;
  }

  log(message: any, context?: any) {
    this.print('info', message, context);
  }

  error(message: any, trace?: string, context?: any) {
    this.print('error', message, context, trace);
  }

  warn(message: any, context?: any) {
    this.print('warn', message, context);
  }

  debug(message: any, context?: any) {
    this.print('debug', message, context);
  }

  verbose(message: any, context?: any) {
    this.print('verbose', message, context);
  }

  private print(level: string, message: any, context?: any, trace?: string) {
    const logObject: any = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
    };

    if (context && typeof context === 'object') {
      if (context.trace_id) logObject.trace_id = context.trace_id;
      if (context.user_id) logObject.user_id = context.user_id;
      if (context.tenant_id) logObject.tenant_id = context.tenant_id;
      if (context.metadata) logObject.metadata = context.metadata;
    } else if (context && typeof context === 'string') {
      logObject.context = context;
    }

    if (trace) {
      logObject.stack = trace;
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
  }
}
