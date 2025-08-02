// tests/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  // Test directory relative to this config file
  testDir: './e2e', // Changed from './tests/e2e' to './e2e'
  
  // Run tests in files in parallel
  fullyParallel: false, // Keep false to avoid database conflicts
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 1,
  
  // Opt out of parallel tests on CI
  workers: 1, // Single worker to avoid database conflicts
  
  // Reporter to use
  reporter: [
    ['list'], // Simple list reporter for console
    ['html', { 
      open: 'never',
      outputFolder: 'playwright-report' // Changed to avoid conflict
    }]
  ],
  
  // Global test timeout
  timeout: 60000, // Increased timeout for E2E tests
  
  // Shared settings for all tests
  use: {
    // Base URL for your application
    baseURL: 'http://localhost:5173', // Your React dev server
    
    // Browser settings
    headless: false, // Set to true for CI
    
    // Global test timeout
    actionTimeout: 30000,
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Trace configuration
    trace: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global setup and teardown
  globalSetup: path.resolve(__dirname, 'fixtures/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'fixtures/global-teardown.ts'),

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'npm run dev',
      cwd: path.resolve(__dirname, '../client'), // Relative to project root
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      cwd: path.resolve(__dirname, '../server'), // Relative to project root
      port: 5000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});