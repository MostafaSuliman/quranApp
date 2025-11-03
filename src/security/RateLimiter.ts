/**
 * Rate Limiting and DDoS Protection
 * Implements comprehensive rate limiting to prevent abuse and attacks
 */

import { getSecurityConfig } from './SecurityConfig';
import type { SecurityRequest, RateLimitKeyGenerator } from '../types/security';

export interface RateLimitRule {
  name: string;
  windowMs: number;
  maxRequests: number;
  keyGenerator: RateLimitKeyGenerator;
  skipSuccessful?: boolean;
  skipFailed?: boolean;
  blockDuration?: number;
  whitelist?: string[];
  blacklist?: string[];
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockedUntil?: number;
  firstRequest: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private config = getSecurityConfig().rateLimit;
  private store: Map<string, Map<string, RateLimitEntry>> = new Map();
  private rules: Map<string, RateLimitRule> = new Map();

  private constructor() {
    this.initializeDefaultRules();
    this.setupCleanup();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Initialize default rate limiting rules
   */
  private initializeDefaultRules(): void {
    // General API rate limit
    this.addRule({
      name: 'general',
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests,
      keyGenerator: (req) => this.getClientIdentifier(req)
    });

    // Login rate limit (more restrictive)
    this.addRule({
      name: 'login',
      windowMs: 900000, // 15 minutes
      maxRequests: 5,
      keyGenerator: (req) => `login:${this.getClientIdentifier(req)}`,
      blockDuration: 3600000 // 1 hour block after limit exceeded
    });

    // Registration rate limit
    this.addRule({
      name: 'registration',
      windowMs: 3600000, // 1 hour
      maxRequests: 3,
      keyGenerator: (req) => `register:${this.getClientIdentifier(req)}`,
      blockDuration: 86400000 // 24 hour block
    });

    // Password reset rate limit
    this.addRule({
      name: 'password_reset',
      windowMs: 3600000, // 1 hour
      maxRequests: 3,
      keyGenerator: (req) => `reset:${req.email || this.getClientIdentifier(req)}`
    });

    // Search rate limit
    this.addRule({
      name: 'search',
      windowMs: 60000, // 1 minute
      maxRequests: 30,
      keyGenerator: (req) => `search:${this.getClientIdentifier(req)}`
    });

    // API upload rate limit
    this.addRule({
      name: 'upload',
      windowMs: 300000, // 5 minutes
      maxRequests: 10,
      keyGenerator: (req) => `upload:${this.getClientIdentifier(req)}`
    });

    // Comments/feedback rate limit
    this.addRule({
      name: 'comments',
      windowMs: 300000, // 5 minutes
      maxRequests: 20,
      keyGenerator: (req) => `comment:${this.getClientIdentifier(req)}`
    });

    // Islamic content access (more lenient for religious content)
    this.addRule({
      name: 'quran_content',
      windowMs: 60000, // 1 minute
      maxRequests: 100,
      keyGenerator: (req) => `quran:${this.getClientIdentifier(req)}`,
      skipSuccessful: true // Don't count successful Quran content requests
    });

    // Audio streaming rate limit
    this.addRule({
      name: 'audio_stream',
      windowMs: 300000, // 5 minutes
      maxRequests: 50,
      keyGenerator: (req) => `audio:${this.getClientIdentifier(req)}`
    });

    // Aggressive rate limit for suspicious patterns
    this.addRule({
      name: 'suspicious',
      windowMs: 300000, // 5 minutes
      maxRequests: 1,
      keyGenerator: (req) => `suspicious:${this.getClientIdentifier(req)}`,
      blockDuration: 86400000 // 24 hour block
    });
  }

  /**
   * Add a new rate limiting rule
   */
  public addRule(rule: RateLimitRule): void {
    this.rules.set(rule.name, rule);
    if (!this.store.has(rule.name)) {
      this.store.set(rule.name, new Map());
    }
  }

  /**
   * Check rate limit for a request
   */
  public checkLimit(ruleName: string, request: SecurityRequest): RateLimitResult {
    const rule = this.rules.get(ruleName);
    if (!rule) {
      throw new Error(`Rate limit rule '${ruleName}' not found`);
    }

    const key = rule.keyGenerator(request);
    const now = Date.now();

    // Check whitelist
    if (rule.whitelist && this.isWhitelisted(key, rule.whitelist)) {
      return {
        allowed: true,
        remaining: rule.maxRequests,
        resetTime: now + rule.windowMs
      };
    }

    // Check blacklist
    if (rule.blacklist && this.isBlacklisted(key, rule.blacklist)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + rule.windowMs,
        retryAfter: rule.windowMs
      };
    }

    const ruleStore = this.store.get(ruleName)!;
    let entry = ruleStore.get(key);

    // Initialize or reset entry if window expired
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + rule.windowMs,
        blocked: false,
        firstRequest: now
      };
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: entry.blockedUntil - now
      };
    }

    // Reset block status if block duration expired
    if (entry.blocked && entry.blockedUntil && now >= entry.blockedUntil) {
      entry.blocked = false;
      entry.blockedUntil = undefined;
      entry.count = 0;
      entry.resetTime = now + rule.windowMs;
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > rule.maxRequests) {
      entry.blocked = true;
      if (rule.blockDuration) {
        entry.blockedUntil = now + rule.blockDuration;
      }
      
      // Store updated entry
      ruleStore.set(key, entry);

      // Report potential abuse
      this.reportRateLimitViolation(ruleName, key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: rule.blockDuration || (entry.resetTime - now)
      };
    }

    // Store updated entry
    ruleStore.set(key, entry);

    return {
      allowed: true,
      remaining: rule.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Check multiple rate limits
   */
  public checkMultipleLimits(ruleNames: string[], request: SecurityRequest): { [ruleName: string]: RateLimitResult } {
    const results: { [ruleName: string]: RateLimitResult } = {};
    
    for (const ruleName of ruleNames) {
      results[ruleName] = this.checkLimit(ruleName, request);
    }

    return results;
  }

  /**
   * Reset rate limit for specific key
   */
  public resetLimit(ruleName: string, key: string): void {
    const ruleStore = this.store.get(ruleName);
    if (ruleStore) {
      ruleStore.delete(key);
    }
  }

  /**
   * Block specific key for a duration
   */
  public blockKey(ruleName: string, key: string, durationMs: number): void {
    const rule = this.rules.get(ruleName);
    if (!rule) return;

    const ruleStore = this.store.get(ruleName)!;
    const now = Date.now();
    
    const entry: RateLimitEntry = {
      count: rule.maxRequests + 1,
      resetTime: now + rule.windowMs,
      blocked: true,
      blockedUntil: now + durationMs,
      firstRequest: now
    };

    ruleStore.set(key, entry);
  }

  /**
   * Get client identifier for rate limiting
   */
  private getClientIdentifier(request: SecurityRequest): string {
    // Combine multiple factors for better identification
    const factors = [
      request.ip || request.ipAddress || 'unknown-ip',
      request.userAgent || 'unknown-ua',
      request.userId || 'anonymous'
    ];

    return factors.join('|');
  }

  /**
   * Check if key is whitelisted
   */
  private isWhitelisted(key: string, whitelist: string[]): boolean {
    return whitelist.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
      }
      return key.includes(pattern);
    });
  }

  /**
   * Check if key is blacklisted
   */
  private isBlacklisted(key: string, blacklist: string[]): boolean {
    return blacklist.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
      }
      return key.includes(pattern);
    });
  }

  /**
   * Detect suspicious patterns
   */
  public detectSuspiciousActivity(request: SecurityRequest): boolean {
    const patterns = [
      // Rapid requests from same IP
      () => this.detectRapidRequests(request),
      // SQL injection patterns
      () => this.detectSQLInjection(request),
      // XSS patterns
      () => this.detectXSSPatterns(request),
      // Bot patterns
      () => this.detectBotPatterns(request),
      // Invalid content access patterns
      () => this.detectInvalidContentAccess(request)
    ];

    return patterns.some(pattern => pattern());
  }

  /**
   * Detect rapid requests
   */
  private detectRapidRequests(request: SecurityRequest): boolean {
    const key = this.getClientIdentifier(request);
    const now = Date.now();
    const window = 10000; // 10 seconds
    const threshold = 50; // requests

    // Get request timestamps for this client
    const timestamps = this.getRequestTimestamps(key);
    timestamps.push(now);

    // Filter to recent requests
    const recentRequests = timestamps.filter(ts => now - ts < window);
    
    // Update stored timestamps
    this.setRequestTimestamps(key, recentRequests);

    return recentRequests.length > threshold;
  }

  /**
   * Detect SQL injection attempts
   */
  private detectSQLInjection(request: SecurityRequest): boolean {
    const sqlPatterns = [
      /union\s+select/i,
      /or\s+1\s*=\s*1/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /update\s+set/i,
      /delete\s+from/i,
      /exec\s*\(/i,
      /script>/i
    ];

    const checkString = JSON.stringify(request).toLowerCase();
    return sqlPatterns.some(pattern => pattern.test(checkString));
  }

  /**
   * Detect XSS patterns
   */
  private detectXSSPatterns(request: SecurityRequest): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];

    const checkString = JSON.stringify(request);
    return xssPatterns.some(pattern => pattern.test(checkString));
  }

  /**
   * Detect bot patterns
   */
  private detectBotPatterns(request: any): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /automated/i
    ];

    const userAgent = request.userAgent || '';
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Detect invalid content access patterns
   */
  private detectInvalidContentAccess(request: any): boolean {
    // Check for attempts to access non-existent Islamic content
    if (request.path && request.path.includes('/quran/')) {
      // Example: attempting to access invalid surah numbers
      const surahMatch = request.path.match(/\/surah\/(\d+)/);
      if (surahMatch) {
        const surahNumber = parseInt(surahMatch[1]);
        if (surahNumber < 1 || surahNumber > 114) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get request timestamps for client
   */
  private getRequestTimestamps(key: string): number[] {
    const stored = localStorage.getItem(`rate_limit_timestamps_${key}`);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Set request timestamps for client
   */
  private setRequestTimestamps(key: string, timestamps: number[]): void {
    // Keep only last 100 timestamps to prevent memory issues
    const limited = timestamps.slice(-100);
    localStorage.setItem(`rate_limit_timestamps_${key}`, JSON.stringify(limited));
  }

  /**
   * Apply rate limiting middleware
   */
  public applyRateLimit(ruleName: string) {
    return (request: any, next: Function) => {
      const result = this.checkLimit(ruleName, request);
      
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((result.retryAfter || 0) / 1000)} seconds.`);
      }

      // Check for suspicious activity
      if (this.detectSuspiciousActivity(request)) {
        this.checkLimit('suspicious', request);
        this.reportSuspiciousActivity(request);
      }

      return next();
    };
  }

  /**
   * Get rate limit status for monitoring
   */
  public getRateLimitStatus(): { [ruleName: string]: { [key: string]: RateLimitEntry } } {
    const status: { [ruleName: string]: { [key: string]: RateLimitEntry } } = {};
    
    for (const [ruleName, ruleStore] of this.store.entries()) {
      status[ruleName] = {};
      for (const [key, entry] of ruleStore.entries()) {
        status[ruleName][key] = { ...entry };
      }
    }

    return status;
  }

  /**
   * Report rate limit violation
   */
  private reportRateLimitViolation(ruleName: string, key: string, entry: RateLimitEntry): void {
    const report = {
      type: 'rate_limit_violation',
      rule: ruleName,
      key,
      count: entry.count,
      duration: Date.now() - entry.firstRequest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.warn('Rate limit violation detected:', report);

    // Send to security monitoring in production
    if (import.meta.env.MODE === 'production') {
      fetch('/api/security/rate-limit-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      }).catch(err => {
        console.error('Failed to report rate limit violation:', err);
      });
    }
  }

  /**
   * Report suspicious activity
   */
  private reportSuspiciousActivity(request: any): void {
    const report = {
      type: 'suspicious_activity',
      request: {
        ...request,
        timestamp: Date.now()
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.warn('Suspicious activity detected:', report);

    // Send to security monitoring in production
    if (import.meta.env.MODE === 'production') {
      fetch('/api/security/suspicious-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      }).catch(err => {
        console.error('Failed to report suspicious activity:', err);
      });
    }
  }

  /**
   * Setup cleanup of expired entries
   */
  private setupCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [ruleName, ruleStore] of this.store.entries()) {
        for (const [key, entry] of ruleStore.entries()) {
          // Remove expired entries
          if (now >= entry.resetTime && !entry.blocked) {
            ruleStore.delete(key);
          }
          // Remove entries where block has expired
          else if (entry.blocked && entry.blockedUntil && now >= entry.blockedUntil) {
            ruleStore.delete(key);
          }
        }
      }
    }, 300000); // Clean up every 5 minutes
  }

  /**
   * Clear all rate limit data for key
   */
  public clearLimitsForKey(key: string): void {
    for (const ruleStore of this.store.values()) {
      ruleStore.delete(key);
    }
  }

  /**
   * Export rate limit configuration
   */
  public exportConfig(): { [ruleName: string]: RateLimitRule } {
    const config: { [ruleName: string]: RateLimitRule } = {};
    for (const [name, rule] of this.rules.entries()) {
      config[name] = { ...rule };
    }
    return config;
  }
}