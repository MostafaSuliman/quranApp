# QuranApp Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Methods](#deployment-methods)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Development Environment
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version

### Build Requirements
- Minimum 2GB RAM
- 1GB free disk space
- Internet connection for CDN dependencies

### Deployment Accounts (Optional)
- Netlify account (for Netlify deployment)
- Vercel account (for Vercel deployment)
- AWS account (for S3/CloudFront deployment)
- Docker Hub account (for container deployment)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/quranApp.git
cd quranApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create environment files for each environment:

#### `.env.development`
```env
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_AUDIO_CDN=https://everyayah.com
VITE_QURAN_API=https://api.quran.com
VITE_ISLAMIC_NETWORK_CDN=https://cdn.islamic.network
VITE_APP_VERSION=1.0.0-dev
VITE_ENABLE_DEBUG=true
```

#### `.env.staging`
```env
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://staging-api.quranapp.example.com
VITE_AUDIO_CDN=https://everyayah.com
VITE_QURAN_API=https://api.quran.com
VITE_ISLAMIC_NETWORK_CDN=https://cdn.islamic.network
VITE_APP_VERSION=1.0.0-staging
VITE_ENABLE_DEBUG=false
VITE_SENTRY_DSN=your-staging-sentry-dsn
VITE_GA_TRACKING_ID=your-staging-ga-id
```

#### `.env.production`
```env
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.quranapp.example.com
VITE_AUDIO_CDN=https://everyayah.com
VITE_QURAN_API=https://api.quran.com
VITE_ISLAMIC_NETWORK_CDN=https://cdn.islamic.network
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=false
VITE_SENTRY_DSN=your-production-sentry-dsn
VITE_GA_TRACKING_ID=your-production-ga-id
```

#### `.env.example`
```env
# Application Environment
VITE_APP_ENV=development

# API Endpoints
VITE_API_BASE_URL=
VITE_AUDIO_CDN=https://everyayah.com
VITE_QURAN_API=https://api.quran.com
VITE_ISLAMIC_NETWORK_CDN=https://cdn.islamic.network

# Application Info
VITE_APP_VERSION=1.0.0

# Debug Settings
VITE_ENABLE_DEBUG=false

# Third-Party Services (Optional)
VITE_SENTRY_DSN=
VITE_GA_TRACKING_ID=
```

---

## Build Process

### 1. Pre-Build Checks

#### Run Linting
```bash
npm run lint
```

#### Run Type Checking
```bash
npx tsc --noEmit
```

#### Run Tests
```bash
# Unit tests
npm run test

# Enhanced tests
npm run test:enhanced:run

# Security tests
npm run test:security:run

# E2E tests
npm run test:e2e
```

### 2. Build for Production

#### Standard Build
```bash
npm run build
```

#### Build with Specific Environment
```bash
# Development build
NODE_ENV=development npm run build

# Staging build
NODE_ENV=staging npm run build

# Production build
NODE_ENV=production npm run build
```

### 3. Preview Build Locally
```bash
npm run preview
```

Visit `http://localhost:4173` to preview the production build.

### 4. Build Output

The build process creates a `dist/` directory with:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-chunks].js
├── manifest.json
├── sw.js (service worker)
├── pwa-192x192.png
├── pwa-512x512.png
└── apple-touch-icon.png
```

---

## Deployment Methods

### Method 1: Netlify Deployment

#### Option A: GitHub Integration (Recommended)
1. Connect repository to Netlify
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18
3. Set environment variables in Netlify dashboard
4. Deploy automatically on push to main branch

#### Option B: CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to staging
netlify deploy --dir=dist

# Deploy to production
netlify deploy --dir=dist --prod
```

#### Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Method 2: Vercel Deployment

#### Option A: GitHub Integration
1. Import project in Vercel dashboard
2. Configure build settings (auto-detected from package.json)
3. Set environment variables
4. Deploy on push

#### Option B: CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "headers": {
        "Cache-Control": "no-cache"
      }
    },
    {
      "src": "/manifest.json",
      "headers": {
        "Cache-Control": "no-cache"
      }
    },
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### Method 3: AWS S3 + CloudFront

#### Prerequisites
- AWS CLI installed and configured
- S3 bucket created
- CloudFront distribution set up

#### Deployment Script
Create `scripts/deploy-aws.sh`:
```bash
#!/bin/bash

# Configuration
S3_BUCKET="your-s3-bucket-name"
CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"

# Build
echo "Building application..."
npm run build

# Upload to S3
echo "Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "sw.js" \
  --exclude "manifest.json"

# Upload files that should not be cached
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
  --cache-control "no-cache"
aws s3 cp dist/sw.js s3://$S3_BUCKET/sw.js \
  --cache-control "no-cache"
aws s3 cp dist/manifest.json s3://$S3_BUCKET/manifest.json \
  --cache-control "no-cache"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

Make script executable:
```bash
chmod +x scripts/deploy-aws.sh
```

Deploy:
```bash
./scripts/deploy-aws.sh
```

---

### Method 4: Docker Deployment

#### Build Docker Image
```bash
docker build -t quranapp:latest .
```

#### Run Container Locally
```bash
docker run -p 80:80 quranapp:latest
```

#### Push to Docker Hub
```bash
docker tag quranapp:latest yourusername/quranapp:latest
docker push yourusername/quranapp:latest
```

#### Deploy to Server
```bash
# On your server
docker pull yourusername/quranapp:latest
docker stop quranapp || true
docker rm quranapp || true
docker run -d \
  --name quranapp \
  -p 80:80 \
  --restart unless-stopped \
  yourusername/quranapp:latest
```

#### Docker Compose Deployment
```bash
# On your server
docker-compose pull
docker-compose up -d
```

---

### Method 5: Traditional VPS/Server

#### Prerequisites
- Server with Nginx installed
- Node.js 18+ installed
- PM2 for process management (optional)

#### Deployment Steps

1. **Build Application Locally**
```bash
npm run build
```

2. **Upload to Server**
```bash
# Using rsync
rsync -avz --delete dist/ user@server:/var/www/quranapp/

# Or using scp
scp -r dist/* user@server:/var/www/quranapp/
```

3. **Configure Nginx**
Create `/etc/nginx/sites-available/quranapp`:
```nginx
server {
    listen 80;
    server_name quranapp.example.com;

    root /var/www/quranapp;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # PWA support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache service worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        proxy_cache_bypass $http_pragma;
    }

    # Don't cache manifest
    location /manifest.json {
        add_header Cache-Control "no-cache";
    }
}
```

4. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/quranapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. **Set Up SSL with Let's Encrypt**
```bash
sudo certbot --nginx -d quranapp.example.com
```

---

## Post-Deployment Verification

### 1. Functional Tests
```bash
# Check homepage loads
curl -I https://quranapp.example.com

# Verify PWA manifest
curl https://quranapp.example.com/manifest.json

# Check service worker
curl https://quranapp.example.com/sw.js
```

### 2. Performance Tests
```bash
# Run Lighthouse audit
lighthouse https://quranapp.example.com --output=json --output-path=./lighthouse-report.json

# Check Core Web Vitals
# Use PageSpeed Insights or WebPageTest
```

### 3. Security Tests
```bash
# Check security headers
curl -I https://quranapp.example.com | grep -E 'X-Frame-Options|X-Content-Type-Options|X-XSS-Protection'

# SSL/TLS test
nmap --script ssl-enum-ciphers -p 443 quranapp.example.com
```

### 4. PWA Tests
- Install app from browser
- Test offline functionality
- Verify push notifications (if applicable)
- Check manifest.json validation

### 5. Monitoring Setup
```bash
# Set up error tracking (Sentry)
# Configure performance monitoring
# Set up uptime monitoring (UptimeRobot, Pingdom)
# Enable analytics (Google Analytics, Matomo)
```

---

## Rollback Procedures

### For Netlify/Vercel
1. Go to deployments dashboard
2. Select previous successful deployment
3. Click "Publish deploy" or "Promote to production"

### For AWS S3
```bash
# Restore from backup
aws s3 sync s3://your-backup-bucket/ s3://your-s3-bucket/ --delete
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

### For Docker
```bash
# Roll back to previous version
docker pull yourusername/quranapp:previous-version
docker stop quranapp
docker rm quranapp
docker run -d --name quranapp -p 80:80 yourusername/quranapp:previous-version
```

### For Traditional Server
```bash
# Keep versioned deployments
/var/www/quranapp-v1.0.0/
/var/www/quranapp-v1.0.1/
/var/www/quranapp -> symlink to current version

# Rollback
sudo ln -sfn /var/www/quranapp-v1.0.0 /var/www/quranapp
sudo systemctl reload nginx
```

---

## Troubleshooting

### Build Fails

**TypeScript errors:**
```bash
# Fix TypeScript errors
npm run lint -- --fix
npx tsc --noEmit
```

**Missing dependencies:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Out of memory:**
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Deployment Issues

**504 Gateway Timeout:**
- Increase build timeout in platform settings
- Optimize build process
- Check for infinite loops or heavy operations

**Assets not loading:**
- Verify base path in vite.config.ts
- Check CORS headers
- Verify CDN configuration

**Service Worker not updating:**
- Clear browser cache
- Check service worker update logic
- Verify Cache-Control headers

### Runtime Issues

**API calls failing:**
- Verify environment variables
- Check CORS configuration
- Verify API endpoints are accessible

**PWA not installing:**
- Validate manifest.json
- Check service worker registration
- Verify HTTPS is enabled

**Performance issues:**
- Enable compression (gzip/brotli)
- Optimize images
- Implement code splitting
- Configure CDN caching

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Environment variables configured
- [ ] Documentation updated

### Deployment
- [ ] Build successful
- [ ] Assets uploaded
- [ ] CDN cache invalidated (if applicable)
- [ ] SSL/TLS configured
- [ ] Security headers set
- [ ] Monitoring configured

### Post-Deployment
- [ ] Homepage loads correctly
- [ ] PWA installs successfully
- [ ] Offline mode works
- [ ] Performance metrics acceptable
- [ ] Error tracking active
- [ ] Analytics collecting data

---

## Support

For deployment issues:
- Check GitHub Issues
- Review deployment logs
- Contact DevOps team
- Refer to platform documentation

**Last Updated:** October 30, 2025
