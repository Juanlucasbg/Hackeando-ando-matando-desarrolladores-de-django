# Development Setup Guide

This guide will help you set up a complete development environment for the Google Maps Clone application.

## Prerequisites

### Required Software

- **Node.js** (Version 18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **Package Manager** (Choose one)
  - **npm** (comes with Node.js) - `npm --version`
  - **pnpm** (recommended for faster installs) - `pnpm --version`
  - **yarn** (alternative) - `yarn --version`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Development Tools (Recommended)

- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

- **Browser** (for testing)
  - Chrome/Chromium (recommended for DevTools)
  - Firefox
  - Safari (for iOS testing)
  - Edge (for Windows testing)

## Quick Setup

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/liu-purnomo/google-map-clone.git
cd google-map-clone

# Using SSH (recommended for contributors)
git clone git@github.com:liu-purnomo/google-map-clone.git
cd google-map-clone
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install

# Using yarn
yarn install
```

### 3. Environment Setup

Create your environment configuration file:

```bash
# Copy the example file
cp .env.example .env.local

# Or create manually
touch .env.local
```

Add your configuration variables to `.env.local`:

```bash
# Google Maps API Configuration
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_GOOGLE_MAPS_API_URL=https://maps.googleapis.com/maps/api/js

# Application Settings
REACT_APP_APP_NAME=Google Maps Clone
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=Interactive mapping application

# Development Settings
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
REACT_APP_API_URL=http://localhost:3001

# Optional: Analytics and Monitoring
REACT_APP_SENTRY_DSN=your_sentry_dsn_here
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id_here
```

### 4. Start Development Server

```bash
# Using npm
npm start

# Using pnpm
pnpm dev

# Using yarn
yarn dev
```

The application will open at `http://localhost:5173` (or the next available port).

## Google Maps API Setup

### 1. Get Google Maps API Key

1. **Create/Select Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one

2. **Enable Required APIs**
   - Google Maps JavaScript API
   - Geocoding API
   - Places API
   - (Optional) Street View Static API

3. **Create API Key**
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the generated key

4. **Secure Your API Key**
   - Click on the created API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your development URLs:
     - `http://localhost:5173/*`
     - `http://localhost:3000/*`
     - Your production domain when deployed

5. **Enable Billing** (if needed)
   - Google Maps API requires billing enabled
   - Generous free tier available ($200/month credit)

### 2. API Key Best Practices

```bash
# Never commit API keys to version control
# Always use environment variables

# Different keys for different environments
REACT_APP_GOOGLE_MAPS_API_KEY_DEV=dev_key_here
REACT_APP_GOOGLE_MAPS_API_KEY_PROD=prod_key_here

# Key restrictions
# - HTTP referrers for web apps
# - IP addresses for backend services
# - Android/iOS apps for mobile
```

## IDE Configuration

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### VS Code Extensions

Install these recommended extensions:

```bash
# Install VS Code extensions via command line
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-json
code --install-extension formulahendry.auto-rename-tag
code --install-extension eamodio.gitlens
```

## Development Workflow

### 1. Feature Development

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code changes ...

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 2. Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests in watch mode
npm run test:unit        # Run unit tests once with coverage
npm run test:component   # Run component tests
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Analysis
npm run analyze          # Analyze bundle size
npm run build:analyze    # Build and analyze

# Storybook
npm run storybook        # Start Storybook development
npm run build-storybook  # Build Storybook for deployment
```

### 3. Git Hooks

The project uses Husky for Git hooks:

```bash
# Pre-commit hook runs:
# - ESLint with auto-fix
# - Prettier formatting
# - Type checking

# Pre-push hook runs:
# - Unit tests
# - Component tests
```

## Debugging

### 1. VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome against localhost",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--inspect-brk"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 2. Browser DevTools

1. **Console Logging**
   ```typescript
   // Development logging
   if (process.env.NODE_ENV === 'development') {
     console.log('Debug info:', data);
   }
   ```

2. **React DevTools**
   - Install browser extension
   - Inspect component hierarchy
   - Profile component performance

3. **Network Tab**
   - Monitor API requests
   - Check Google Maps API usage
   - Debug caching behavior

### 3. Common Issues

**Google Maps API Not Loading:**
```bash
# Check API key
echo $REACT_APP_GOOGLE_MAPS_API_KEY

# Verify API key permissions
# Check browser console for specific error messages
```

**Port Already in Use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

**TypeScript Errors:**
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## Testing Setup

### 1. Unit Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### 2. Component Testing

```bash
# Run component tests
npm run test:component

# Run specific test file
npm run test -- SearchBar.test.tsx
```

### 3. E2E Testing

```bash
# Install Playwright browsers
npm run playwright:install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### 4. Test Configuration

- **Vitest** for unit and component tests
- **Playwright** for E2E tests
- **Testing Library** for React component testing
- **MSW** (Mock Service Worker) for API mocking

## Performance Optimization

### 1. Development Performance

```bash
# Enable Fast Refresh (default in Vite)
# File changes reflect instantly

# Use source maps for debugging
# Already configured in development mode
```

### 2. Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Build with analysis
npm run build:analyze
```

### 3. Performance Monitoring

```typescript
// Use React DevTools Profiler
// Monitor component render performance
// Check Google Maps API usage
```

## Environment Management

### 1. Environment Variables

```bash
# Development (.env.development)
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
REACT_APP_API_URL=http://localhost:3001

# Production (.env.production)
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error
REACT_APP_API_URL=https://api.yourdomain.com
```

### 2. Multiple Environments

```bash
# Staging
npm run build -- --mode staging
npm run preview -- --mode staging

# Production
npm run build
npm run preview
```

## Collaboration Setup

### 1. Code Reviews

1. Create pull requests for all changes
2. Ensure all tests pass
3. Request code review from team members
4. Address feedback before merging

### 2. Branch Naming

```bash
# Feature branches
feature/user-authentication
feature/map-clustering

# Bugfix branches
fix/geocoding-error-handling
fix/mobile-responsive-issues

# Hotfix branches
hotfix/critical-security-patch
```

### 3. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add user authentication
fix: resolve geocoding timeout issue
docs: update API documentation
test: add unit tests for map component
```

## Troubleshooting

### Common Development Issues

**Node Version Incompatibility:**
```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm use 18
nvm install 18
```

**Dependency Issues:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Port Conflicts:**
```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>
```

**Cache Issues:**
```bash
# Clear Vite cache
rm -rf .vite

# Clear TypeScript cache
npx tsc --build --clean
```

## Next Steps

Once your development environment is set up:

1. Read the [Component Documentation](./components.md)
2. Review the [State Management Guide](./state-management.md)
3. Understand the [API Integration patterns](./api-integration.md)
4. Follow the [Testing Guide](./testing.md)
5. Check the [Coding Standards](./coding-standards.md)

Happy coding! 🚀