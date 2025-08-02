// tests/fixtures/global-setup.ts
import { FullConfig } from '@playwright/test';
import { DatabaseHelper } from '../utils/database-helpers';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const connectionSuccess = await DatabaseHelper.testConnection();
    
    if (!connectionSuccess) {
      throw new Error('Database connection test failed. Cannot proceed with tests.');
    }
    
    // Setup test environment
    console.log('🧹 Cleaning existing test data...');
    await DatabaseHelper.cleanup();
    
    console.log('🌱 Seeding test data...');
    await DatabaseHelper.seedTestData();
    
    console.log('✅ Global test setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Provide debugging information
    console.log('\n🔧 Debugging Information:');
    console.log('Environment variables:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI ? 'SET' : 'NOT SET');
    console.log('- CLIENT_URL:', process.env.CLIENT_URL);
    console.log('- SERVER_URL:', process.env.SERVER_URL);
    
    throw error;
  }
}

export default globalSetup;
