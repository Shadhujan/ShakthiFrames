// tests/utils/env-loader.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Load environment variables from .env file for test environment
 * This ensures variables are available before tests execute
 */
export function loadTestEnvironment() {
  try {
    // Load .env file from tests directory
    const envPath = resolve(__dirname, '../.env');
    const envFile = readFileSync(envPath, 'utf8');
    
    // Parse .env file and set environment variables
    envFile.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key.trim()] = value.trim();
        }
      }
    });
    
    console.log('✅ Test environment variables loaded successfully');
    
    // Verify critical variables
    const requiredVars = ['MONGODB_TEST_URI', 'CLIENT_URL', 'SERVER_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️ Missing environment variables:', missingVars);
    }
    
    // Debug: Show MongoDB URI (masked for security)
    const mongoUri = process.env.MONGODB_TEST_URI;
    if (mongoUri) {
      const maskedUri = mongoUri.replace(/:[^:@]*@/, ':***@');
      console.log('📄 Using MongoDB URI:', maskedUri);
    }
    
  } catch (error) {
    console.error('❌ Failed to load test environment:', error);
    console.log('💡 Make sure tests/.env file exists with MONGODB_TEST_URI');
  }
}

/**
 * Get MongoDB test URI with validation
 */
export function getMongoTestUri(): string {
  const uri = process.env.MONGODB_TEST_URI;
  
  if (!uri) {
    throw new Error(
      'MONGODB_TEST_URI environment variable is not set. ' +
      'Please create tests/.env file with your Atlas connection string.'
    );
  }
  
  // Validate URI format
  if (!uri.includes('mongodb')) {
    throw new Error('Invalid MongoDB URI format in MONGODB_TEST_URI');
  }
  
  // Ensure it's pointing to test database
  if (!uri.includes('spf_test') && !uri.includes('test')) {
    console.warn('⚠️ Warning: Database name does not appear to be a test database');
  }
  
  return uri;
}