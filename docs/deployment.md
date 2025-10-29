# Deployment Guide

This comprehensive guide covers deploying the Google Maps Clone application to various platforms, with detailed instructions for different environments, configurations, and best practices.

## Overview

The Google Maps Clone application can be deployed to multiple platforms:

- **Vercel** (Recommended for React applications)
- **Netlify** (Alternative static hosting)
- **AWS** (Enterprise solutions)
- **Docker** (Container-based deployment)
- **Traditional hosting** (Shared/VPS hosting)

## Prerequisites

### Requirements

- **Node.js** 18.0.0 or higher
- **Google Maps API Key** with proper restrictions
- **Domain name** (for production deployment)
- **SSL Certificate** (for HTTPS)
- **CI/CD Pipeline** (optional but recommended)

### Environment Variables

Create environment-specific configuration files:

```bash
# .env.example - Copy this for your environment
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_GOOGLE_MAPS_API_URL=https://maps.googleapis.com/maps/api/js

# Application Configuration
REACT_APP_APP_NAME=Google Maps Clone
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=Interactive mapping application

# Environment Settings
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error

# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_API_TIMEOUT=10000

# Analytics and Monitoring (Optional)
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=your_sentry_dsn_here

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

## Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-maps-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.yourdomain\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['@react-google-maps/api', '@googlemaps/js-api-loader'],
          utils: ['lodash', 'date-fns', 'clsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@react-google-maps/api'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com",
        "connect-src 'self' https://api.yourdomain.com wss://realtime.yourdomain.com",
        "frame-src 'none'",
        "object-src 'none'",
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __ENVIRONMENT__: JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
```

## Vercel Deployment

### Automatic Deployment

#### 1. Connect Repository to Vercel

1. **Sign up/login** to [Vercel](https://vercel.com/)
2. **Click "New Project"**
3. **Import your Git repository**
4. **Configure project settings**

#### 2. Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "name": "google-maps-clone",
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
      "src": "/api/(.*)",
      "dest": "https://api.yourdomain.com/api/$1",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_GOOGLE_MAPS_API_KEY": "@google-maps-api-key"
  },
  "build": {
    "env": {
      "REACT_APP_ENVIRONMENT": "production",
      "REACT_APP_DEBUG": "false"
    }
  },
  "functions": {
    "build/package.json": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 3. Environment Variables in Vercel

1. Go to **Project Settings** → **Environment Variables**
2. Add your environment variables:
   - `REACT_APP_GOOGLE_MAPS_API_KEY`
   - `REACT_APP_GOOGLE_ANALYTICS_ID`
   - `REACT_APP_SENTRY_DSN`
   - Any other required variables

#### 4. Deploy

```bash
# Deploy to Vercel
npm run deploy:vercel

# Or using Vercel CLI
vercel --prod
```

### Custom Domain Setup

1. **Go to Project Settings** → **Domains**
2. **Add your custom domain**
3. **Configure DNS records**:
   ```
   Type: A
   Name: @
   Value: 76.76.19.61

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Wait for SSL certificate** to be issued

## Netlify Deployment

### Configuration Files

#### netlify.toml

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  REACT_APP_ENVIRONMENT = "production"
  REACT_APP_DEBUG = "false"

[[redirects]]
  from = "/api/*"
  to = "https://api.yourdomain.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[context.production.environment]
  REACT_APP_ENVIRONMENT = "production"

[context.deploy-preview.environment]
  REACT_APP_ENVIRONMENT = "preview"

[context.branch-deploy.environment]
  REACT_APP_ENVIRONMENT = "development"
```

### Deployment Steps

1. **Push to Git repository**
2. **Connect to Netlify**:
   - Login to [Netlify](https://netlify.com/)
   - Click "New site from Git"
   - Choose your Git provider
   - Select repository
3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Add environment variables** in Site settings
5. **Deploy site**

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Install required tools
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of nginx directories
RUN chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    server {
        listen 3000;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com; connect-src 'self' https://api.yourdomain.com wss://realtime.yourdomain.com; frame-src 'none'; object-src 'none';" always;

        # Rate limiting
        limit_req zone=general burst=50 nodelay;

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }

        # API proxy (if needed)
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass https://api.yourdomain.com;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_ssl_verify off;
        }

        # Service worker
        location /sw.js {
            expires off;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }

        # HTML files - no caching
        location ~* \.html$ {
            expires off;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Error pages
        error_page 404 /index.html;
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_GOOGLE_MAPS_API_KEY=${REACT_APP_GOOGLE_MAPS_API_KEY}
      - REACT_APP_ENVIRONMENT=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  # Optional: Add Grafana for dashboards
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

### Docker Commands

```bash
# Build and run locally
docker build -t google-maps-clone .
docker run -p 3000:3000 -e REACT_APP_GOOGLE_MAPS_API_KEY=your_key google-maps-clone

# Use Docker Compose
docker-compose up -d

# Deploy to production
docker build -t your-registry/google-maps-clone:latest .
docker push your-registry/google-maps-clone:latest

# Run on production server
docker run -d \
  --name google-maps-clone \
  -p 80:3000 \
  -e REACT_APP_GOOGLE_MAPS_API_KEY=your_key \
  --restart unless-stopped \
  your-registry/google-maps-clone:latest
```

## AWS Deployment

### AWS S3 + CloudFront

#### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html

# Enable static website hosting
aws s3api put-bucket-policy \
  --bucket your-bucket-name \
  --policy file://bucket-policy.json
```

#### 2. Bucket Policy

```json
// bucket-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

#### 3. Deploy Script

```bash
#!/bin/bash
# deploy.sh

# Build the application
npm run build

# Sync with S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
```

### AWS Amplify

#### 1. Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

#### 2. Initialize Amplify

```bash
amplify init
```

#### 3. Add Hosting

```bash
amplify add hosting
# Select "Continuous deployment (Git-based)"
# Connect your repository
```

#### 4. Deploy

```bash
amplify publish
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        REACT_APP_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
        REACT_APP_ENVIRONMENT: production

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/

    - name: Deploy to Vercel (Staging)
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID_STAGING }}
        vercel-args: '--scope your-team'

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/

    - name: Deploy to Vercel (Production)
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID_PROD }}
        vercel-args: '--prod'

  docker-deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write

    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

## Environment Configuration

### Development Environment

```bash
# .env.development
REACT_APP_GOOGLE_MAPS_API_KEY=your_dev_api_key
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_ERROR_REPORTING=false
```

### Staging Environment

```bash
# .env.staging
REACT_APP_GOOGLE_MAPS_API_KEY=your_staging_api_key
REACT_APP_ENVIRONMENT=staging
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info
REACT_APP_API_URL=https://staging-api.yourdomain.com
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
```

### Production Environment

```bash
# .env.production
REACT_APP_GOOGLE_MAPS_API_KEY=your_production_api_key
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

## SSL Certificate Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL

1. **Sign up** for [Cloudflare](https://cloudflare.com/)
2. **Add your domain**
3. **Update nameservers** to Cloudflare
4. **Enable SSL/TLS** in Crypto settings
5. **Select "Full (strict)"** mode

## Monitoring and Maintenance

### Health Check Endpoint

```typescript
// src/utils/healthCheck.ts
export const performHealthCheck = async () => {
  const checks = {
    googleMapsApi: await checkGoogleMapsApi(),
    browserSupport: checkBrowserSupport(),
    localStorage: checkLocalStorage(),
    performance: checkPerformance(),
    memory: checkMemoryUsage(),
  };

  const isHealthy = Object.values(checks).every(check => check);

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION,
  };
};

const checkGoogleMapsApi = async () => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Add health check endpoint in index.html
// This would be handled by your server in production
```

### Performance Monitoring

```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;

      const sum = values.reduce((a, b) => a + b, 0);
      result[name] = {
        avg: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    return result;
  }

  // Core Web Vitals
  measureLCP(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  measureFID(): void {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        }
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  measureCLS(): void {
    let clsValue = 0;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}
```

## Security Best Practices

### API Key Security

```typescript
// src/utils/security.ts
export const validateAPIKey = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is missing');
  }

  if (apiKey.length < 20) {
    throw new Error('Invalid API key format');
  }

  // Check if it's the example key
  if (apiKey.includes('YOUR_API_KEY') || apiKey === 'example') {
    throw new Error('Replace the example API key with your actual key');
  }

  return true;
};

// Initialize security checks
if (process.env.NODE_ENV === 'production') {
  validateAPIKey();
}
```

### Content Security Policy

```typescript
// src/utils/csp.ts
export const getCSPHeaders = () => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com",
    "connect-src 'self' https://api.yourdomain.com wss://realtime.yourdomain.com",
    "frame-src 'none'",
    "object-src 'none'",
  ];

  return policies.join('; ');
};
```

## Troubleshooting

### Common Issues

#### 1. Google Maps API Not Loading

**Symptoms**: Map doesn't load, console shows API errors

**Solutions**:
```bash
# Check API key validity
echo $REACT_APP_GOOGLE_MAPS_API_KEY

# Verify API key restrictions
# - Check HTTP referrers
# - Verify IP restrictions
# - Check API quotas

# Test API key manually
curl "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"
```

#### 2. Build Errors

**Symptoms**: Build fails with TypeScript or module errors

**Solutions**:
```bash
# Clear caches
rm -rf node_modules dist .vite
npm install

# Check TypeScript errors
npm run type-check

# Update dependencies
npm update
```

#### 3. Deployment Failures

**Symptoms**: Deployment fails or app doesn't work after deployment

**Solutions**:
```bash
# Check build logs
npm run build

# Test locally
npm run preview

# Check environment variables
printenv | grep REACT_APP

# Verify API key permissions in production
```

#### 4. Performance Issues

**Symptoms**: Slow load times, poor user experience

**Solutions**:
```bash
# Analyze bundle size
npm run build:analyze

# Check Core Web Vitals
npm run test:performance

# Optimize images and assets
# Enable compression
# Use CDN
```

### Debugging Production Issues

```typescript
// src/utils/errorReporting.ts
export const setupErrorReporting = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    import('@sentry/react').then(Sentry => {
      Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        environment: process.env.REACT_APP_ENVIRONMENT,
        tracesSampleRate: 1.0,
      });
    });
  }

  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Report to monitoring service
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Report to monitoring service
  });
};
```

## Rollback Procedures

### Quick Rollback

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Git rollback
git revert HEAD
git push origin main

# Docker rollback
docker run -d --name rollback previous-image:tag
```

### Database Rollback

```bash
# If using database migrations
npm run migrate:rollback

# Restore from backup
# (Platform-specific commands)
```

This comprehensive deployment guide covers all aspects of deploying the Google Maps Clone application to various platforms with best practices for security, performance, and maintainability.