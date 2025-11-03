/**
 * XSS Protection and Input Sanitization
 * Comprehensive protection against Cross-Site Scripting attacks
 */

import DOMPurify from 'dompurify';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  forbiddenTags?: string[];
  forbiddenAttributes?: string[];
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: boolean;
}

export class XSSProtection {
  private static instance: XSSProtection;
  private domPurify: typeof DOMPurify;

  private constructor() {
    this.domPurify = DOMPurify;
    this.configureDOMPurify();
  }

  public static getInstance(): XSSProtection {
    if (!XSSProtection.instance) {
      XSSProtection.instance = new XSSProtection();
    }
    return XSSProtection.instance;
  }

  /**
   * Configure DOMPurify with Islamic content-specific settings
   */
  private configureDOMPurify(): void {
    // Check if DOMPurify methods are available before using them
    if (typeof this.domPurify.addHook === 'function') {
      // Add Islamic-specific configurations
      this.domPurify.addHook('beforeSanitizeElements', (node) => {
        // Preserve Arabic text direction attributes
        if (node.hasAttribute && node.hasAttribute('dir')) {
          const dir = node.getAttribute('dir');
          if (dir === 'rtl' || dir === 'ltr') {
            // Keep valid direction attributes
            return;
          }
        }
      });
    }

    // Configure allowed tags for Islamic content
    if (typeof this.domPurify.setConfig === 'function') {
      this.domPurify.setConfig({
      ALLOWED_TAGS: [
        'p', 'div', 'span', 'strong', 'em', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'small', 'sup', 'sub'
      ],
      ALLOWED_ATTR: [
        'class', 'id', 'dir', 'lang', 'title', 'aria-label', 'aria-describedby',
        'role', 'data-verse', 'data-chapter', 'data-ayah'
      ],
      FORBID_ATTR: [
        'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
        'style', 'background', 'src', 'href'
      ],
      FORBID_TAGS: [
        'script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea',
        'button', 'select', 'option', 'link', 'meta'
      ],
        KEEP_CONTENT: false,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false
      });
    }
  }

  /**
   * Sanitize HTML content with Islamic text preservation
   */
  public sanitizeHTML(html: string, options?: SanitizationOptions): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Apply custom options if provided
    if (options) {
      const config: any = {};
      if (options.allowedTags) config.ALLOWED_TAGS = options.allowedTags;
      if (options.allowedAttributes) config.ALLOWED_ATTR = options.allowedAttributes;
      if (options.forbiddenTags) config.FORBID_TAGS = options.forbiddenTags;
      if (options.forbiddenAttributes) config.FORBID_ATTR = options.forbiddenAttributes;
      
      return this.domPurify.sanitize(html, config);
    }

    return this.domPurify.sanitize(html);
  }

  /**
   * Sanitize text content (plain text)
   */
  public sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Remove potential script injections
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }

  /**
   * Sanitize Arabic Quran text with special care
   */
  public sanitizeArabicText(arabicText: string): string {
    if (!arabicText || typeof arabicText !== 'string') {
      return '';
    }

    // Preserve Arabic diacritics and special characters
    const preservedChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    
    // First sanitize for XSS
    let sanitized = this.sanitizeText(arabicText);

    // Ensure Arabic text integrity
    const arabicMatches = sanitized.match(preservedChars);
    if (arabicMatches) {
      // Additional validation for Quranic text
      sanitized = this.validateQuranText(sanitized);
    }

    return sanitized;
  }

  /**
   * Validate Quranic text for integrity
   */
  private validateQuranText(text: string): string {
    // Basic validation - ensure no non-Arabic characters in Quranic text
    // except for allowed punctuation and numbers
    const allowedPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\.\,\(\)\[\]]+$/;
    
    if (!allowedPattern.test(text)) {
      console.warn('Potentially corrupted Quranic text detected:', text);
      // Log for security monitoring
      this.reportSuspiciousContent('arabic_text_corruption', text);
    }

    return text;
  }

  /**
   * Sanitize user input for search queries
   */
  public sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    return query
      .trim()
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 1000); // Limit length
  }

  /**
   * Sanitize URL to prevent XSS through URL parameters
   */
  public sanitizeURL(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    try {
      const urlObj = new URL(url);
      
      // Only allow specific protocols
      const allowedProtocols = ['http:', 'https:', 'data:'];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        throw new Error('Invalid protocol');
      }

      // Sanitize search parameters
      const sanitizedParams = new URLSearchParams();
      urlObj.searchParams.forEach((value, key) => {
        sanitizedParams.set(
          this.sanitizeText(key),
          this.sanitizeText(value)
        );
      });

      urlObj.search = sanitizedParams.toString();
      return urlObj.toString();
    } catch {
      return '';
    }
  }

  /**
   * Validate and sanitize JSON data
   */
  public sanitizeJSON(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeText(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeJSON(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeJSON(value);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Escape HTML entities
   */
  public escapeHTML(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
  }

  /**
   * Create safe innerHTML setter
   */
  public setSafeInnerHTML(element: HTMLElement, html: string): void {
    const sanitized = this.sanitizeHTML(html);
    element.innerHTML = sanitized;
  }

  /**
   * Validate input against known attack patterns
   */
  public detectXSSAttempt(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /url\s*\(/gi,
      /import\s*\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Report suspicious content for security monitoring
   */
  private reportSuspiciousContent(type: string, content: string): void {
    const report = {
      type,
      content: content.substring(0, 500), // Limit content length
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log locally
    console.warn('Suspicious content detected:', report);

    // In production, send to security monitoring
    if (import.meta.env.MODE === 'production') {
      fetch('/api/security/suspicious-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      }).catch(err => {
        console.error('Failed to report suspicious content:', err);
      });
    }
  }

  /**
   * Setup automatic XSS protection for the application
   */
  public initializeProtection(): void {
    // Override dangerous methods
    this.overrideDangerousMethods();
    
    // Setup input validation
    this.setupInputValidation();
    
    // Monitor for XSS attempts
    this.setupXSSMonitoring();
  }

  /**
   * Override potentially dangerous DOM methods
   */
  private overrideDangerousMethods(): void {
    // Override innerHTML setter to always sanitize
    const originalInnerHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.set;
    
    if (originalInnerHTMLSetter) {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(this: Element, value: string) {
          const sanitized = XSSProtection.getInstance().sanitizeHTML(value);
          originalInnerHTMLSetter.call(this, sanitized);
        },
        get: function(this: Element) {
          return this.innerHTML;
        }
      });
    }
  }

  /**
   * Setup input validation for forms
   */
  private setupInputValidation(): void {
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.value) {
        if (this.detectXSSAttempt(target.value)) {
          this.reportSuspiciousContent('xss_attempt', target.value);
          target.value = this.sanitizeText(target.value);
        }
      }
    });
  }

  /**
   * Setup XSS monitoring
   */
  private setupXSSMonitoring(): void {
    // Monitor for DOM modifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              this.scanElementForXSS(element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Scan element for potential XSS content
   */
  private scanElementForXSS(element: Element): void {
    // Check element attributes
    Array.from(element.attributes).forEach(attr => {
      if (this.detectXSSAttempt(attr.value)) {
        this.reportSuspiciousContent('xss_attribute', `${attr.name}="${attr.value}"`);
        element.removeAttribute(attr.name);
      }
    });

    // Check text content
    if (element.textContent && this.detectXSSAttempt(element.textContent)) {
      this.reportSuspiciousContent('xss_text', element.textContent);
      element.textContent = this.sanitizeText(element.textContent);
    }
  }
}