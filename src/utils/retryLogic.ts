/**
 * Retry Logic with Exponential Backoff
 *
 * Implements retry mechanism for failed API calls with:
 * - Exponential backoff: 1s, 2s, 4s
 * - Maximum 3 retries
 * - Circuit breaker pattern
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryableErrors?: (error: any) => boolean
  onRetry?: (attempt: number, error: any) => void
}

export interface CircuitBreakerOptions {
  failureThreshold?: number
  resetTimeout?: number
  monitoringPeriod?: number
}

// Default retry configuration
const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'retryableErrors'>> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  backoffMultiplier: 2
}

/**
 * Circuit Breaker States
 */
enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject immediately
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

/**
 * Circuit Breaker for API calls
 */
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private lastFailureTime = 0
  private successCount = 0

  constructor(
    private options: Required<CircuitBreakerOptions> = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 10000 // 10 seconds
    }
  ) {}

  /**
   * Check if circuit allows request
   */
  canRequest(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true
    }

    if (this.state === CircuitState.OPEN) {
      // Check if enough time has passed to try again
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN
        this.successCount = 0
        return true
      }
      return false
    }

    // HALF_OPEN state - allow limited requests
    return true
  }

  /**
   * Record successful request
   */
  recordSuccess(): void {
    this.failureCount = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      // After 3 successful requests in HALF_OPEN, close the circuit
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED
        console.log('[CircuitBreaker] Circuit closed - service recovered')
      }
    }
  }

  /**
   * Record failed request
   */
  recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN) {
      // If it fails in HALF_OPEN, reopen the circuit
      this.state = CircuitState.OPEN
      console.warn('[CircuitBreaker] Circuit reopened - service still failing')
      return
    }

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN
      console.error(`[CircuitBreaker] Circuit opened - ${this.failureCount} failures detected`)
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.lastFailureTime = 0
    this.successCount = 0
  }
}

// Global circuit breaker instance
const apiCircuitBreaker = new CircuitBreaker()

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: any

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Check circuit breaker before attempting
      if (!apiCircuitBreaker.canRequest()) {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable')
      }

      const result = await fn()

      // Success - record it
      apiCircuitBreaker.recordSuccess()

      return result
    } catch (error) {
      lastError = error

      // Check if error is retryable
      const isRetryable = options.retryableErrors
        ? options.retryableErrors(error)
        : isRetryableError(error)

      if (!isRetryable) {
        console.warn('[Retry] Non-retryable error, failing immediately:', error)
        throw error
      }

      // Record failure in circuit breaker
      apiCircuitBreaker.recordFailure()

      // If this was the last attempt, throw the error
      if (attempt === opts.maxRetries) {
        console.error(`[Retry] Max retries (${opts.maxRetries}) exceeded`)
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      )

      // Add jitter (±20%) to prevent thundering herd
      const jitter = delay * 0.2 * (Math.random() * 2 - 1)
      const finalDelay = Math.max(0, delay + jitter)

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${opts.maxRetries} failed. Retrying in ${Math.round(finalDelay)}ms...`,
        error
      )

      // Call retry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt + 1, error)
      }

      // Wait before next retry
      await sleep(finalDelay)
    }
  }

  throw lastError
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return true
  }

  // Timeout errors are retryable
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return true
  }

  // HTTP 5xx errors are retryable
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true
  }

  // HTTP 429 (Too Many Requests) is retryable
  if (error.response?.status === 429) {
    return true
  }

  // HTTP 408 (Request Timeout) is retryable
  if (error.response?.status === 408) {
    return true
  }

  // Circuit breaker open errors are not retryable
  if (error.message?.includes('Circuit breaker')) {
    return false
  }

  // HTTP 4xx client errors (except 408, 429) are NOT retryable
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return false
  }

  // By default, retry unknown errors
  return true
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry decorator for class methods
 */
export function Retry(options: RetryOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return retryWithBackoff(
        () => originalMethod.apply(this, args),
        options
      )
    }

    return descriptor
  }
}

/**
 * Get circuit breaker state
 */
export function getCircuitBreakerState(): CircuitState {
  return apiCircuitBreaker.getState()
}

/**
 * Reset circuit breaker
 */
export function resetCircuitBreaker(): void {
  apiCircuitBreaker.reset()
}

/**
 * Batch retry - retry multiple operations in parallel with backoff
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<PromiseSettledResult<T>[]> {
  const retryOperations = operations.map(op =>
    retryWithBackoff(op, options)
      .then(value => ({ status: 'fulfilled' as const, value }))
      .catch(reason => ({ status: 'rejected' as const, reason }))
  )

  return Promise.all(retryOperations)
}

/**
 * Rate limiter for API calls
 */
export class RateLimiter {
  private queue: Array<() => void> = []
  private activeCount = 0

  constructor(
    private maxConcurrent: number = 5,
    private minDelay: number = 100
  ) {}

  /**
   * Execute function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if at capacity
    if (this.activeCount >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve))
    }

    this.activeCount++

    try {
      const result = await fn()
      return result
    } finally {
      // Add minimum delay between requests
      await sleep(this.minDelay)

      this.activeCount--

      // Process next in queue
      const next = this.queue.shift()
      if (next) {
        next()
      }
    }
  }
}

export default retryWithBackoff
