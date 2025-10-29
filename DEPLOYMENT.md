# Google Maps Clone - Deployment Guide

This guide covers the complete deployment process for the Google Maps Clone frontend application.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring and Analytics](#monitoring-and-analytics)
6. [Security Configuration](#security-configuration)
7. [Troubleshooting](#troubleshooting)

## Environment Setup

### Required Environment Variables

Create the following environment variables in your deployment platform:

#### Google Maps API
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps JavaScript API key
- `REACT_APP_GOOGLE_MAPS_API_URL`: Google Maps API endpoint (default: https://maps.googleapis.com/maps/api/js)

#### Monitoring
- `REACT_APP_SENTRY_DSN`: Sentry DSN for error tracking
- `REACT_APP_GA_TRACKING_ID`: Google Analytics 4 measurement ID

#### Application Settings
- `REACT_APP_ENV`: Environment (development, staging, production)
- `REACT_APP_DEBUG`: Enable debug mode (true/false)
- `REACT_APP_LOG_LEVEL`: Logging level (debug, info, warn, error)

#### Feature Flags
- `REACT_APP_ENABLE_STREET_VIEW`: Enable street view feature
- `REACT_APP_ENABLE_PLACES_AUTOCOMPLETE`: Enable places autocomplete
- `REACT_APP_ENABLE_GEOCODING`: Enable geocoding service
- `REACT_APP_ENABLE_DARK_MODE`: Enable dark mode

## Vercel Deployment

### Prerequisites
- Vercel account
- Connected GitHub repository
- Google Maps API key with proper restrictions

### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Project**
   ```bash
   vercel link
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add REACT_APP_GOOGLE_MAPS_API_KEY
   vercel env add REACT_APP_SENTRY_DSN
   vercel env add REACT_APP_GA_TRACKING_ID
   ```

5. **Deploy**
   ```bash
   vercel --prod
   ```

### Custom Domain Configuration

1. **Add Custom Domain**
   ```bash
   vercel domains add yourdomain.com
   ```

2. **Verify DNS**
   Ensure DNS records point to Vercel:
   ```
   CNAME @ cname.vercel-dns.com
   ```

3. **SSL Certificate**
   Vercel automatically provisions SSL certificates for custom domains.

### Preview Deployments

- Automatic preview deployments are created for every pull request
- Preview URLs are shared in PR comments
- Environment variables for previews use staging values

## Docker Deployment

### Build and Run

1. **Build Docker Image**
   ```bash
   docker build -t google-maps-clone .
   ```

2. **Run Container**
   ```bash
   docker run -p 8080:8080 \
     -e REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key \
     google-maps-clone
   ```

### Docker Compose

1. **Development Environment**
   ```bash
   docker-compose --profile dev up
   ```

2. **Production Environment**
   ```bash
   docker-compose --profile production up
   ```

3. **Monitoring Stack**
   ```bash
   docker-compose --profile monitoring up
   ```

### Health Checks

The Docker container includes built-in health checks:
- Nginx process check
- HTTP endpoint check
- Critical file existence check

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline with the following stages:

1. **Code Quality & Security**
   - Type checking
   - ESLinting
   - Security audit
   - Format checking

2. **Unit Tests**
   - Jest/React Testing Library tests
   - Coverage reporting
   - Codecov integration

3. **Build**
   - Multi-environment builds
   - Bundle size analysis
   - Artifact upload

4. **E2E Tests**
   - Playwright testing
   - Cross-browser validation
   - Visual regression testing

5. **Performance Tests**
   - Lighthouse CI
   - Core Web Vitals monitoring
   - Performance budgets

6. **Deployment**
   - Staging environment
   - Production environment
   - Rollback capabilities

### Pipeline Configuration

To configure the pipeline:

1. **GitHub Secrets**
   - `GOOGLE_MAPS_API_KEY`: Production API key
   - `SENTRY_DSN`: Sentry configuration
   - `GA_TRACKING_ID`: Google Analytics ID
   - `VERCEL_TOKEN`: Vercel deployment token
   - `ORG_ID`: Vercel organization ID
   - `PROJECT_ID`: Vercel project ID

2. **Environment-specific Variables**
   - Staging: Uses `develop` branch
   - Production: Uses `main` branch

## Monitoring and Analytics

### Error Tracking (Sentry)

1. **Setup Sentry Project**
   - Create new Sentry project
   - Configure DSN in environment variables
   - Set up source maps upload

2. **Error Monitoring**
   - Automatic error capture
   - Performance monitoring
   - User feedback collection
   - Release tracking

### Analytics (Google Analytics 4)

1. **Setup GA4 Property**
   - Create new GA4 property
   - Configure measurement ID
   - Set up custom events

2. **Custom Events**
   - Map interactions
   - Search events
   - Location selections
   - Performance metrics
   - Error tracking

### Performance Monitoring

1. **Core Web Vitals**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

2. **Custom Metrics**
   - Map load time
   - Search response time
   - API call performance
   - User engagement tracking

### Health Checks

1. **Application Health**
   ```typescript
   import { performHealthCheck } from './services/health-check'

   const health = await performHealthCheck({
     includeDetailed: true,
     checkNetworkLatency: true
   })
   ```

2. **Monitoring Dashboard**
   - Service status
   - Response times
   - Error rates
   - Performance metrics

## Security Configuration

### Content Security Policy (CSP)

The application implements a comprehensive CSP header:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https://maps.googleapis.com;
connect-src 'self' https://maps.googleapis.com;
```

### API Key Security

1. **Google Maps API Restrictions**
   - HTTP referrer restrictions
   - IP address restrictions (if needed)
   - API usage quotas
   - Rate limiting

2. **Environment Variable Protection**
   - Never expose API keys in client-side code
   - Use Vercel environment variables
   - Rotate keys regularly

### Additional Security Headers

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### HTTPS Configuration

- Vercel automatically provides HTTPS
- Custom domains include SSL certificates
- HSTS headers configured for production

## Troubleshooting

### Common Issues

#### Google Maps API Errors

1. **API Key Issues**
   - Verify API key is correct
   - Check referrer restrictions
   - Ensure API is enabled

2. **Quota Exceeded**
   - Monitor API usage in Google Cloud Console
   - Implement request debouncing
   - Add caching strategies

3. **Loading Failures**
   - Check network connectivity
   - Verify script loading
   - Implement retry mechanisms

#### Build Issues

1. **Bundle Size**
   - Use `npm run build:analyze`
   - Implement code splitting
   - Optimize dependencies

2. **Memory Issues**
   - Increase Node.js memory limit
   - Optimize build process
   - Use Vite's built-in optimizations

3. **TypeScript Errors**
   - Run `npm run type-check`
   - Update type definitions
   - Configure tsconfig.json

#### Deployment Issues

1. **Environment Variables**
   - Verify all required variables are set
   - Check for typos in variable names
   - Use Vercel environment variable interface

2. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify package.json scripts
   - Ensure all dependencies are installed

3. **Runtime Errors**
   - Check browser console for errors
   - Verify network requests
   - Monitor error tracking in Sentry

### Performance Optimization

1. **Load Time Issues**
   - Implement lazy loading
   - Optimize images and assets
   - Use CDN for static assets

2. **Map Performance**
   - Implement marker clustering
   - Use viewport-based loading
   - Cache map tiles

3. **Memory Usage**
   - Implement cleanup for map instances
   - Use React.memo for components
   - Optimize state management

### Debug Tools

1. **Development Tools**
   - React Developer Tools
   - Redux DevTools (if using Redux)
   - Chrome DevTools Performance tab

2. **Testing Tools**
   - Jest for unit tests
   - Playwright for E2E tests
   - Lighthouse for performance

3. **Monitoring Tools**
   - Sentry for error tracking
   - Google Analytics for user metrics
   - Vercel Analytics for performance

### Support and Maintenance

1. **Regular Updates**
   - Update dependencies monthly
   - Review security advisories
   - Update API configurations

2. **Monitoring**
   - Set up alerts for errors
   - Monitor performance metrics
   - Review analytics reports

3. **Documentation**
   - Keep documentation updated
   - Document API changes
   - Maintain changelog

## Emergency Procedures

### Rollback Process

1. **Vercel Rollback**
   ```bash
   vercel rollback [deployment-url]
   ```

2. **Git Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Docker Rollback**
   ```bash
   docker tag previous-image google-maps-clone:latest
   docker-compose up -d
   ```

### Incident Response

1. **Identify Issue**
   - Check error monitoring
   - Review deployment logs
   - Analyze user reports

2. **Assess Impact**
   - Determine affected users
   - Estimate downtime
   - Prioritize fixes

3. **Communicate**
   - Notify team members
   - Update status page
   - Inform users if necessary

4. **Resolve**
   - Implement fix
   - Deploy to staging
   - Test thoroughly
   - Deploy to production

5. **Review**
   - Document incident
   - Analyze root cause
   - Improve processes

---

For additional support or questions, please refer to the project documentation or contact the development team.