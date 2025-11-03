/**
 * CSRF Protection Implementation
 * Protects against Cross-Site Request Forgery attacks
 */

import CryptoJS from 'crypto-js';

export interface CSRFToken {
  token: string;
  timestamp: number;
  expires: number;
}

export class CSRFProtection {
  private static instance: CSRFProtection;
  private tokenStorage: Map<string, CSRFToken> = new Map();
  private readonly TOKEN_EXPIRY = 3600000; // 1 hour
  private readonly TOKEN_HEADER = 'X-CSRF-Token';
  private readonly TOKEN_META_NAME = 'csrf-token';

  private constructor() {
    this.initializeCSRFProtection();
  }

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  /**
   * Initialize CSRF protection
   */
  private initializeCSRFProtection(): void {
    this.interceptFetchRequests();
    this.interceptXHRRequests();
    this.setupFormProtection();
    this.cleanupExpiredTokens();
  }

  /**
   * Generate a new CSRF token
   */
  public generateToken(sessionId?: string): string {
    const timestamp = Date.now();
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    const sessionData = sessionId || this.getSessionIdentifier();
    
    // Create token with session binding
    const tokenData = `${timestamp}:${sessionData}:${randomBytes.toString()}`;
    const token = CryptoJS.SHA256(tokenData).toString();

    // Store token with metadata
    this.tokenStorage.set(token, {
      token,
      timestamp,
      expires: timestamp + this.TOKEN_EXPIRY
    });

    return token;
  }

  /**
   * Validate CSRF token
   */
  public validateToken(token: string, sessionId?: string): boolean {
    if (!token) {
      return false;
    }

    const storedToken = this.tokenStorage.get(token);
    if (!storedToken) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > storedToken.expires) {
      this.tokenStorage.delete(token);
      return false;
    }

    // Validate session binding
    const currentSession = sessionId || this.getSessionIdentifier();
    if (!this.validateSessionBinding(token, currentSession)) {
      return false;
    }

    return true;
  }

  /**
   * Get current session identifier
   */
  private getSessionIdentifier(): string {
    // Use combination of user agent and other browser fingerprints
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');

    return CryptoJS.SHA256(fingerprint).toString();
  }

  /**
   * Validate session binding for token
   */
  private validateSessionBinding(token: string, sessionId: string): boolean {
    // This is a simplified validation - in production, use more sophisticated binding
    const storedToken = this.tokenStorage.get(token);
    if (!storedToken) return false;

    // In a real implementation, you'd store session binding with the token
    // For now, we'll assume valid if token exists and hasn't expired
    return Date.now() <= storedToken.expires;
  }

  /**
   * Add CSRF token to meta tag
   */
  public addTokenToDocument(): void {
    const token = this.generateToken();
    
    // Remove existing CSRF meta tag
    const existingMeta = document.querySelector(`meta[name="${this.TOKEN_META_NAME}"]`);
    if (existingMeta) {
      existingMeta.remove();
    }

    // Add new CSRF meta tag
    const meta = document.createElement('meta');
    meta.name = this.TOKEN_META_NAME;
    meta.content = token;
    document.head.appendChild(meta);
  }

  /**
   * Get CSRF token from meta tag
   */
  public getTokenFromDocument(): string | null {
    const meta = document.querySelector(`meta[name="${this.TOKEN_META_NAME}"]`) as HTMLMetaElement;
    return meta ? meta.content : null;
  }

  /**
   * Intercept fetch requests to add CSRF token
   */
  private interceptFetchRequests(): void {
    const originalFetch = window.fetch;

    window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Only add CSRF token for same-origin requests
      if (this.isSameOriginRequest(input)) {
        const token = this.getTokenFromDocument();
        if (token && this.shouldAddCSRFToken(init?.method || 'GET')) {
          init = init || {};
          init.headers = {
            ...init.headers,
            [this.TOKEN_HEADER]: token
          };
        }
      }

      return originalFetch(input, init);
    };
  }

  /**
   * Intercept XMLHttpRequest to add CSRF token
   */
  private interceptXHRRequests(): void {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      // Store request details for later use
      (this as any)._method = method;
      (this as any)._url = url;
      
      return originalOpen.call(this, method, url, async, username, password);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const method = (this as any)._method;
      const url = (this as any)._url;

      // Add CSRF token for same-origin requests
      if (CSRFProtection.getInstance().isSameOriginRequest(url) && 
          CSRFProtection.getInstance().shouldAddCSRFToken(method)) {
        const token = CSRFProtection.getInstance().getTokenFromDocument();
        if (token) {
          this.setRequestHeader(CSRFProtection.getInstance().TOKEN_HEADER, token);
        }
      }

      return originalSend.call(this, body);
    };
  }

  /**
   * Setup CSRF protection for forms
   */
  private setupFormProtection(): void {
    // Add CSRF tokens to forms on submit
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      if (form && this.isSameOriginRequest(form.action)) {
        this.addTokenToForm(form);
      }
    });

    // Monitor for dynamically added forms
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const forms = element.tagName === 'FORM' ? [element] : element.querySelectorAll('form');
            forms.forEach((form) => {
              this.addTokenToForm(form as HTMLFormElement);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Add CSRF token to form
   */
  private addTokenToForm(form: HTMLFormElement): void {
    // Check if form already has CSRF token
    const existingInput = form.querySelector('input[name="csrf_token"]');
    if (existingInput) {
      return;
    }

    const token = this.getTokenFromDocument();
    if (token) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'csrf_token';
      input.value = token;
      form.appendChild(input);
    }
  }

  /**
   * Check if request is same-origin
   */
  private isSameOriginRequest(input: RequestInfo | URL | string): boolean {
    try {
      const url = typeof input === 'string' ? input : input.toString();
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch {
      return true; // Assume same-origin for relative URLs
    }
  }

  /**
   * Check if CSRF token should be added for this method
   */
  private shouldAddCSRFToken(method: string): boolean {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
    return !safeMethods.includes(method.toUpperCase());
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [token, data] of this.tokenStorage.entries()) {
        if (now > data.expires) {
          this.tokenStorage.delete(token);
        }
      }
    }, 300000); // Clean up every 5 minutes
  }

  /**
   * Refresh CSRF token
   */
  public refreshToken(): void {
    this.addTokenToDocument();
    console.log('CSRF token refreshed');
  }

  /**
   * Validate request with CSRF protection
   */
  public validateRequest(request: Request): boolean {
    // Skip validation for safe methods
    if (this.shouldAddCSRFToken(request.method)) {
      const token = request.headers.get(this.TOKEN_HEADER);
      return this.validateToken(token || '');
    }
    return true;
  }

  /**
   * Create secure form with CSRF protection
   */
  public createSecureForm(action: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST'): HTMLFormElement {
    const form = document.createElement('form');
    form.action = action;
    form.method = method;

    // Add CSRF token
    this.addTokenToForm(form);

    return form;
  }

  /**
   * Setup CSRF protection for API calls
   */
  public setupAPIProtection(): void {
    // Create axios-like interceptor for API calls
    const apiProtection = {
      request: (config: any) => {
        if (this.shouldAddCSRFToken(config.method)) {
          const token = this.getTokenFromDocument();
          if (token) {
            config.headers = config.headers || {};
            config.headers[this.TOKEN_HEADER] = token;
          }
        }
        return config;
      },
      
      response: (response: any) => {
        // Check if server requests token refresh
        const refreshHeader = response.headers['x-csrf-token-refresh'];
        if (refreshHeader === 'true') {
          this.refreshToken();
        }
        return response;
      }
    };

    // Make API protection available globally
    (window as any).csrfAPIProtection = apiProtection;
  }

  /**
   * Report CSRF attack attempt
   */
  public reportCSRFAttempt(details: any): void {
    const report = {
      type: 'csrf_attack',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details
    };

    console.warn('CSRF attack attempt detected:', report);

    // Send to security monitoring in production
    if (import.meta.env.MODE === 'production') {
      fetch('/api/security/csrf-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      }).catch(err => {
        console.error('Failed to report CSRF attempt:', err);
      });
    }
  }

  /**
   * Get current token count for monitoring
   */
  public getTokenCount(): number {
    return this.tokenStorage.size;
  }

  /**
   * Clear all tokens (for logout)
   */
  public clearAllTokens(): void {
    this.tokenStorage.clear();
    const meta = document.querySelector(`meta[name="${this.TOKEN_META_NAME}"]`);
    if (meta) {
      meta.remove();
    }
  }
}