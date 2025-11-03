import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import type { Plugin } from 'vite'

// Security headers plugin for development server
const securityHeadersPlugin = (): Plugin => ({
  name: 'security-headers',
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      // Content Security Policy - Allow development tools
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://browser.sentry-cdn.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "img-src 'self' data: blob: https:; " +
        "media-src 'self' https://everyayah.com https://cdn.islamic.network blob:; " +
        "connect-src 'self' https://api.quran.com https://cdn.islamic.network https://everyayah.com https://sentry.io https://*.sentry.io ws: wss: http://localhost:*; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none';"
      );

      // X-Frame-Options: Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // X-Content-Type-Options: Prevent MIME sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Referrer-Policy: Control referrer information
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // X-XSS-Protection: Legacy XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // X-DNS-Prefetch-Control: Control DNS prefetching
      res.setHeader('X-DNS-Prefetch-Control', 'on');

      // Permissions-Policy: Control browser features
      res.setHeader(
        'Permissions-Policy',
        'geolocation=(self), microphone=(), camera=(), payment=(), usb=(), ' +
        'magnetometer=(), accelerometer=(self), gyroscope=(self), ' +
        'fullscreen=(self), autoplay=(self)'
      );

      // Cross-Origin policies for enhanced security
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

      next();
    });
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Target modern browsers for better optimization
    target: 'es2020',

    // Optimize chunk splitting for better caching and faster loads
    rollupOptions: {
      output: {
        // Advanced chunk splitting strategy
        manualChunks: (id) => {
          // Vendor chunks - core libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            // Animation library
            if (id.includes('framer-motion')) {
              return 'framer-vendor'
            }
            // State management
            if (id.includes('zustand')) {
              return 'zustand-vendor'
            }
            // Audio libraries
            if (id.includes('wavesurfer')) {
              return 'audio-vendor'
            }
            // UI libraries
            if (id.includes('@heroicons') || id.includes('@headlessui')) {
              return 'ui-vendor'
            }
            // Other node_modules
            return 'vendor'
          }

          // Route-based code splitting
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0]
            return `page-${pageName.toLowerCase()}`
          }

          // Component chunks
          if (id.includes('/components/') && id.includes('AudioPlayer')) {
            return 'audio-components'
          }

          // Store chunks
          if (id.includes('/stores/')) {
            return 'stores'
          }
        },

        // Optimize chunk file names for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },

      // Tree shaking configuration
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },

    // Performance budgets
    chunkSizeWarningLimit: 500, // 500kb for chunks
    assetsInlineLimit: 4096, // 4kb - inline assets smaller than this

    // Enable source maps for production debugging
    sourcemap: true,

    // Advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
        passes: 2 // Multiple passes for better minification
      },
      mangle: {
        safari10: true // Fix Safari 10/11 bugs
      },
      format: {
        comments: false // Remove all comments
      }
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Report compressed size (disable in CI for faster builds)
    reportCompressedSize: true,

    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  plugins: [
    react(),

    // Security headers for development server
    securityHeadersPlugin(),

    // Bundle size visualization - generates stats.html
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // Options: treemap, sunburst, network
    }),

    // Compression plugins - generate gzip and brotli files
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10kb
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    }),

    // Sentry plugin for error monitoring with source maps
    // Only load if Sentry credentials are configured (prevents build failures)
    ...(process.env.SENTRY_AUTH_TOKEN ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          assets: './dist/assets/**',
          ignore: ['node_modules'],
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
        release: {
          name: process.env.VITE_APP_VERSION || '1.0.0',
          cleanArtifacts: true,
          setCommits: {
            auto: true,
          },
        },
        // Only upload source maps in production builds
        disable: process.env.NODE_ENV !== 'production',
      })
    ] : []),

    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'quran-icon.svg'],
      manifest: false, // Use public/manifest.json instead
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,eot,woff}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/everyayah\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'everyayah-audio-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 3 months for audio files
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'quran-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.islamic\.network\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 1 month
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 1 month
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|woff2|woff|ttf|eot)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources'
            }
          }
        ]
      },
      strategies: 'generateSW',
      injectRegister: 'auto'
    })
  ],
  server: {
    port: 3000,
    host: true,
    cors: {
      origin: true,
      credentials: true
    },
    proxy: {
      // Proxy for everyayah.com to handle CORS issues in development
      '/api/audio': {
        target: 'https://everyayah.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/audio/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Audio proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Audio proxy request:', req.url);
          });
        }
      }
    }
  }
})