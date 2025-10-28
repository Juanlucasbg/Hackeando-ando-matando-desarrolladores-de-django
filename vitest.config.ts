import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { coverageConfigDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'e2e',
      'coverage',
      '**/*.d.ts',
      '**/*.config.*',
      '**/.{idea,git,cache,output,temp}',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/types/',
        '**/stories/',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Critical files have higher thresholds
        './src/services/mapService.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './src/components/map/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        './src/hooks/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      },
      all: true,
      clean: true,
      cleanOnRerun: true
    },
    // Performance testing configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    // Retry failed tests
    retry: 2,
    // Sequential execution for map-related tests to avoid conflicts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    // Global test configuration
    passWithNoTests: false,
    logHeapUsage: true,
    isolate: true,
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@stores': resolve(__dirname, './src/stores'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@test': resolve(__dirname, './src/test')
    }
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
})