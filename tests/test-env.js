// Simple test to check environment variables
const fs = require('fs');
const path = require('path');

try {
  // Check if .env file exists
  const envPath = path.resolve(__dirname, '.env');
  console.log('🔍 Checking for .env file at:', envPath);
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    
    // Read and parse .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 .env content:');
    console.log(envContent);
    
    // Parse environment variables
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          const value = trimmedLine.substring(equalIndex + 1).trim();
          process.env[key] = value;
          console.log(`🔧 Set ${key} = ${value.substring(0, 20)}...`);
        }
      }
    });
    
    console.log('\n📊 Environment variables loaded:');
    console.log('MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI ? 'LOADED' : 'NOT LOADED');
    console.log('CLIENT_URL:', process.env.CLIENT_URL ? 'LOADED' : 'NOT LOADED');
    console.log('SERVER_URL:', process.env.SERVER_URL ? 'LOADED' : 'NOT LOADED');
    
    // Debug: Show actual values
    console.log('\n🔍 Debug - Actual values:');
    console.log('MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI);
    console.log('CLIENT_URL:', process.env.CLIENT_URL);
    console.log('SERVER_URL:', process.env.SERVER_URL);
    
    if (process.env.MONGODB_TEST_URI) {
      const maskedUri = process.env.MONGODB_TEST_URI.replace(/:[^:@]*@/, ':***@');
      console.log('🔗 MongoDB URI (masked):', maskedUri);
    }
  } else {
    console.log('❌ .env file not found');
    console.log('💡 Create tests/.env file with:');
    console.log('MONGODB_TEST_URI=mongodb+srv://jrsemini:O6FJk65jyUfSTOTo@spf-ecommerce-mern.ert4vda.mongodb.net/spf_test?retryWrites=true&w=majority&appName=spf-ecommerce-mern');
    console.log('CLIENT_URL=http://localhost:5173');
    console.log('SERVER_URL=http://localhost:5000');
  }
} catch (error) {
  console.error('❌ Error testing environment:', error);
} 