import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/performance.setup.ts'],
    include: ['src/**/__tests__/**/*.{performance,perf}.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'e2e',
      'coverage',
      '**/*.d.ts',
      '**/*.config.*',
      '**/.{idea,git,cache,output,temp}'
    ],
    // Performance-specific configuration
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        maxThreads: 1,
        minThreads: 1
      }
    },
    // Disable coverage for performance tests
    coverage: {
      enabled: false
    },
    // Performance monitoring
    logHeapUsage: true,
    isolate: false,
    // Performance thresholds
    benchmark: {
      include: ['src/**/__tests__/**/*.{benchmark,bench}.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      outputFile: './performance-results.json',
      outputJson: true
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/test')
    }
  },
  define: {
    'process.env.NODE_ENV': '"performance"'
  }
})