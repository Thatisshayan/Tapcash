/**
 * Monitoring and Logging System
 * Provides error tracking, performance monitoring, and analytics
 */

interface ErrorLog {
  message: string;
  stack?: string;
  userId?: string;
  context?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: any;
}

interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: any;
  timestamp: Date;
}

class MonitoringService {
  private static instance: MonitoringService;
  private errorQueue: ErrorLog[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private analyticsQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Initialize monitoring service
    this.startFlushInterval();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Log an error
   */
  logError(error: Error | string, context?: any, severity: ErrorLog['severity'] = 'medium') {
    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      timestamp: new Date(),
      severity
    };

    this.errorQueue.push(errorLog);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Monitoring Error]', errorLog);
    }

    // Send critical errors immediately
    if (severity === 'critical') {
      this.flushErrors();
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(name: string, duration: number, metadata?: any) {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      metadata
    };

    this.metricsQueue.push(metric);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`[Monitoring] Slow operation: ${name} took ${duration}ms`);
    }
  }

  /**
   * Track analytics event
   */
  trackEvent(event: string, properties?: any, userId?: string) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      userId,
      properties,
      timestamp: new Date()
    };

    this.analyticsQueue.push(analyticsEvent);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitoring Event]', analyticsEvent);
    }
  }

  /**
   * Track API usage
   */
  trackAPICall(endpoint: string, method: string, statusCode: number, duration: number, userId?: string) {
    this.trackEvent('api_call', {
      endpoint,
      method,
      statusCode,
      duration,
      userId
    });

    // Track as performance metric
    this.trackPerformance(`api_${method}_${endpoint}`, duration, {
      statusCode,
      userId
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, userId: string, metadata?: any) {
    this.trackEvent('user_action', {
      action,
      ...metadata
    }, userId);
  }

  /**
   * Track transaction
   */
  trackTransaction(type: string, amount: number, userId: string, status: string) {
    this.trackEvent('transaction', {
      type,
      amount,
      status
    }, userId);
  }

  /**
   * Track fraud detection
   */
  trackFraudAlert(type: string, severity: string, userId: string, metadata?: any) {
    this.trackEvent('fraud_alert', {
      type,
      severity,
      ...metadata
    }, userId);

    // Also log as error if critical
    if (severity === 'critical') {
      this.logError(`Fraud alert: ${type}`, { userId, ...metadata }, 'critical');
    }
  }

  /**
   * Start automatic flush interval
   */
  private startFlushInterval() {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  /**
   * Flush all queues
   */
  async flush() {
    await Promise.all([
      this.flushErrors(),
      this.flushMetrics(),
      this.flushAnalytics()
    ]);
  }

  /**
   * Flush error queue
   */
  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to error tracking service (e.g., Sentry)
      if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
        // Send to Sentry or similar service
        await this.sendToErrorTracking(errors);
      }

      // Also log to Firebase for admin review
      if (typeof window === 'undefined') {
        // Server-side: use Firebase Admin
        const { adminDb } = await import('./firebaseAdmin');
        const batch = adminDb.batch();
        
        errors.forEach(error => {
          const ref = adminDb.collection('error_logs').doc();
          batch.set(ref, error);
        });

        await batch.commit();
      }
    } catch (error) {
      console.error('Failed to flush errors:', error);
      // Re-add errors to queue
      this.errorQueue.push(...errors);
    }
  }

  /**
   * Flush metrics queue
   */
  private async flushMetrics() {
    if (this.metricsQueue.length === 0) return;

    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      // In production, send to analytics service
      if (process.env.NODE_ENV === 'production') {
        await this.sendToAnalytics(metrics);
      }
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  /**
   * Flush analytics queue
   */
  private async flushAnalytics() {
    if (this.analyticsQueue.length === 0) return;

    const events = [...this.analyticsQueue];
    this.analyticsQueue = [];

    try {
      // In production, send to analytics service (e.g., Google Analytics, Mixpanel)
      if (process.env.NODE_ENV === 'production') {
        await this.sendToAnalytics(events);
      }
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }

  /**
   * Send errors to tracking service
   */
  private async sendToErrorTracking(errors: ErrorLog[]) {
    // Implement Sentry or similar integration
    // For now, just log
    console.log('Sending errors to tracking service:', errors.length);
  }

  /**
   * Send data to analytics service
   */
  private async sendToAnalytics(data: any[]) {
    // Implement Google Analytics, Mixpanel, or similar integration
    // For now, just log
    console.log('Sending data to analytics service:', data.length);
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

/**
 * Performance measurement utility
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
  }

  end(metadata?: any) {
    const duration = Date.now() - this.startTime;
    monitoring.trackPerformance(this.name, duration, metadata);
    return duration;
  }
}

/**
 * Decorator for tracking function performance
 */
export function trackPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const timer = new PerformanceTimer(`${target.constructor.name}.${propertyKey}`);
    try {
      const result = await originalMethod.apply(this, args);
      timer.end({ success: true });
      return result;
    } catch (error) {
      timer.end({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  return descriptor;
}

/**
 * Error boundary for React components
 */
export class ErrorBoundary {
  static captureError(error: Error, errorInfo?: any) {
    monitoring.logError(error, errorInfo, 'high');
  }
}

/**
 * API monitoring middleware
 */
export function monitorAPI(endpoint: string, method: string) {
  return async (handler: Function) => {
    const timer = new PerformanceTimer(`api_${method}_${endpoint}`);
    let statusCode = 200;

    try {
      const result = await handler();
      timer.end({ statusCode });
      return result;
    } catch (error) {
      statusCode = 500;
      timer.end({ statusCode, error: error instanceof Error ? error.message : 'Unknown error' });
      monitoring.logError(error as Error, { endpoint, method }, 'high');
      throw error;
    }
  };
}

// Export types
export type { ErrorLog, PerformanceMetric, AnalyticsEvent };

// Made with Bob
