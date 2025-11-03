/**
 * Security Headers Configuration
 * Comprehensive security headers for production deployment
 */

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-XSS-Protection'?: string;
  'X-DNS-Prefetch-Control'?: string;
  'Expect-CT'?: string;
  'Feature-Policy'?: string;
}

/**
 * Generate Content Security Policy header
 */
export const generateCSP = (environment: 'development' | 'production' = 'production'): string => {
  const isDev = environment === 'development';

  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Allow Sentry error reporting
      'https://browser.sentry-cdn.com',
      // Development: Allow unsafe-eval for HMR
      ...(isDev ? ["'unsafe-eval'"] : []),
      // Allow inline scripts with nonce (will be set dynamically)
      "'nonce-{NONCE}'",
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind and dynamic styles
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // For embedded fonts
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:', // Allow HTTPS images (for Quran images)
    ],
    'media-src': [
      "'self'",
      'https://everyayah.com', // Quran audio
      'https://cdn.islamic.network', // Islamic audio content
      'blob:', // For audio/video playback
    ],
    'connect-src': [
      "'self'",
      'https://api.quran.com',
      'https://cdn.islamic.network',
      'https://everyayah.com',
      'https://sentry.io',
      'https://*.sentry.io',
      ...(isDev ? ['ws:', 'wss:', 'http://localhost:*'] : []),
    ],
    'frame-src': [
      "'none'", // No iframes allowed
    ],
    'object-src': [
      "'none'", // No plugins allowed
    ],
    'base-uri': [
      "'self'",
    ],
    'form-action': [
      "'self'",
    ],
    'frame-ancestors': [
      "'none'", // Cannot be embedded in iframes
    ],
    'upgrade-insecure-requests': isDev ? [] : [''],
    'block-all-mixed-content': isDev ? [] : [''],
  };

  return Object.entries(directives)
    .filter(([_, values]) => values.length > 0)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

/**
 * Get all security headers
 */
export const getSecurityHeaders = (
  environment: 'development' | 'production' = 'production'
): SecurityHeaders => {
  const isProd = environment === 'production';

  return {
    // Content Security Policy
    'Content-Security-Policy': generateCSP(environment),

    // Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'geolocation=(self)', // Allow geolocation for prayer times
      'microphone=()', // Deny microphone access
      'camera=()', // Deny camera access
      'payment=()', // Deny payment APIs
      'usb=()', // Deny USB access
      'magnetometer=()', // Deny magnetometer (for Qibla direction, use geolocation instead)
      'accelerometer=(self)', // Allow accelerometer for Qibla direction
      'gyroscope=(self)', // Allow gyroscope for Qibla direction
      'fullscreen=(self)', // Allow fullscreen for app
      'autoplay=(self)', // Allow autoplay for Quran audio
    ].join(', '),

    // HTTP Strict Transport Security (HSTS)
    ...(isProd && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),

    // XSS Protection (legacy, but still good to include)
    'X-XSS-Protection': '1; mode=block',

    // Control DNS prefetching
    'X-DNS-Prefetch-Control': 'on',

    // Certificate Transparency
    ...(isProd && {
      'Expect-CT': 'max-age=86400, enforce',
    }),
  };
};

/**
 * Generate meta tags for security headers
 */
export const generateSecurityMetaTags = (
  environment: 'development' | 'production' = 'production'
): string => {
  const headers = getSecurityHeaders(environment);

  return Object.entries(headers)
    .map(([name, value]) => {
      if (value) {
        return `<meta http-equiv="${name}" content="${value.replace(/"/g, '&quot;')}" />`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
};

/**
 * Helmet-style configuration for Express/Node servers
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://browser.sentry-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      mediaSrc: ["'self'", "https://everyayah.com", "https://cdn.islamic.network", "blob:"],
      connectSrc: [
        "'self'",
        "https://api.quran.com",
        "https://cdn.islamic.network",
        "https://everyayah.com",
        "https://sentry.io",
        "https://*.sentry.io",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  xssFilter: true,
  dnsPrefetchControl: {
    allow: true,
  },
  expectCt: {
    maxAge: 86400,
    enforce: true,
  },
};

/**
 * Nginx configuration snippet for security headers
 */
export const nginxSecurityHeaders = `
# Security Headers for QuranApp
add_header Content-Security-Policy "${generateCSP('production')}" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-DNS-Prefetch-Control "on" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Expect-CT "max-age=86400, enforce" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=(self), gyroscope=(self), fullscreen=(self), autoplay=(self)" always;
`;

/**
 * Apache .htaccess configuration for security headers
 */
export const apacheSecurityHeaders = `
# Security Headers for QuranApp
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "${generateCSP('production')}"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-DNS-Prefetch-Control "on"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Expect-CT "max-age=86400, enforce"
    Header always set Permissions-Policy "geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=(self), gyroscope=(self), fullscreen=(self), autoplay=(self)"
</IfModule>
`;

export default {
  generateCSP,
  getSecurityHeaders,
  generateSecurityMetaTags,
  helmetConfig,
  nginxSecurityHeaders,
  apacheSecurityHeaders,
};
