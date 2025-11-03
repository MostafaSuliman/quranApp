# 🚀 QuranApp Deployment Guide

Complete guide for deploying QuranApp to various hosting platforms for testing and production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
```bash
# Copy production environment template
cp .env.example .env.production

# Edit .env.production with your values
# IMPORTANT: Generate secure JWT secret
openssl rand -hex 64
```

### 2. Build Test
```bash
# Install dependencies
npm install

# Run production build
npm run build

# Test production build locally
npm run preview
```

### 3. Verify Build
- Check `dist/` directory is created
- Verify bundle size: ~800KB
- Test in browser: http://localhost:4173

---

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - FREE)

**Fastest and easiest deployment with automatic deployments.**

#### Quick Deploy:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   # One-command deployment
   netlify deploy --prod

   # Follow prompts:
   # - Create new site: Yes
   # - Build command: npm run build
   # - Publish directory: dist
   ```

4. **Your app will be live at:**
   ```
   https://[random-name].netlify.app
   ```

#### Alternative: GitHub Integration

1. Push code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables from `.env.production`
6. Deploy!

**Configuration**: `netlify.toml` (already included)

---

### Option 2: Vercel (FREE)

**Excellent for React apps with automatic deployments.**

#### Quick Deploy:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod

   # Follow prompts:
   # - Set up project: Yes
   # - Framework preset: Vite
   # - Build command: npm run build
   # - Output directory: dist
   ```

3. **Your app will be live at:**
   ```
   https://[project-name].vercel.app
   ```

#### Alternative: GitHub Integration

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel auto-detects Vite configuration
6. Deploy!

**Configuration**: `vercel.json` (already included)

---

### Option 3: GitHub Pages (FREE)

**Good for simple hosting, requires custom workflow.**

#### Setup:

1. **Create deployment workflow**
   ```bash
   # Already created at: .github/workflows/deploy-github-pages.yml
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Save

3. **Push to main branch**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **Your app will be live at:**
   ```
   https://[username].github.io/quranApp
   ```

---

### Option 4: Railway (FREE Tier)

**Good for full-stack apps with database needs.**

#### Quick Deploy:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure**
   - Build command: `npm run build`
   - Start command: `npm run preview`

---

### Option 5: Render (FREE)

**Automatic deployments with SSL and CDN.**

1. Go to [Render](https://render.com)
2. New → Static Site
3. Connect GitHub repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy!

---

## 🚀 Recommended: One-Click Deploy to Netlify

**The fastest way to test your app:**

```bash
# Build and deploy in one command
npm run build && netlify deploy --prod
```

**Or use the web UI:**

1. Push code to GitHub
2. Go to [Netlify](https://app.netlify.com/drop)
3. Drag and drop your `dist` folder
4. Get instant URL!

---

## ⚙️ Environment Variables

Set these in your hosting provider dashboard:

### Required Variables:
```env
VITE_API_BASE_URL=https://api.quran.com/api/v4
VITE_ENABLE_CSP=true
VITE_BUILD_ENV=production
```

### Optional (for enhanced features):
```env
VITE_SENTRY_DSN=your-sentry-dsn
VITE_JWT_SECRET=your-secure-jwt-secret
```

### Where to Set:

**Netlify**: Site settings → Environment variables
**Vercel**: Project settings → Environment Variables
**GitHub Pages**: Repository settings → Secrets
**Railway**: Project → Variables
**Render**: Environment → Environment Variables

---

## 🧪 Test Your Deployment

### 1. Basic Functionality Test
- [ ] App loads without errors
- [ ] Homepage displays correctly
- [ ] Navigation works
- [ ] Audio player functions
- [ ] Offline mode works (PWA)

### 2. Performance Test
- [ ] Lighthouse score >90
- [ ] Load time <3s on 3G
- [ ] Bundle size ~800KB

### 3. Security Test
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] CSP working
- [ ] No console errors

### 4. Mobile Test
- [ ] Responsive design works
- [ ] Touch targets are 44px+
- [ ] Accessible on mobile

---

## 📊 Deployment Comparison

| Platform | Deploy Time | Free Tier | Custom Domain | Auto Deploy | SSL | CDN |
|----------|-------------|-----------|---------------|-------------|-----|-----|
| **Netlify** | 1-2 min | ✅ 100GB/mo | ✅ | ✅ | ✅ | ✅ |
| **Vercel** | 1-2 min | ✅ 100GB/mo | ✅ | ✅ | ✅ | ✅ |
| **GitHub Pages** | 3-5 min | ✅ 1GB | ✅ | ✅ | ✅ | ✅ |
| **Railway** | 2-3 min | ✅ 500h/mo | ✅ | ✅ | ✅ | ❌ |
| **Render** | 2-3 min | ✅ 100GB/mo | ✅ | ✅ | ✅ | ✅ |

**Recommendation**: Start with **Netlify** for instant deployment with best features.

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Fails
```bash
# Check build logs
netlify deploy --debug

# Or for Vercel
vercel --debug
```

### App Not Loading
1. Check browser console for errors
2. Verify environment variables are set
3. Check network tab for failed requests
4. Ensure base URL is correct

### 404 on Routes
- Ensure redirect rules are configured
- Check `netlify.toml` or `vercel.json`
- Add rewrites for SPA routing

---

## 🎯 Quick Start (Recommended)

**For immediate testing, use Netlify Drop:**

```bash
# 1. Build locally
npm run build

# 2. Go to https://app.netlify.com/drop

# 3. Drag and drop the 'dist' folder

# 4. Get instant URL!
```

**Time to deploy: 30 seconds!** ⚡

---

## 📞 Support

Need help deploying? Check:
- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Docs](https://docs.github.com/pages)

---

## ✅ Post-Deployment

After deployment:
1. ✅ Test all features
2. ✅ Run Lighthouse audit
3. ✅ Check security headers
4. ✅ Verify PWA installation
5. ✅ Test offline functionality
6. ✅ Share URL for feedback

---

**Your app is now live and ready for testing!** 🎉
