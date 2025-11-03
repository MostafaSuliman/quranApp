/**
 * Logger Service - Centralized Logging System
 * Replaces console.log statements with structured, configurable logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type LogContext = Record<string, unknown>

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: LogContext
  stack?: string
}

export interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  maxStoredLogs: number
  prefix?: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: import.meta.env.DEV ? 'debug' : 'info',
  enableConsole: true,
  enableStorage: import.meta.env.DEV,
  maxStoredLogs: 1000,
  prefix: '[QuranApp]'
}

class Logger {
  private config: LoggerConfig
  private logs: LogEntry[] = []
  private logListeners: Array<(entry: LogEntry) => void> = []

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    const prefix = this.config.prefix || ''
    return `${prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      stack: level === 'error' || level === 'fatal' ? new Error().stack : undefined
    }

    // Store log entry
    if (this.config.enableStorage) {
      this.logs.push(entry)
      if (this.logs.length > this.config.maxStoredLogs) {
        this.logs.shift()
      }
    }

    // Emit to listeners
    this.logListeners.forEach(listener => listener(entry))

    // Console output
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(level, message)
      const contextStr = context ? ` ${JSON.stringify(context)}` : ''

      switch (level) {
        case 'debug':
          console.debug(formattedMessage + contextStr)
          break
        case 'info':
          console.info(formattedMessage + contextStr)
          break
        case 'warn':
          console.warn(formattedMessage + contextStr)
          break
        case 'error':
        case 'fatal':
          console.error(formattedMessage + contextStr, entry.stack)
          break
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  fatal(message: string, context?: LogContext): void {
    this.log('fatal', message, context)
  }

  // Create a child logger with additional prefix
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: `${this.config.prefix} [${prefix}]`
    })
  }

  // Subscribe to log events
  onLog(listener: (entry: LogEntry) => void): () => void {
    this.logListeners.push(listener)
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener)
    }
  }

  // Get stored logs
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = level
      ? this.logs.filter(log => log.level === level)
      : this.logs

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit)
    }

    return filteredLogs
  }

  // Clear stored logs
  clearLogs(): void {
    this.logs = []
  }

  // Update configuration
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Global logger instance
export const logger = new Logger()

// Specialized loggers for different modules
export const audioLogger = logger.child('Audio')
export const storeLogger = logger.child('Store')
export const apiLogger = logger.child('API')
export const autoFixLogger = logger.child('AutoFix')
export const securityLogger = logger.child('Security')
export const performanceLogger = logger.child('Performance')

// Export Logger class for custom instances
export { Logger }
