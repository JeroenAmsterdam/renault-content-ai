/**
 * Error Classes for Content Creation System
 *
 * Provides structured error handling across the pipeline
 */

/**
 * Base error for content creation failures
 */
export class ContentCreationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ContentCreationError'
  }
}

/**
 * Timeout error - operation took too long
 */
export class TimeoutError extends ContentCreationError {
  constructor(step: string, timeout: number) {
    super(
      `Operation timed out during ${step} (max: ${timeout}ms)`,
      'TIMEOUT',
      { step, timeout }
    )
    this.name = 'TimeoutError'
  }
}

/**
 * Network error - external service unavailable
 */
export class NetworkError extends ContentCreationError {
  constructor(service: string, details?: any) {
    super(`Failed to connect to ${service}`, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

/**
 * Rate limit error - too many requests
 */
export class RateLimitError extends ContentCreationError {
  constructor(resetTime?: number) {
    super(
      'API rate limit exceeded',
      'RATE_LIMIT',
      { resetTime, retryAfter: resetTime ? new Date(resetTime) : undefined }
    )
    this.name = 'RateLimitError'
  }
}

/**
 * Validation error - invalid input
 */
export class ValidationError extends ContentCreationError {
  constructor(field: string, message: string) {
    super(`Invalid ${field}: ${message}`, 'VALIDATION_ERROR', { field })
    this.name = 'ValidationError'
  }
}
