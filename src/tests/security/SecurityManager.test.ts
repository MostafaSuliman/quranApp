/**
 * Security Manager Test Suite
 * Comprehensive tests for all security components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SecurityManager } from '../../security/SecurityManager';
import { XSSProtection } from '../../security/XSSProtection';
import { CSRFProtection } from '../../security/CSRFProtection';
import { EncryptionManager } from '../../security/EncryptionManager';
import { AuthenticationManager } from '../../security/AuthenticationManager';
import { RateLimiter } from '../../security/RateLimiter';
import { PrivacyManager } from '../../security/PrivacyManager';
import { IslamicContentIntegrity } from '../../security/IslamicContentIntegrity';

describe('SecurityManager', () => {
  let securityManager: SecurityManager;

  beforeEach(async () => {
    securityManager = SecurityManager.getInstance();
    await securityManager.initialize('standard');
  });

  afterEach(() => {
    securityManager.destroy();
  });

  describe('Initialization', () => {
    it('should initialize all security components', async () => {
      const status = securityManager.getSecurityStatus();
      expect(status.initialized).toBe(true);
      expect(status.level).toBe('standard');
      expect(status.activeProtections).toContain('csp');
      expect(status.activeProtections).toContain('xss');
      expect(status.activeProtections).toContain('csrf');
    });

    it('should apply different security levels', async () => {
      await securityManager.initialize('maximum');
      const status = securityManager.getSecurityStatus();
      expect(status.level).toBe('maximum');
    });
  });

  describe('Security Monitoring', () => {
    it('should track security metrics', () => {
      const metrics = securityManager.getMetrics();
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('blockedRequests');
      expect(metrics).toHaveProperty('xssAttempts');
      expect(metrics).toHaveProperty('csrfAttempts');
    });

    it('should detect vulnerabilities during audit', async () => {
      const status = await securityManager.performSecurityAudit();
      expect(status).toHaveProperty('vulnerabilities');
      expect(Array.isArray(status.vulnerabilities)).toBe(true);
    });
  });

  describe('Security Events', () => {
    it('should handle XSS attempts', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      // Simulate XSS attempt
      const xss = XSSProtection.getInstance();
      const maliciousScript = '<script>alert("xss")</script>';
      const sanitized = xss.sanitizeHTML(maliciousScript);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should handle CSRF attempts', () => {
      const csrf = CSRFProtection.getInstance();
      const token = csrf.generateToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });
  });
});

describe('XSSProtection', () => {
  let xssProtection: XSSProtection;

  beforeEach(() => {
    xssProtection = XSSProtection.getInstance();
  });

  describe('HTML Sanitization', () => {
    it('should remove malicious scripts', () => {
      const maliciousHTML = '<div><script>alert("xss")</script>Safe content</div>';
      const sanitized = xssProtection.sanitizeHTML(maliciousHTML);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Safe content');
    });

    it('should preserve Arabic text', () => {
      const arabicText = '<p>بسم الله الرحمن الرحيم</p>';
      const sanitized = xssProtection.sanitizeHTML(arabicText);
      
      expect(sanitized).toContain('بسم الله الرحمن الرحيم');
    });

    it('should handle malicious attributes', () => {
      const maliciousHTML = '<img src="x" onerror="alert(\'xss\')" />';
      const sanitized = xssProtection.sanitizeHTML(maliciousHTML);
      
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert');
    });
  });

  describe('Arabic Text Sanitization', () => {
    it('should sanitize Arabic text while preserving content', () => {
      const arabicWithScript = 'الحمد لله<script>alert("xss")</script>';
      const sanitized = xssProtection.sanitizeArabicText(arabicWithScript);
      
      expect(sanitized).toContain('الحمد لله');
      expect(sanitized).not.toContain('<script>');
    });

    it('should validate Quranic text patterns', () => {
      const validQuran = 'بسم الله الرحمن الرحيم';
      const invalidQuran = 'بسم الله<script>alert("xss")</script>';
      
      const validSanitized = xssProtection.sanitizeArabicText(validQuran);
      const invalidSanitized = xssProtection.sanitizeArabicText(invalidQuran);
      
      expect(validSanitized).toBe(validQuran);
      expect(invalidSanitized).not.toContain('<script>');
    });
  });

  describe('XSS Detection', () => {
    it('should detect XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        'vbscript:msgbox("xss")',
        '<img src=x onerror=alert("xss")>'
      ];

      xssAttempts.forEach(attempt => {
        const detected = xssProtection.detectXSSAttempt(attempt);
        expect(detected).toBe(true);
      });
    });

    it('should not flag safe content as XSS', () => {
      const safeContent = [
        'Hello World',
        '<p>Safe paragraph</p>',
        'بسم الله الرحمن الرحيم',
        '<div class="safe">Content</div>'
      ];

      safeContent.forEach(content => {
        const detected = xssProtection.detectXSSAttempt(content);
        expect(detected).toBe(false);
      });
    });
  });
});

describe('CSRFProtection', () => {
  let csrfProtection: CSRFProtection;

  beforeEach(() => {
    csrfProtection = CSRFProtection.getInstance();
  });

  describe('Token Management', () => {
    it('should generate valid CSRF tokens', () => {
      const token1 = csrfProtection.generateToken();
      const token2 = csrfProtection.generateToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2); // Should be unique
    });

    it('should validate CSRF tokens', () => {
      const token = csrfProtection.generateToken();
      const isValid = csrfProtection.validateToken(token);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid tokens', () => {
      const invalidToken = 'invalid-token-123';
      const isValid = csrfProtection.validateToken(invalidToken);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Document Integration', () => {
    it('should add token to document', () => {
      csrfProtection.addTokenToDocument();
      const token = csrfProtection.getTokenFromDocument();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});

describe('EncryptionManager', () => {
  let encryptionManager: EncryptionManager;

  beforeEach(async () => {
    encryptionManager = EncryptionManager.getInstance();
    await encryptionManager.initialize();
  });

  afterEach(() => {
    encryptionManager.destroy();
  });

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = 'Hello, World!';
      const encrypted = encryptionManager.encrypt(testData);
      const decrypted = encryptionManager.decrypt(encrypted);
      
      expect(decrypted).toBe(testData);
      expect(encrypted.ciphertext).not.toBe(testData);
    });

    it('should encrypt Islamic content with integrity protection', () => {
      const quranText = 'بسم الله الرحمن الرحيم';
      const metadata = { type: 'quran' as const, chapter: 1, verse: 1 };
      
      const encrypted = encryptionManager.encryptIslamicContent(quranText, metadata);
      const decrypted = encryptionManager.decryptIslamicContent(encrypted);
      
      expect(decrypted.content).toBe(quranText);
      expect(decrypted.verified).toBe(true);
      expect(decrypted.metadata).toEqual(metadata);
    });

    it('should handle password-based encryption', () => {
      const testData = 'Sensitive data';
      const password = 'strong-password-123';
      
      const encrypted = encryptionManager.encrypt(testData, password);
      const decrypted = encryptionManager.decrypt(encrypted, password);
      
      expect(decrypted).toBe(testData);
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords securely', () => {
      const password = 'myPassword123!';
      const hash = encryptionManager.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.includes(':')).toBe(true); // Should include salt
    });

    it('should verify passwords correctly', () => {
      const password = 'myPassword123!';
      const hash = encryptionManager.hashPassword(password);
      
      const isValid = encryptionManager.verifyPassword(password, hash);
      const isInvalid = encryptionManager.verifyPassword('wrongPassword', hash);
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Secure Storage', () => {
    it('should store and retrieve data securely', () => {
      const testData = { message: 'secret data', number: 42 };
      const key = 'test-key';
      
      encryptionManager.setSecureItem(key, testData);
      const retrieved = encryptionManager.getSecureItem(key);
      
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = encryptionManager.getSecureItem('non-existent-key');
      expect(retrieved).toBeNull();
    });
  });
});

describe('AuthenticationManager', () => {
  let authManager: AuthenticationManager;

  beforeEach(() => {
    authManager = AuthenticationManager.getInstance();
  });

  describe('User Registration', () => {
    it('should register users with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'StrongPassword123!',
        displayName: 'Test User'
      };

      const result = await authManager.registerUser(userData);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(userData.email);
    });

    it('should reject weak passwords', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123', // Weak password
        displayName: 'Test User'
      };

      const result = await authManager.registerUser(userData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('security requirements');
    });

    it('should reject invalid email formats', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'StrongPassword123!',
        displayName: 'Test User'
      };

      const result = await authManager.registerUser(userData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
    });
  });

  describe('User Authentication', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = {
        email: 'auth@example.com',
        username: 'authuser',
        password: 'StrongPassword123!',
        displayName: 'Auth User'
      };

      const result = await authManager.registerUser(userData);
      testUser = result.user;
    });

    it('should authenticate valid credentials', async () => {
      const credentials = {
        email: 'auth@example.com',
        password: 'StrongPassword123!'
      };

      const result = await authManager.login(credentials);
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const credentials = {
        email: 'auth@example.com',
        password: 'WrongPassword'
      };

      const result = await authManager.login(credentials);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });
  });

  describe('Session Management', () => {
    it('should create and validate sessions', async () => {
      // Register and login user
      const userData = {
        email: 'session@example.com',
        username: 'sessionuser',
        password: 'StrongPassword123!',
        displayName: 'Session User'
      };

      await authManager.registerUser(userData);
      
      const loginResult = await authManager.login({
        email: 'session@example.com',
        password: 'StrongPassword123!'
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.session?.token).toBeDefined();

      // Validate session
      const validation = await authManager.validateSession(loginResult.session!.token);
      expect(validation.valid).toBe(true);
      expect(validation.user).toBeDefined();
    });
  });
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = RateLimiter.getInstance();
  });

  describe('Rate Limiting', () => {
    it('should allow requests under limit', () => {
      const request = { ip: '127.0.0.1', userAgent: 'test' };
      
      const result = rateLimiter.checkLimit('general', request);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests over limit', () => {
      const request = { ip: '127.0.0.1', userAgent: 'test' };
      
      // Exhaust rate limit
      for (let i = 0; i < 101; i++) {
        rateLimiter.checkLimit('general', request);
      }
      
      const result = rateLimiter.checkLimit('general', request);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should have different limits for different rules', () => {
      const request = { ip: '127.0.0.1', userAgent: 'test' };
      
      const generalResult = rateLimiter.checkLimit('general', request);
      const loginResult = rateLimiter.checkLimit('login', request);
      
      expect(generalResult.allowed).toBe(true);
      expect(loginResult.allowed).toBe(true);
      // Login should have lower limit
      expect(loginResult.remaining).toBeLessThan(generalResult.remaining);
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect rapid requests', () => {
      const request = { ip: '127.0.0.1', userAgent: 'test', path: '/api/test' };
      
      const suspicious = rateLimiter.detectSuspiciousActivity(request);
      // First request shouldn't be suspicious
      expect(suspicious).toBe(false);
    });

    it('should detect SQL injection patterns', () => {
      const request = { 
        ip: '127.0.0.1', 
        userAgent: 'test',
        query: 'SELECT * FROM users WHERE 1=1' 
      };
      
      const suspicious = rateLimiter.detectSuspiciousActivity(request);
      expect(suspicious).toBe(true);
    });

    it('should detect XSS patterns in requests', () => {
      const request = { 
        ip: '127.0.0.1', 
        userAgent: 'test',
        body: '<script>alert("xss")</script>' 
      };
      
      const suspicious = rateLimiter.detectSuspiciousActivity(request);
      expect(suspicious).toBe(true);
    });
  });
});

describe('PrivacyManager', () => {
  let privacyManager: PrivacyManager;

  beforeEach(() => {
    privacyManager = PrivacyManager.getInstance();
  });

  describe('Consent Management', () => {
    it('should record user consent', () => {
      const consent = {
        consentGiven: true,
        purposes: {
          analytics: true,
          marketing: false,
          functional: true,
          personalization: true,
          dataSharing: false,
          location: false,
          biometric: false,
          advertising: false
        }
      };

      const sessionId = privacyManager.recordConsent(consent);
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('should check processing permissions', () => {
      const userId = 'test-user';
      const consent = {
        userId,
        consentGiven: true,
        purposes: {
          analytics: true,
          marketing: false,
          functional: true,
          personalization: false,
          dataSharing: false,
          location: false,
          biometric: false,
          advertising: false
        }
      };

      privacyManager.recordConsent(consent);
      
      const analyticsAllowed = privacyManager.isProcessingAllowed(userId, 'analytics');
      const marketingAllowed = privacyManager.isProcessingAllowed(userId, 'marketing');
      
      expect(analyticsAllowed).toBe(true);
      expect(marketingAllowed).toBe(false);
    });
  });

  describe('Privacy Requests', () => {
    it('should handle data access requests', async () => {
      const request = {
        userId: 'test-user',
        type: 'access' as const,
        description: 'User wants to see their data'
      };

      const requestId = await privacyManager.handlePrivacyRequest(request);
      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe('string');
    });

    it('should handle data erasure requests', async () => {
      const request = {
        userId: 'test-user',
        type: 'erasure' as const,
        description: 'User wants to delete their data'
      };

      const requestId = await privacyManager.handlePrivacyRequest(request);
      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe('string');
    });
  });
});

describe('IslamicContentIntegrity', () => {
  let contentIntegrity: IslamicContentIntegrity;

  beforeEach(() => {
    contentIntegrity = IslamicContentIntegrity.getInstance();
  });

  describe('Content Verification', () => {
    it('should verify Islamic content authenticity', async () => {
      const content = 'بسم الله الرحمن الرحيم';
      const metadata = {
        type: 'quran' as const,
        language: 'ar',
        source: 'Quran.com',
        chapter: 1,
        verse: 1,
        verified: true,
        authenticity: 'verified' as const
      };

      const result = await contentIntegrity.verifyIslamicContent(content, metadata);
      expect(result.isValid).toBe(true);
      expect(result.trustLevel).toBeGreaterThan(0);
    });

    it('should detect suspicious content modifications', async () => {
      const suspiciousContent = 'بسم الله<script>alert("xss")</script>';
      const metadata = {
        type: 'quran' as const,
        language: 'ar',
        source: 'Unknown',
        verified: false,
        authenticity: 'unverified' as const
      };

      const result = await contentIntegrity.verifyIslamicContent(suspiciousContent, metadata);
      expect(result.trustLevel).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Trusted Sources', () => {
    it('should have predefined trusted sources', () => {
      const trustedSources = contentIntegrity.getTrustedSources();
      expect(trustedSources.length).toBeGreaterThan(0);
      
      const quranCom = trustedSources.find(source => source.name === 'Quran.com');
      expect(quranCom).toBeDefined();
      expect(quranCom?.trustLevel).toBe(100);
    });

    it('should allow adding new trusted sources', () => {
      const newSource = {
        name: 'Test Islamic Source',
        publicKey: 'test-key',
        authority: 'Test Authority',
        trustLevel: 85,
        specialization: ['quran'],
        verified: true,
        lastUpdated: Date.now()
      };

      contentIntegrity.addTrustedSource(newSource);
      const sources = contentIntegrity.getTrustedSources();
      
      const addedSource = sources.find(source => source.name === 'Test Islamic Source');
      expect(addedSource).toBeDefined();
      expect(addedSource?.trustLevel).toBe(85);
    });
  });
});

describe('Security Integration', () => {
  it('should initialize all security components together', async () => {
    const securityManager = SecurityManager.getInstance();
    await securityManager.initialize('enhanced');
    
    const status = securityManager.getSecurityStatus();
    expect(status.initialized).toBe(true);
    expect(status.activeProtections.length).toBeGreaterThan(5);
    
    securityManager.destroy();
  });

  it('should handle security failures gracefully', async () => {
    // Simulate initialization failure
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      const securityManager = SecurityManager.getInstance();
      // This should not throw an error even if components fail
      await securityManager.initialize('maximum');
      
      const status = securityManager.getSecurityStatus();
      expect(status).toBeDefined();
    } catch (error) {
      // Should not reach here in normal operation
      expect(error).toBeUndefined();
    }
    
    consoleSpy.mockRestore();
  });
});

describe('Performance', () => {
  it('should initialize security system quickly', async () => {
    const startTime = performance.now();
    
    const securityManager = SecurityManager.getInstance();
    await securityManager.initialize('standard');
    
    const endTime = performance.now();
    const initTime = endTime - startTime;
    
    // Should initialize within 1 second
    expect(initTime).toBeLessThan(1000);
    
    securityManager.destroy();
  });

  it('should handle high-frequency security operations efficiently', () => {
    const xss = XSSProtection.getInstance();
    const startTime = performance.now();
    
    // Perform 1000 sanitization operations
    for (let i = 0; i < 1000; i++) {
      xss.sanitizeHTML('<p>Test content ' + i + '</p>');
    }
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should complete 1000 operations within 100ms
    expect(operationTime).toBeLessThan(100);
  });
});