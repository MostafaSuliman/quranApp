/**
 * Core Security Configuration for QuranApp
 * Implements comprehensive security measures for Islamic content protection
 */

export interface SecurityConfig {
  csp: ContentSecurityPolicyConfig;
  encryption: EncryptionConfig;
  auth: AuthenticationConfig;
  rateLimit: RateLimitConfig;
  privacy: PrivacyConfig;
  contentIntegrity: ContentIntegrityConfig;
}

export interface ContentSecurityPolicyConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  fontSrc: string[];
  mediaSrc: string[];
  objectSrc: string[];
  frameSrc: string[];
  workerSrc: string[];
  manifestSrc: string[];
  upgradeInsecureRequests: boolean;
  blockAllMixedContent: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
  hashAlgorithm: string;
}

export interface AuthenticationConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordPolicy: PasswordPolicy;
  twoFactorAuth: TwoFactorConfig;
  tokenExpiry: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
}

export interface TwoFactorConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'email')[];
  backupCodesCount: number;
  tokenValidity: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface PrivacyConfig {
  gdprCompliance: boolean;
  ccpaCompliance: boolean;
  dataRetentionPeriod: number;
  anonymizationEnabled: boolean;
  consentRequired: boolean;
  rightToErasure: boolean;
  dataPortability: boolean;
}

export interface ContentIntegrityConfig {
  enableDigitalSignatures: boolean;
  verificationEnabled: boolean;
  hashAlgorithm: string;
  signatureAlgorithm: string;
  trustedSources: string[];
  integrityChecks: boolean;
}

// Production security configuration
export const PRODUCTION_SECURITY_CONFIG: SecurityConfig = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      // "'unsafe-inline'" removed - using nonces instead for security
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net"
    ],
    styleSrc: [
      "'self'",
      // "'unsafe-inline'" removed - using nonces instead for security
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https://api.quran.com",
      "https://cdn.islamic.network"
    ],
    connectSrc: [
      "'self'",
      "https://api.quran.com",
      "https://cdn.islamic.network",
      "wss://api.quran.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "data:"
    ],
    mediaSrc: [
      "'self'",
      "https://cdn.islamic.network",
      "blob:",
      "data:"
    ],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
    workerSrc: ["'self'"],
    manifestSrc: ["'self'"],
    upgradeInsecureRequests: true,
    blockAllMixedContent: true
  },
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
    ivLength: 16,
    saltLength: 32,
    iterations: 100000,
    hashAlgorithm: 'SHA-256'
  },
  auth: {
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      preventPersonalInfo: true
    },
    twoFactorAuth: {
      enabled: true,
      methods: ['totp', 'email'],
      backupCodesCount: 10,
      tokenValidity: 300000 // 5 minutes
    },
    tokenExpiry: 3600000 // 1 hour
  },
  rateLimit: {
    windowMs: 900000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false
  },
  privacy: {
    gdprCompliance: true,
    ccpaCompliance: true,
    dataRetentionPeriod: 31536000000, // 1 year
    anonymizationEnabled: true,
    consentRequired: true,
    rightToErasure: true,
    dataPortability: true
  },
  contentIntegrity: {
    enableDigitalSignatures: true,
    verificationEnabled: true,
    hashAlgorithm: 'SHA-256',
    signatureAlgorithm: 'RSA-PSS',
    trustedSources: [
      'api.quran.com',
      'cdn.islamic.network',
      'quran.com'
    ],
    integrityChecks: true
  }
};

// Development security configuration (less restrictive)
export const DEVELOPMENT_SECURITY_CONFIG: SecurityConfig = {
  ...PRODUCTION_SECURITY_CONFIG,
  csp: {
    ...PRODUCTION_SECURITY_CONFIG.csp,
    scriptSrc: [
      ...PRODUCTION_SECURITY_CONFIG.csp.scriptSrc,
      "'unsafe-eval'", // Required for Vite dev mode hot reload
      "'unsafe-inline'", // Only for development - removed in production
      "localhost:*",
      "127.0.0.1:*"
    ],
    connectSrc: [
      ...PRODUCTION_SECURITY_CONFIG.csp.connectSrc,
      "ws://localhost:*",
      "ws://127.0.0.1:*",
      "http://localhost:*",
      "http://127.0.0.1:*"
    ]
  },
  auth: {
    ...PRODUCTION_SECURITY_CONFIG.auth,
    maxLoginAttempts: 10, // More lenient for development
    lockoutDuration: 300000 // 5 minutes
  }
};

export const getSecurityConfig = (): SecurityConfig => {
  return import.meta.env.MODE === 'production' 
    ? PRODUCTION_SECURITY_CONFIG 
    : DEVELOPMENT_SECURITY_CONFIG;
};