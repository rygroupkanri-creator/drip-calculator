# 🚀 Deployment Guide

This guide covers deployment strategies for the IV Drip Rate Calculator PWA.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Generated all required PWA icons (see README.md)
- [ ] Updated footer links with actual recruitment URL
- [ ] Set up environment variables (if needed)
- [ ] Tested the app locally
- [ ] Verified PWA functionality in browser DevTools
- [ ] Checked all calculations are accurate
- [ ] Tested on both mobile and desktop

## Production Environment Variables

Create a `.env.production` file:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Deployment Options

### Option 1: Vercel (Recommended) ⚡

Vercel provides the best Next.js hosting experience with automatic PWA support.

#### Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables in settings
6. Click "Deploy"

**Custom Domain:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Option 2: Netlify 🌐

Netlify offers excellent support for Next.js with PWA.

#### Using Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

#### Using Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import existing project"
3. Connect your Git repository
4. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: .next
   ```
5. Install the "Essential Next.js" plugin
6. Click "Deploy site"

**Important for Netlify:**
Add a `netlify.toml` file:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Option 3: Docker 🐳

Deploy using Docker for full control.

#### Dockerfile

Already included in the project root. Build and run:

```bash
# Build image
docker build -t drip-calculator .

# Run container
docker run -p 3000:3000 drip-calculator

# Or with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  drip-calculator
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SITE_URL=https://your-domain.com
    restart: unless-stopped
```

Run: `docker-compose up -d`

### Option 4: Traditional VPS (DigitalOcean, AWS EC2, etc.) 💻

#### Prerequisites
- Node.js 18+ installed
- Nginx or Apache (optional, for reverse proxy)
- PM2 (for process management)

#### Deployment Steps

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone your repository**
   ```bash
   git clone https://your-repo-url.git
   cd drip-calculator
   ```

3. **Install dependencies**
   ```bash
   npm ci --only=production
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Install PM2**
   ```bash
   npm install -g pm2
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name "drip-calculator" -- start
   pm2 save
   pm2 startup
   ```

7. **Set up Nginx reverse proxy** (optional but recommended)

Create `/etc/nginx/sites-available/drip-calculator`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/drip-calculator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Set up SSL with Let's Encrypt** (required for PWA)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 5: Cloud Platforms ☁️

#### AWS Amplify
1. Go to AWS Amplify Console
2. Connect your Git repository
3. Configure build settings (auto-detected for Next.js)
4. Deploy

#### Google Cloud Run
1. Build container: `gcloud builds submit --tag gcr.io/PROJECT-ID/drip-calculator`
2. Deploy: `gcloud run deploy --image gcr.io/PROJECT-ID/drip-calculator --platform managed`

#### Azure Static Web Apps
1. Install Azure CLI
2. Create resource: `az staticwebapp create`
3. Deploy via GitHub Actions (auto-configured)

## Post-Deployment

### 1. Verify PWA Installation

#### On Desktop
- Open site in Chrome/Edge
- Check DevTools → Application → Manifest
- Verify Service Worker is active
- Test "Add to Home Screen"

#### On Mobile (iOS)
- Open in Safari
- Tap Share → Add to Home Screen
- Open installed app
- Verify standalone mode (no browser UI)

#### On Mobile (Android)
- Open in Chrome
- Tap menu → Install app
- Open installed app
- Verify standalone mode

### 2. Test Functionality

- [ ] Calculator performs correct calculations
- [ ] Metronome plays audio and shows visual pulse
- [ ] Disclaimer appears on first visit
- [ ] App works offline after initial load
- [ ] All icons load correctly
- [ ] Footer links work
- [ ] Responsive design works on all screen sizes

### 3. Performance Testing

Run Lighthouse audit:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App" + "Performance"
4. Click "Generate report"

**Target Scores:**
- Performance: 90+
- PWA: 100
- Accessibility: 90+
- Best Practices: 90+

### 4. Monitor

Set up monitoring (optional):
- Error tracking: Sentry
- Analytics: Google Analytics, Plausible
- Uptime monitoring: UptimeRobot, StatusCake

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SITE_URL: ${{ secrets.SITE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## SSL Certificate (Required for PWA)

PWAs **require HTTPS** in production. Options:

1. **Let's Encrypt** (Free)
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

2. **Cloudflare** (Free)
   - Add site to Cloudflare
   - Update nameservers
   - Enable "Always Use HTTPS"

3. **Platform-provided** (Vercel, Netlify, etc.)
   - Automatic HTTPS included

## Domain Configuration

### DNS Records

For your domain, add:

```
Type    Name    Value               TTL
A       @       YOUR_SERVER_IP      3600
CNAME   www     your-domain.com     3600
```

### Vercel/Netlify Custom Domain
1. Add domain in platform dashboard
2. Add CNAME record:
   ```
   CNAME   @   cname.vercel-dns.com (or similar)
   ```

## Troubleshooting

### PWA Not Installing
- **Cause**: Missing HTTPS or incomplete manifest
- **Fix**: Ensure HTTPS is enabled and all icon sizes exist

### Service Worker Not Registering
- **Cause**: Build configuration issue
- **Fix**: Verify `next.config.js` has PWA plugin correctly configured

### Icons Not Loading
- **Cause**: Icons not generated or paths incorrect
- **Fix**: Generate all icon sizes and verify paths in `manifest.json`

### Build Fails
- **Cause**: Dependencies or TypeScript errors
- **Fix**: Run `npm run type-check` locally first

## Rollback Strategy

### Vercel
```bash
vercel rollback
```

### PM2
```bash
pm2 list  # Get app ID
pm2 restart drip-calculator
```

### Docker
```bash
docker rollback service-name
```

## Security Checklist

- [ ] HTTPS enabled (required for PWA)
- [ ] Environment variables secured
- [ ] No sensitive data in client-side code
- [ ] CSP headers configured (optional)
- [ ] Rate limiting in place (optional)
- [ ] CORS properly configured (if API exists)

## Support

For deployment issues:
1. Check build logs for errors
2. Verify environment variables
3. Test locally with `npm run build && npm start`
4. Check platform-specific documentation

---

**Ready to deploy!** 🚀

Choose your preferred platform and follow the steps above. For most users, **Vercel** provides the easiest and most reliable deployment experience.
