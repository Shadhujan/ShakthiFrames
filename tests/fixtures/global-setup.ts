// tests/fixtures/global-setup.ts
import { FullConfig } from '@playwright/test';
import { DatabaseHelper } from '../utils/database-helpers';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup for SPF_TEST database...');
  
  try {
    // CRITICAL: Load environment variables from tests/.env
    console.log('📁 Loading test environment variables...');
    const envPath = path.resolve(__dirname, '../.env');
    const envResult = dotenv.config({ path: envPath });
    
    if (envResult.error) {
      console.warn('⚠️ Environment file not found at:', envPath);
      console.log('📋 Attempting to load from parent directories...');
      
      // Try alternative paths
      const altPaths = [
        path.resolve(__dirname, '../../.env'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'tests/.env')
      ];
      
      let envLoaded = false;
      for (const altPath of altPaths) {
        const altResult = dotenv.config({ path: altPath });
        if (!altResult.error) {
          console.log('✅ Environment loaded from:', altPath);
          envLoaded = true;
          break;
        }
      }
      
      if (!envLoaded) {
        console.warn('⚠️ No .env file found, using system environment variables');
      }
    } else {
      console.log('✅ Environment loaded from:', envPath);
    }
    
    // Log environment status for debugging
    console.log('📋 Environment Status:');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
    console.log('- MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI ? 'SET' : 'NOT SET');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('- CLIENT_URL:', process.env.CLIENT_URL || 'NOT SET');
    console.log('- SERVER_URL:', process.env.SERVER_URL || 'NOT SET');
    
    // 1. Test SPF_TEST database connection first
    console.log('🔍 Testing SPF_TEST database connection...');
    const connectionSuccess = await DatabaseHelper.testConnection();
    
    if (!connectionSuccess) {
      throw new Error('SPF_TEST database connection test failed. Cannot proceed with tests.');
    }
    
    // 2. Verify we're using SPF_TEST database (critical safety check)
    console.log('🛡️ Verifying SPF_TEST database safety...');
    await DatabaseHelper.verifySpfTestDatabase();
    
    // 3. Optional: Show what would be cleaned (for transparency)
    if (process.env.DRY_RUN_CLEANUP === 'true') {
      console.log('🔍 Running dry-run cleanup analysis on SPF_TEST...');
      await DatabaseHelper.dryRunCleanup();
      return; // Exit if just doing dry run
    }
    
    // 4. Clean up ONLY test data within SPF_TEST (surgical cleanup)
    console.log('🧹 Cleaning ONLY test data from SPF_TEST (your "test" database is completely protected)...');
    await DatabaseHelper.cleanup();
    
    // 5. Seed minimal test data in SPF_TEST
    console.log('🌱 Seeding minimal test data in SPF_TEST...');
    await DatabaseHelper.seedTestData();
    
    console.log('✅ Global test setup completed successfully in SPF_TEST');
    console.log('✅ Your "test" database with actual data is completely preserved');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Provide debugging information
    console.log('\n🔧 Debugging Information:');
    console.log('Environment variables:');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
    console.log('- MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI ? 'SET (***hidden***)' : 'NOT SET');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET (***hidden***)' : 'NOT SET');
    console.log('- CLIENT_URL:', process.env.CLIENT_URL || 'NOT SET');
    console.log('- SERVER_URL:', process.env.SERVER_URL || 'NOT SET');
    console.log('- DRY_RUN_CLEANUP:', process.env.DRY_RUN_CLEANUP || 'NOT SET');
    
    // Enhanced troubleshooting
    console.log('\n🛠️ Troubleshooting Steps:');
    console.log('1. Verify .env file exists in tests/ directory');
    console.log('2. Check .env file contains valid MongoDB connection strings');
    console.log('3. Ensure MongoDB Atlas credentials are correct');
    console.log('4. Verify network connectivity to MongoDB Atlas');
    console.log('5. Confirm Atlas IP whitelist includes your current IP');
    
    // Safety recommendation
    console.log('\n🛡️ SPF_TEST Database Safety Recommendations:');
    console.log('1. Using dedicated SPF_TEST database (your "test" database is protected)');
    console.log('2. Set MONGODB_TEST_URI to target SPF_TEST specifically');
    console.log('3. Run DRY_RUN_CLEANUP=true to see what would be deleted from SPF_TEST');
    console.log('4. Verify your MongoDB connection includes "/spf_test" in the database name');
    
    throw error;
  }
}

export default globalSetup;