/**
 * Content Security Policy Manager
 * Implements XSS protection and secure content policies for Islamic content
 */

import { getSecurityConfig } from './SecurityConfig';

export class CSPManager {
  private static instance: CSPManager;
  private config = getSecurityConfig();
  private currentNonce: string = '';
  private nonceCache: Map<string, number> = new Map();

  private constructor() {
    this.refreshNonce();
  }

  public static getInstance(): CSPManager {
    if (!CSPManager.instance) {
      CSPManager.instance = new CSPManager();
    }
    return CSPManager.instance;
  }

  /**
   * Refresh nonce value (called on each page load)
   */
  private refreshNonce(): void {
    this.currentNonce = this.generateNonce();
    // Clean up old nonces from cache
    const now = Date.now();
    for (const [nonce, timestamp] of this.nonceCache.entries()) {
      if (now - timestamp > 60000) { // 1 minute expiry
        this.nonceCache.delete(nonce);
      }
    }
    this.nonceCache.set(this.currentNonce, now);
  }

  /**
   * Get current nonce for inline scripts/styles
   */
  public getCurrentNonce(): string {
    return this.currentNonce;
  }

  /**
   * Generate Content Security Policy header value with nonce support
   */
  public generateCSPHeader(): string {
    const csp = this.config.csp;
    const policies: string[] = [];
    const nonce = `'nonce-${this.currentNonce}'`;

    // Core directives with nonce support
    policies.push(`default-src ${csp.defaultSrc.join(' ')}`);

    // Script sources with nonce instead of unsafe-inline
    const scriptSources = [...csp.scriptSrc];
    if (import.meta.env.MODE === 'production') {
      // In production, only allow nonce-based inline scripts
      policies.push(`script-src ${nonce} ${scriptSources.filter(s => s !== "'unsafe-inline'").join(' ')}`);
    } else {
      // In development, allow both for Vite HMR
      policies.push(`script-src ${nonce} ${scriptSources.join(' ')}`);
    }

    // Style sources with nonce instead of unsafe-inline
    const styleSources = [...csp.styleSrc];
    if (import.meta.env.MODE === 'production') {
      policies.push(`style-src ${nonce} ${styleSources.filter(s => s !== "'unsafe-inline'").join(' ')}`);
    } else {
      policies.push(`style-src ${nonce} ${styleSources.join(' ')}`);
    }

    policies.push(`img-src ${csp.imgSrc.join(' ')}`);
    policies.push(`connect-src ${csp.connectSrc.join(' ')}`);
    policies.push(`font-src ${csp.fontSrc.join(' ')}`);
    policies.push(`media-src ${csp.mediaSrc.join(' ')}`);
    policies.push(`object-src ${csp.objectSrc.join(' ')}`);
    policies.push(`frame-src ${csp.frameSrc.join(' ')}`);
    policies.push(`worker-src ${csp.workerSrc.join(' ')}`);
    policies.push(`manifest-src ${csp.manifestSrc.join(' ')}`);

    // Security directives
    if (csp.upgradeInsecureRequests) {
      policies.push('upgrade-insecure-requests');
    }
    if (csp.blockAllMixedContent) {
      policies.push('block-all-mixed-content');
    }

    // Frame protection
    policies.push("frame-ancestors 'none'");
    policies.push("base-uri 'self'");
    policies.push("form-action 'self'");

    return policies.join('; ');
  }

  /**
   * Apply CSP to the document with nonce support
   */
  public applyCSP(): void {
    // Refresh nonce for new page load
    this.refreshNonce();

    // Create and inject CSP meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = this.generateCSPHeader();
    document.head.appendChild(cspMeta);

    // Apply nonce to existing inline scripts and styles
    this.applyNonceToInlineElements();

    // Additional security headers via meta tags
    this.addSecurityHeaders();
  }

  /**
   * Apply nonce attribute to all inline scripts and styles
   */
  private applyNonceToInlineElements(): void {
    const nonce = this.currentNonce;

    // Apply to inline scripts
    document.querySelectorAll('script:not([src])').forEach((script) => {
      if (!script.hasAttribute('nonce')) {
        script.setAttribute('nonce', nonce);
      }
    });

    // Apply to inline styles
    document.querySelectorAll('style').forEach((style) => {
      if (!style.hasAttribute('nonce')) {
        style.setAttribute('nonce', nonce);
      }
    });
  }

  /**
   * Create inline script element with nonce
   */
  public createNoncedScript(content: string): HTMLScriptElement {
    const script = document.createElement('script');
    script.setAttribute('nonce', this.currentNonce);
    script.textContent = this.sanitizeInlineContent(content, 'script');
    return script;
  }

  /**
   * Create inline style element with nonce
   */
  public createNoncedStyle(content: string): HTMLStyleElement {
    const style = document.createElement('style');
    style.setAttribute('nonce', this.currentNonce);
    style.textContent = this.sanitizeInlineContent(content, 'style');
    return style;
  }

  /**
   * Add additional security headers
   */
  private addSecurityHeaders(): void {
    const headers = [
      {
        httpEquiv: 'X-Content-Type-Options',
        content: 'nosniff'
      },
      {
        httpEquiv: 'X-Frame-Options',
        content: 'DENY'
      },
      {
        httpEquiv: 'X-XSS-Protection',
        content: '1; mode=block'
      },
      {
        httpEquiv: 'Referrer-Policy',
        content: 'strict-origin-when-cross-origin'
      },
      {
        httpEquiv: 'Permissions-Policy',
        content: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()'
      }
    ];

    headers.forEach(header => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.httpEquiv;
      meta.content = header.content;
      document.head.appendChild(meta);
    });
  }

  /**
   * Validate if a URL is allowed by CSP
   */
  public isUrlAllowed(url: string, directive: keyof typeof this.config.csp): boolean {
    const allowedSources = this.config.csp[directive] as string[];
    
    try {
      const urlObj = new URL(url);
      
      // Check against allowed sources
      return allowedSources.some(source => {
        if (source === "'self'") {
          return urlObj.origin === window.location.origin;
        }
        if (source === "'none'") {
          return false;
        }
        if (source.startsWith('http://') || source.startsWith('https://')) {
          return url.startsWith(source);
        }
        if (source.includes('*')) {
          const regex = new RegExp(source.replace(/\*/g, '.*'));
          return regex.test(url);
        }
        return url.includes(source);
      });
    } catch {
      return false;
    }
  }

  /**
   * Sanitize and validate Islamic content URLs
   */
  public validateIslamicContentUrl(url: string): boolean {
    const trustedSources = this.config.contentIntegrity.trustedSources;
    
    try {
      const urlObj = new URL(url);
      return trustedSources.some(source => urlObj.hostname.endsWith(source));
    } catch {
      return false;
    }
  }

  /**
   * Report CSP violations
   */
  public setupCSPReporting(): void {
    // Listen for CSP violation events
    document.addEventListener('securitypolicyviolation', (event) => {
      this.reportCSPViolation({
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    });
  }

  /**
   * Report CSP violation to security monitoring
   */
  private reportCSPViolation(violation: any): void {
    // Log violation locally
    console.warn('CSP Violation detected:', violation);

    // Send to security monitoring service
    if (import.meta.env.MODE === 'production') {
      // In production, send to your security monitoring service
      fetch('/api/security/csp-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation)
      }).catch(err => {
        console.error('Failed to report CSP violation:', err);
      });
    }
  }

  /**
   * Nonce generation for inline scripts/styles
   */
  public generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Validate and sanitize inline content
   */
  public sanitizeInlineContent(content: string, type: 'script' | 'style'): string {
    // Basic sanitization - in production, use a proper sanitization library
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi
    ];

    let sanitized = content;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }
}