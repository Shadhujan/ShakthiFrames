// tests/fixtures/global-teardown.ts
import { FullConfig } from '@playwright/test';
import { DatabaseHelper } from '../utils/database-helpers';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Cleanup test environment
    await DatabaseHelper.cleanup();
    await DatabaseHelper.disconnect();
    
    console.log('✅ Global test teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here as tests have already completed
  }
}

export default globalTeardown;