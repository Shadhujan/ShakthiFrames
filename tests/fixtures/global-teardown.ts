// tests/fixtures/global-teardown.ts
import { DatabaseHelper } from '../utils/database-helpers';

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Perform final cleanup of test data only
    console.log('🧹 Final cleanup of test data...');
    await DatabaseHelper.cleanup();
    
    // Disconnect from database
    console.log('📡 Disconnecting from database...');
    await DatabaseHelper.disconnect();
    
    console.log('✅ Global test teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown error:', error);
    
    // Attempt force disconnect if needed
    try {
      await DatabaseHelper.disconnect();
    } catch (disconnectError) {
      console.error('❌ Force disconnect failed:', disconnectError);
    }
  }
}

export default globalTeardown;