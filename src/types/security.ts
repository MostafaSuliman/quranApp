/**
 * Security-Related Type Definitions
 * Replaces 'any' types with proper TypeScript interfaces
 */

/**
 * HTTP Request object for security checks
 */
export interface SecurityRequest {
  /** Client IP address */
  ip?: string;
  /** Alternative IP address field */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Authenticated user ID */
  userId?: string;
  /** User email address */
  email?: string;
  /** Request path/URL */
  path?: string;
  /** HTTP method */
  method?: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body (unknown type, must be parsed) */
  body?: unknown;
  /** Query parameters */
  query?: Record<string, string>;
  /** Additional request data */
  [key: string]: unknown;
}

/**
 * Rate limit key generator function type
 */
export interface RateLimitKeyGenerator {
  (request: SecurityRequest): string;
}

/**
 * Security event data from browser events
 */
export interface SecurityEventData {
  /** Error message */
  message?: string;
  /** Source filename */
  filename?: string;
  /** Line number */
  lineno?: number;
  /** Column number */
  colno?: number;
  /** Rejection reason */
  reason?: unknown;
  /** CSP violated directive */
  violatedDirective?: string;
  /** CSP blocked URI */
  blockedURI?: string;
  /** CSP document URI */
  documentURI?: string;
  /** Effective directive */
  effectiveDirective?: string;
  /** Original policy */
  originalPolicy?: string;
  /** Status code */
  statusCode?: number;
  /** Additional event data */
  [key: string]: unknown;
}

/**
 * CSP Violation Report
 */
export interface CSPViolation {
  documentURI: string;
  violatedDirective: string;
  effectiveDirective: string;
  originalPolicy: string;
  blockedURI: string;
  statusCode: number;
  referrer?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  sample?: string;
}

/**
 * User data for privacy management
 */
export interface UserData {
  userId: string;
  email?: string;
  name?: string;
  preferences?: Record<string, unknown>;
  progress?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

/**
 * User data updates
 */
export interface UserDataUpdates {
  email?: string;
  name?: string;
  preferences?: Record<string, unknown>;
  progress?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Anonymized user data for export
 */
export interface AnonymizedUserData {
  userId: string; // Hashed or anonymized
  preferences?: Record<string, unknown>;
  progress?: Record<string, unknown>;
  exportDate: number;
  [key: string]: unknown;
}

/**
 * API configuration for CSRF protection
 */
export interface APIConfig {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * API response for CSRF protection
 */
export interface APIResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: APIConfig;
  [key: string]: unknown;
}

/**
 * CSRF attempt details
 */
export interface CSRFAttemptDetails {
  token?: string;
  origin?: string;
  referer?: string;
  method?: string;
  url?: string;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * JSON data for sanitization (recursive)
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Security report export data
 */
export interface SecurityReportData {
  timestamp: string;
  status: unknown;
  metrics: unknown;
  vulnerabilities: unknown[];
  configuration: {
    level: string;
    components: Record<string, unknown>;
  };
  [key: string]: unknown;
}

/**
 * Auto-remediation data
 */
export interface RemediationData {
  type: string;
  source?: string;
  details?: unknown;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * Type guard to check if value is SecurityRequest
 */
export function isSecurityRequest(value: unknown): value is SecurityRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('ip' in value || 'ipAddress' in value || 'userAgent' in value)
  );
}

/**
 * Type guard to check if value is SecurityEventData
 */
export function isSecurityEventData(value: unknown): value is SecurityEventData {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('message' in value || 'violatedDirective' in value || 'reason' in value)
  );
}

/**
 * Type guard to check if value is JSONValue
 */
export function isJSONValue(value: unknown): value is JSONValue {
  if (value === null) return true;
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') return true;
  if (Array.isArray(value)) return value.every(isJSONValue);
  if (type === 'object') {
    return Object.values(value as object).every(isJSONValue);
  }
  return false;
}
