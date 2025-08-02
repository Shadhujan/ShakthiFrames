// tests/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  // Test directory configuration
  testDir: './e2e',
  
  // Parallel execution settings - optimized for development stability
  fullyParallel: false, // Keep false to prevent database conflicts
  workers: 1, // Single worker for database consistency
  
  // Retry configuration - balanced for reliability vs speed
  retries: process.env.CI ? 2 : 1, // More retries in CI environment
  
  // Failure tolerance
  forbidOnly: !!process.env.CI,
  
  // Enhanced timeouts for React development environment
  timeout: 90000, // Increased global timeout for complex operations
  expect: {
    timeout: 15000, // Longer expectation timeout for async operations
  },
  
  // Reporter configuration with detailed output
  reporter: [
    ['list', { printSteps: true }], // Detailed console output
    ['html', { 
      open: 'never',
      outputFolder: 'playwright-report',
      host: 'localhost',
      port: 9323
    }],
    ['json', { outputFile: 'test-results.json' }] // Machine-readable results
  ],
  
  // Global test configuration optimized for React + E2E testing
  use: {
    // Application settings
    baseURL: 'http://localhost:5173',
    
    // Browser behavior
    headless: false, // Visual debugging in development
    
    // Enhanced timeout settings
    actionTimeout: 20000, // Increased for form interactions
    navigationTimeout: 30000, // Longer for page loads
    
    // Debugging and failure analysis
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Network and performance
    ignoreHTTPSErrors: true, // Handle dev SSL issues
    
    // Viewport configuration
    viewport: { width: 1280, height: 720 },
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Additional browser context options
    permissions: ['notifications'], // Allow notifications for testing
  },

  // Browser configuration matrix
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // Browser launch arguments (correct placement)
        launchOptions: {
          args: [
            '--disable-web-security', // Handle CORS in development
            '--disable-features=TranslateUI', // Prevent translation popups
            '--no-first-run', // Skip first-run experience
            '--disable-default-apps', // Disable default apps
          ],
        },
        // Enhanced context options for testing
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9'
        },
      },
    },
    
    // Optional: Additional browser configurations (uncomment as needed)
    // {
    //   name: 'firefox-desktop',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Global setup and teardown with enhanced error handling
  globalSetup: path.resolve(__dirname, 'fixtures/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'fixtures/global-teardown.ts'),

  // Development server configuration with enhanced process management
  webServer: [
    {
      // React development server (port-based approach)
      command: 'npm run dev',
      cwd: path.resolve(__dirname, '../client'),
      port: 5173,
      timeout: 120000, // Increased startup timeout
      reuseExistingServer: true, // Allow existing client server
      env: {
        NODE_ENV: 'test', // Ensure test environment
        BROWSER: 'none', // Prevent auto-opening browser
      },
      ignoreHTTPSErrors: true,
    },
    {
      // Express backend server with comprehensive environment setup
      command: 'npm run dev',
      cwd: path.resolve(__dirname, '../server'),
      port: 5000,
      timeout: 60000,
      reuseExistingServer: true, // Allow existing server
      env: {
        NODE_ENV: 'test',
        // Database configuration
        MONGODB_URI: process.env.MONGODB_TEST_URI || 
                    process.env.MONGODB_URI || 
                    'mongodb://localhost:27017/spf_test',
        // Authentication configuration
        JWT_SECRET: process.env.JWT_SECRET || 'shakthi-secret-key-12345-super-secure-token',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
        // Client configuration
        CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
        // Server configuration
        PORT: '5000',
        // Cloudinary configuration (prevent startup errors)
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'test-key',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'test-secret',
        // Stripe configuration (prevent payment errors)
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
        // Email configuration (prevent SMTP errors)
        SMTP_USER: process.env.SMTP_USER || 'test@example.com',
        SMTP_PASS: process.env.SMTP_PASS || 'test-password',
        SENDER_EMAIL: process.env.SENDER_EMAIL || 'test@example.com',
        // Additional API keys (prevent startup failures)
        GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY || 'test-api-key',
      },
      ignoreHTTPSErrors: true,
    }
  ],

  // Output directory configuration
  outputDir: 'test-results/',
  
  // Test matching patterns
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.e2e.ts'
  ],
  
  // Files to ignore during test discovery
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.config.ts'
  ],

  // Environment metadata (with safe version handling)
  metadata: {
    environment: process.env.NODE_ENV || 'development',
    testSuite: 'E2E Tests - SPF Ecommerce',
    version: (() => {
      try {
        return require('../package.json').version || '1.0.0';
      } catch {
        return '1.0.0';
      }
    })(),
    timestamp: new Date().toISOString(),
  },
});