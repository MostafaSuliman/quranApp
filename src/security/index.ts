/**
 * Security Module Exports
 * Central export point for all security components
 */

// Core Security Manager
export { SecurityManager } from './SecurityManager';
export type { SecurityStatus, SecurityVulnerability, SecurityMetrics, SecurityLevel } from './SecurityManager';

// Security Configuration
export { getSecurityConfig, PRODUCTION_SECURITY_CONFIG, DEVELOPMENT_SECURITY_CONFIG } from './SecurityConfig';
export type { SecurityConfig, ContentSecurityPolicyConfig, EncryptionConfig, AuthenticationConfig } from './SecurityConfig';

// Content Security Policy
export { CSPManager } from './CSPManager';

// XSS Protection
export { XSSProtection } from './XSSProtection';
export type { SanitizationOptions } from './XSSProtection';

// CSRF Protection
export { CSRFProtection } from './CSRFProtection';
export type { CSRFToken } from './CSRFProtection';

// Encryption
export { EncryptionManager } from './EncryptionManager';
export type { EncryptedData, KeyDerivationResult } from './EncryptionManager';

// Authentication
export { AuthenticationManager } from './AuthenticationManager';
export type { User, UserRole, Permission, AuthSession, LoginAttempt } from './AuthenticationManager';

// Rate Limiting
export { RateLimiter } from './RateLimiter';
export type { RateLimitRule, RateLimitEntry, RateLimitResult } from './RateLimiter';

// Privacy Management
export { PrivacyManager } from './PrivacyManager';
export type { PrivacySettings, ConsentRecord, DataProcessingRecord, PrivacyRequest } from './PrivacyManager';

// Islamic Content Integrity
export { IslamicContentIntegrity } from './IslamicContentIntegrity';
export type { ContentSignature, ContentMetadata, VerificationResult, TrustedSource } from './IslamicContentIntegrity';

/**
 * Initialize comprehensive security system
 * Call this function early in your application startup
 */
export async function initializeSecurity(level: SecurityLevel = 'standard'): Promise<SecurityManager> {
  const securityManager = SecurityManager.getInstance();
  await securityManager.initialize(level);
  return securityManager;
}

/**
 * Quick security setup for React components
 */
export function useSecurityHooks() {
  const securityManager = SecurityManager.getInstance();
  const xssProtection = XSSProtection.getInstance();
  const csrfProtection = CSRFProtection.getInstance();
  const encryptionManager = EncryptionManager.getInstance();
  const authManager = AuthenticationManager.getInstance();
  const rateLimiter = RateLimiter.getInstance();
  const privacyManager = PrivacyManager.getInstance();
  const contentIntegrity = IslamicContentIntegrity.getInstance();

  return {
    securityManager,
    xssProtection,
    csrfProtection,
    encryptionManager,
    authManager,
    rateLimiter,
    privacyManager,
    contentIntegrity,
    
    // Helper functions
    sanitizeHTML: (html: string) => xssProtection.sanitizeHTML(html),
    sanitizeText: (text: string) => xssProtection.sanitizeText(text),
    sanitizeArabicText: (text: string) => xssProtection.sanitizeArabicText(text),
    encryptData: (data: any) => encryptionManager.encryptUserData(data),
    decryptData: (data: string) => encryptionManager.decryptUserData(data),
    checkRateLimit: (rule: string, request: any) => rateLimiter.checkLimit(rule, request),
    verifyIslamicContent: (content: string, metadata: ContentMetadata) => 
      contentIntegrity.verifyIslamicContent(content, metadata),
    getSecurityStatus: () => securityManager.getSecurityStatus()
  };
}

/**
 * Security decorator for API calls
 */
export function secureApiCall(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfProtection = CSRFProtection.getInstance();
  const rateLimiter = RateLimiter.getInstance();
  
  // Check rate limit
  const rateLimitResult = rateLimiter.checkLimit('general', {
    ip: 'client',
    url,
    method: options.method || 'GET'
  });
  
  if (!rateLimitResult.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.retryAfter || 0) / 1000)} seconds.`);
  }

  // Add CSRF token for state-changing requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const token = csrfProtection.getTokenFromDocument();
    if (token) {
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': token
      };
    }
  }

  return fetch(url, options);
}

/**
 * Secure component wrapper for React
 */
export function withSecurity<T extends object>(Component: React.ComponentType<T>) {
  return function SecureComponent(props: T) {
    const security = useSecurityHooks();
    
    // Inject security utilities into component props
    const secureProps = {
      ...props,
      security
    } as T;

    return React.createElement(Component, secureProps);
  };
}

// Re-export types for convenience
export type { SecurityLevel, VulnerabilityType } from './SecurityManager';
export type { ContentMetadata, AuthenticityLevel } from './IslamicContentIntegrity';
export type { DataType, ProcessingPurpose, LegalBasis, PrivacyRequestType } from './PrivacyManager';

// Security constants
export const SECURITY_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 3600000, // 1 hour
  CSRF_TOKEN_EXPIRY: 3600000, // 1 hour
  RATE_LIMIT_WINDOW: 900000, // 15 minutes
  ENCRYPTION_KEY_LENGTH: 32,
  HASH_ITERATIONS: 100000,
  CONTENT_VERIFICATION_INTERVAL: 300000, // 5 minutes
  SECURITY_AUDIT_INTERVAL: 3600000, // 1 hour
  VULNERABILITY_SCAN_INTERVAL: 21600000, // 6 hours
} as const;

// Security event types
export const SECURITY_EVENTS = {
  XSS_ATTEMPT: 'xss_attempt',
  CSRF_ATTEMPT: 'csrf_attempt',
  RATE_LIMIT_VIOLATION: 'rate_limit_violation',
  AUTH_FAILURE: 'auth_failure',
  CONTENT_INTEGRITY_VIOLATION: 'content_integrity_violation',
  PRIVACY_REQUEST: 'privacy_request',
  ENCRYPTION_OPERATION: 'encryption_operation',
  SECURITY_ALERT: 'security_alert',
  VULNERABILITY_DETECTED: 'vulnerability_detected'
} as const;

// Security headers
export const SECURITY_HEADERS = {
  CSP: 'Content-Security-Policy',
  HSTS: 'Strict-Transport-Security',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  X_XSS_PROTECTION: 'X-XSS-Protection',
  REFERRER_POLICY: 'Referrer-Policy',
  PERMISSIONS_POLICY: 'Permissions-Policy'
} as const;