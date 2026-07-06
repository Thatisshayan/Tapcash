import { randomBytes } from "crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  correlationId?: string;
  service: string;
  context?: Record<string, unknown>;
  duration?: number;
  error?: { name: string; message: string; stack?: string };
}

const SERVICE_NAME = "tapcash-api";

function generateCorrelationId(): string {
  return randomBytes(8).toString("hex");
}

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.service}]`;
  const corr = entry.correlationId ? ` [${entry.correlationId}]` : "";
  const msg = ` ${entry.message}`;
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  const dur = entry.duration !== undefined ? ` (${entry.duration}ms)` : "";
  return `${base}${corr}${msg}${ctx}${dur}`;
}

class Logger {
  private correlationId?: string;
  private context: Record<string, unknown> = {};

  setCorrelationId(id: string): this {
    this.correlationId = id;
    return this;
  }

  generateCorrelationId(): string {
    return generateCorrelationId();
  }

  setContext(ctx: Record<string, unknown>): this {
    this.context = { ...this.context, ...ctx };
    return this;
  }

  child(additionalContext: Record<string, unknown>): Logger {
    const child = new Logger();
    child.correlationId = this.correlationId;
    child.context = { ...this.context, ...additionalContext };
    return child;
  }

  private log(level: LogLevel, message: string, extra?: Partial<LogEntry>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: SERVICE_NAME,
      correlationId: this.correlationId,
      context: Object.keys(this.context).length > 0 ? this.context : undefined,
      ...extra,
    };

    const formatted = formatEntry(entry);

    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, { context });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, { context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, { context });
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errObj =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error
          ? { name: "Unknown", message: String(error) }
          : undefined;

    this.log("error", message, { context, error: errObj });
  }

  timer(name: string): { end: (context?: Record<string, unknown>) => number } {
    const start = Date.now();
    return {
      end: (context?: Record<string, unknown>) => {
        const duration = Date.now() - start;
        this.info(`${name} completed`, { duration, ...context });
        return duration;
      },
    };
  }

  apiRequest(method: string, path: string, correlationId?: string): { end: (status: number) => void } {
    const cid = correlationId || this.correlationId || generateCorrelationId();
    const start = Date.now();
    this.info(`${method} ${path}`, { correlationId: cid });
    return {
      end: (status: number) => {
        const duration = Date.now() - start;
        this.info(`${method} ${path} ${status}`, { correlationId: cid, duration, status });
      },
    };
  }
}

export const logger = new Logger();
export { generateCorrelationId };
export type { LogEntry };
