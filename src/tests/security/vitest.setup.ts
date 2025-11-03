/**
 * Vitest Setup for Security Tests
 * Mocks browser APIs for testing in Node.js environment
 */

import { vi } from 'vitest';
import { beforeAll } from 'vitest';

// Mock DOM APIs
beforeAll(() => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn((key: string) => {
      return localStorageMock.store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock.store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock.store[key];
    }),
    clear: vi.fn(() => {
      localStorageMock.store = {};
    }),
    store: {} as { [key: string]: string }
  };

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
  });

  // Mock sessionStorage
  Object.defineProperty(global, 'sessionStorage', {
    value: localStorageMock,
    writable: true
  });

  // Mock window object
  Object.defineProperty(global, 'window', {
    value: {
      location: {
        origin: 'https://localhost:3000',
        href: 'https://localhost:3000',
        protocol: 'https:',
        hostname: 'localhost',
        port: '3000'
      },
      navigator: {
        userAgent: 'Mozilla/5.0 (Test Browser) QuranApp Security Test',
        language: 'en-US'
      },
      screen: {
        width: 1920,
        height: 1080
      },
      crypto: {
        getRandomValues: (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }
      },
      fetch: vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('')
      })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      CustomEvent: class MockCustomEvent {
        type: string;
        detail?: any;
        constructor(type: string, options?: { detail?: any }) {
          this.type = type;
          this.detail = options?.detail;
        }
      }
    },
    writable: true
  });

  // Mock document object
  const mockElement = {
    innerHTML: '',
    textContent: '',
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    hasAttribute: vi.fn(() => false),
    appendChild: vi.fn(),
    remove: vi.fn(),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    style: {},
    attributes: [],
    nodeType: 1,
    nodeName: 'DIV',
    children: [],
    parentNode: null
  };

  Object.defineProperty(global, 'document', {
    value: {
      createElement: vi.fn(() => ({ ...mockElement })),
      getElementById: vi.fn(() => mockElement),
      querySelector: vi.fn(() => mockElement),
      querySelectorAll: vi.fn(() => [mockElement]),
      head: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(() => mockElement),
        children: []
      },
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(() => mockElement),
        children: []
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      cookie: '',
      location: {
        href: 'https://localhost:3000'
      }
    },
    writable: true
  });

  // Mock MutationObserver
  Object.defineProperty(global, 'MutationObserver', {
    value: class MockMutationObserver {
      callback: Function;
      constructor(callback: Function) {
        this.callback = callback;
      }
      observe() {}
      disconnect() {}
      takeRecords() { return []; }
    },
    writable: true
  });

  // Mock DOMPurify
  const mockDOMPurify = {
    sanitize: vi.fn((html: string) => {
      // Simple sanitization for testing
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }),
    addHook: vi.fn(),
    setConfig: vi.fn(),
    isValidAttribute: vi.fn(() => true)
  };

  // Mock the DOMPurify module
  vi.doMock('dompurify', () => ({
    default: mockDOMPurify,
    ...mockDOMPurify
  }));

  // Mock Node.js built-in crypto
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }
    },
    writable: true
  });

  // Mock performance API
  Object.defineProperty(global, 'performance', {
    value: {
      now: () => Date.now()
    },
    writable: true
  });

  // Mock console methods to avoid test pollution
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
  };

  // Mock URL constructor
  Object.defineProperty(global, 'URL', {
    value: class MockURL {
      href: string;
      origin: string;
      protocol: string;
      hostname: string;
      port: string;
      pathname: string;
      search: string;
      searchParams: URLSearchParams;

      constructor(url: string, base?: string) {
        this.href = url;
        this.origin = 'https://localhost:3000';
        this.protocol = 'https:';
        this.hostname = 'localhost';
        this.port = '3000';
        this.pathname = '/';
        this.search = '';
        this.searchParams = new URLSearchParams();
      }

      toString() {
        return this.href;
      }
    },
    writable: true
  });

  // Mock URLSearchParams
  if (!global.URLSearchParams) {
    Object.defineProperty(global, 'URLSearchParams', {
      value: class MockURLSearchParams {
        params: Map<string, string> = new Map();

        constructor(init?: string | Record<string, string>) {
          if (init) {
            if (typeof init === 'string') {
              // Parse query string
              init.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
              });
            } else {
              Object.entries(init).forEach(([key, value]) => {
                this.params.set(key, value);
              });
            }
          }
        }

        set(key: string, value: string) {
          this.params.set(key, value);
        }

        get(key: string) {
          return this.params.get(key) || null;
        }

        has(key: string) {
          return this.params.has(key);
        }

        forEach(callback: (value: string, key: string) => void) {
          this.params.forEach(callback);
        }

        toString() {
          const pairs: string[] = [];
          this.params.forEach((value, key) => {
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          });
          return pairs.join('&');
        }
      },
      writable: true
    });
  }

  // Mock btoa and atob
  Object.defineProperty(global, 'btoa', {
    value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
    writable: true
  });

  Object.defineProperty(global, 'atob', {
    value: (str: string) => Buffer.from(str, 'base64').toString('binary'),
    writable: true
  });

  // Mock Node types
  Object.defineProperty(global, 'Node', {
    value: {
      ELEMENT_NODE: 1,
      TEXT_NODE: 3,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9
    },
    writable: true
  });

  // Mock HTMLElement types
  Object.defineProperty(global, 'HTMLInputElement', {
    value: class MockHTMLInputElement {
      value: string = '';
      type: string = 'text';
    },
    writable: true
  });

  Object.defineProperty(global, 'HTMLTextAreaElement', {
    value: class MockHTMLTextAreaElement {
      value: string = '';
    },
    writable: true
  });

  Object.defineProperty(global, 'HTMLMetaElement', {
    value: class MockHTMLMetaElement {
      content: string = '';
      name: string = '';
      httpEquiv: string = '';
    },
    writable: true
  });

  Object.defineProperty(global, 'HTMLFormElement', {
    value: class MockHTMLFormElement {
      action: string = '';
      method: string = 'GET';
      appendChild = vi.fn();
      querySelector = vi.fn(() => null);
    },
    writable: true
  });

  Object.defineProperty(global, 'Element', {
    value: class MockElement {
      innerHTML: string = '';
      textContent: string = '';
      tagName: string = 'DIV';
      attributes: any[] = [];
      
      setAttribute = vi.fn();
      getAttribute = vi.fn();
      removeAttribute = vi.fn();
      hasAttribute = vi.fn(() => false);
      appendChild = vi.fn();
      remove = vi.fn();
      querySelector = vi.fn(() => null);
      querySelectorAll = vi.fn(() => []);
    },
    writable: true
  });

  // Mock XMLHttpRequest
  Object.defineProperty(global, 'XMLHttpRequest', {
    value: class MockXMLHttpRequest {
      onreadystatechange: (() => void) | null = null;
      readyState: number = 0;
      response: any = '';
      responseText: string = '';
      status: number = 200;
      statusText: string = 'OK';

      open = vi.fn();
      send = vi.fn();
      setRequestHeader = vi.fn();
      getResponseHeader = vi.fn();
      getAllResponseHeaders = vi.fn();
      abort = vi.fn();
    },
    writable: true
  });

  // Mock Intl API
  Object.defineProperty(global, 'Intl', {
    value: {
      DateTimeFormat: class MockDateTimeFormat {
        resolvedOptions() {
          return { timeZone: 'UTC' };
        }
      }
    },
    writable: true
  });
});