// tests/utils/verify-env-format.ts
import * as fs from 'fs';
import * as pathModule from 'path';

interface EnvVariable {
  key: string;
  value: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

function verifyEnvironmentFile(): boolean {
  console.log('🔍 Verifying .env file format and content...\n');
  
  const envFilePath = pathModule.resolve(__dirname, '../.env');
  
  try {
    // Check if .env file exists
    if (!fs.existsSync(envFilePath)) {
      console.error('❌ .env file not found at:', envFilePath);
      console.log('\n📝 Create .env file with this content:');
      displaySampleEnvContent();
      return false;
    }
    
    // Read and analyze .env content
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    console.log('✅ .env file found at:', envFilePath);
    console.log('📄 Content analysis:\n');
    
    const envVariables = parseEnvContent(envContent);
    const validationResult = validateEnvironmentVariables(envVariables);
    
    console.log('\n' + '='.repeat(50));
    
    if (validationResult.isValid) {
      console.log('✅ Environment file is properly configured');
      return true;
    } else {
      console.log('❌ Environment file has configuration issues');
      console.log('\n🔧 Required fixes:');
      validationResult.issues.forEach((issue: string) => {
        console.log(`- ${issue}`);
      });
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error reading .env file:', error);
    return false;
  }
}

function parseEnvContent(content: string): EnvVariable[] {
  const lines = content.split('\n').filter((line: string) => line.trim() && !line.startsWith('#'));
  const envVars: EnvVariable[] = [];
  
  lines.forEach((line: string) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars.push({
        key: key.trim(),
        value: valueParts.join('=').trim()
      });
    }
  });
  
  return envVars;
}

function validateEnvironmentVariables(envVars: EnvVariable[]): ValidationResult {
  const criticalVars: string[] = [
    'MONGODB_TEST_URI',
    'MONGODB_URI', 
    'NODE_ENV',
    'CLIENT_URL',
    'SERVER_URL',
    'JWT_SECRET'
  ];
  
  const envVarMap: { [key: string]: string } = {};
  envVars.forEach((envVar: EnvVariable) => {
    envVarMap[envVar.key] = envVar.value;
  });
  
  let allValid = true;
  const issues: string[] = [];
  
  criticalVars.forEach((varName: string) => {
    const value = envVarMap[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value 
      ? (varName.includes('URI') || varName.includes('SECRET') 
         ? '***HIDDEN***' 
         : value)
      : 'NOT SET';
    
    console.log(`${status} ${varName}: ${displayValue}`);
    
    if (!value) {
      allValid = false;
      issues.push(`Missing required variable: ${varName}`);
    } else if (varName.includes('MONGODB') && value.includes('YOUR_PASSWORD')) {
      console.log(`   ⚠️ Contains placeholder password - replace YOUR_PASSWORD`);
      allValid = false;
      issues.push(`Replace placeholder password in ${varName}`);
    } else if (varName.includes('MONGODB') && !value.includes('spf_test')) {
      console.log(`   ⚠️ Database name should be 'spf_test'`);
      allValid = false;
      issues.push(`Database name should be 'spf_test' in ${varName}`);
    }
  });
  
  return {
    isValid: allValid,
    issues
  };
}

function displaySampleEnvContent(): void {
  console.log(`
# SPF E-Commerce Test Environment
MONGODB_TEST_URI=mongodb+srv://jrsemini:YOUR_ACTUAL_PASSWORD@spf-ecommerce-mern.ert4vda.mongodb.net/spf_test?retryWrites=true&w=majority&appName=spf-ecommerce-mern
MONGODB_URI=mongodb+srv://jrsemini:YOUR_ACTUAL_PASSWORD@spf-ecommerce-mern.ert4vda.mongodb.net/spf_test?retryWrites=true&w=majority&appName=spf-ecommerce-mern
NODE_ENV=test
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
JWT_SECRET=shakthi-secret-key-12345-super-secure-token
JWT_EXPIRES_IN=30d
TEST_TIMEOUT=30000
  `);
}

// Export for potential programmatic use
export { verifyEnvironmentFile };

// Run verification if executed directly
if (require.main === module) {
  verifyEnvironmentFile();
}