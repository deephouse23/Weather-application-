/**
 * Authentication Performance Monitoring Utility
 *
 * Provides detailed timing instrumentation for the authentication flow
 * to identify bottlenecks and measure optimization improvements.
 */

interface PerfMetric {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class AuthPerformanceMonitor {
  private metrics: Map<string, PerfMetric> = new Map()
  private enabled: boolean = process.env.NODE_ENV === 'development'

  /**
   * Start timing an operation
   */
  start(operation: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return

    this.metrics.set(operation, {
      operation,
      startTime: performance.now(),
      metadata,
    })
  }

  /**
   * End timing an operation
   */
  end(operation: string): number | null {
    if (!this.enabled) return null

    const metric = this.metrics.get(operation)
    if (!metric) {
      console.warn(`[AuthPerf] No start metric found for: ${operation}`)
      return null
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    return metric.duration
  }

  /**
   * Log a specific operation's performance
   */
  log(operation: string): void {
    if (!this.enabled) return

    const metric = this.metrics.get(operation)
    if (!metric || !metric.duration) {
      console.warn(`[AuthPerf] No metric data for: ${operation}`)
      return
    }

    console.log(
      `[AuthPerf] ${operation}: ${metric.duration.toFixed(2)}ms`,
      metric.metadata || {}
    )
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): Record<string, PerfMetric> {
    const result: Record<string, PerfMetric> = {}
    this.metrics.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalTime: number
    operations: number
    breakdown: Record<string, number>
  } {
    let totalTime = 0
    const breakdown: Record<string, number> = {}

    this.metrics.forEach((metric) => {
      if (metric.duration) {
        totalTime += metric.duration
        breakdown[metric.operation] = metric.duration
      }
    })

    return {
      totalTime,
      operations: this.metrics.size,
      breakdown,
    }
  }

  /**
   * Log complete auth flow summary
   */
  logSummary(): void {
    if (!this.enabled) return

    const summary = this.getSummary()
    console.log('[AuthPerf] === Authentication Flow Summary ===')
    console.log(`[AuthPerf] Total Time: ${summary.totalTime.toFixed(2)}ms`)
    console.log(`[AuthPerf] Operations: ${summary.operations}`)
    console.log('[AuthPerf] Breakdown:')

    // Sort by duration descending
    const sorted = Object.entries(summary.breakdown).sort((a, b) => b[1] - a[1])
    sorted.forEach(([operation, duration]) => {
      const percentage = ((duration / summary.totalTime) * 100).toFixed(1)
      console.log(`[AuthPerf]   ${operation}: ${duration.toFixed(2)}ms (${percentage}%)`)
    })
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
}

// Singleton instance
export const authPerfMonitor = new AuthPerformanceMonitor()

/**
 * Decorator to automatically time async functions
 */
export function timed(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const operation = operationName || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      authPerfMonitor.start(operation)
      try {
        const result = await originalMethod.apply(this, args)
        authPerfMonitor.end(operation)
        authPerfMonitor.log(operation)
        return result
      } catch (error) {
        authPerfMonitor.end(operation)
        authPerfMonitor.log(operation)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Utility to time a specific async operation
 */
export async function timeAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  authPerfMonitor.start(operation, metadata)
  try {
    const result = await fn()
    authPerfMonitor.end(operation)
    authPerfMonitor.log(operation)
    return result
  } catch (error) {
    authPerfMonitor.end(operation)
    authPerfMonitor.log(operation)
    throw error
  }
}
