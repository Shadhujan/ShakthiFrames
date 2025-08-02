// tests/utils/validate-environment.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from tests/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface EnvironmentValidation {
  variable: string;
  value: string | undefined;
  required: boolean;
  valid: boolean;
  message: string;
}

export function validateTestEnvironment(): boolean {
  console.log('🔍 Validating Test Environment Configuration...\n');
  
  const validations: EnvironmentValidation[] = [
    {
      variable: 'MONGODB_TEST_URI',
      value: process.env.MONGODB_TEST_URI,
      required: true,
      valid: !!(process.env.MONGODB_TEST_URI && 
               process.env.MONGODB_TEST_URI.includes('spf_test') &&
               !process.env.MONGODB_TEST_URI.includes('YOUR_PASSWORD')),
      message: 'Primary test database connection'
    },
    {
      variable: 'MONGODB_URI',
      value: process.env.MONGODB_URI,
      required: true,
      valid: !!(process.env.MONGODB_URI && 
               process.env.MONGODB_URI.includes('spf_test') &&
               !process.env.MONGODB_URI.includes('YOUR_PASSWORD')),
      message: 'Fallback database connection'
    },
    {
      variable: 'NODE_ENV',
      value: process.env.NODE_ENV,
      required: true,
      valid: process.env.NODE_ENV === 'test',
      message: 'Environment designation'
    },
    {
      variable: 'CLIENT_URL',
      value: process.env.CLIENT_URL,
      required: true,
      valid: process.env.CLIENT_URL === 'http://localhost:5173',
      message: 'React development server URL'
    },
    {
      variable: 'SERVER_URL',
      value: process.env.SERVER_URL,
      required: true,
      valid: process.env.SERVER_URL === 'http://localhost:5000',
      message: 'Express API server URL'
    },
    {
      variable: 'JWT_SECRET',
      value: process.env.JWT_SECRET,
      required: true,
      valid: !!(process.env.JWT_SECRET && process.env.JWT_SECRET.length > 10),
      message: 'JWT token signing secret'
    },
    {
      variable: 'JWT_EXPIRES_IN',
      value: process.env.JWT_EXPIRES_IN,
      required: false,
      valid: !!(process.env.JWT_EXPIRES_IN),
      message: 'JWT token expiration period'
    },
    {
      variable: 'TEST_TIMEOUT',
      value: process.env.TEST_TIMEOUT,
      required: false,
      valid: !!(process.env.TEST_TIMEOUT && !isNaN(Number(process.env.TEST_TIMEOUT))),
      message: 'Test execution timeout'
    }
  ];

  let allValid = true;
  let criticalIssues = 0;

  // Validate each environment variable
  validations.forEach(validation => {
    const status = validation.valid ? '✅' : (validation.required ? '❌' : '⚠️');
    const valueDisplay = validation.value 
      ? (validation.variable.includes('SECRET') || validation.variable.includes('URI') 
         ? '***' 
         : validation.value)
      : 'NOT SET';

    console.log(`${status} ${validation.variable}: ${valueDisplay}`);
    console.log(`   ${validation.message}`);
    
    if (validation.required && !validation.valid) {
      allValid = false;
      criticalIssues++;
    }

    if (!validation.valid) {
      console.log(`   Issue: ${getValidationMessage(validation)}`);
    }
    
    console.log('');
  });

  // Summary
  console.log('='.repeat(50));
  
  if (allValid) {
    console.log('✅ ALL ENVIRONMENT VARIABLES VALID');
    console.log('✅ Test environment ready for execution');
  } else {
    console.log(`❌ ${criticalIssues} CRITICAL ENVIRONMENT ISSUES FOUND`);
    console.log('❌ Fix these issues before running tests');
  }
  
  // Database safety verification
  console.log('\n🛡️ Database Safety Check:');
  if (process.env.MONGODB_TEST_URI?.includes('spf_test') && 
      process.env.MONGODB_URI?.includes('spf_test')) {
    console.log('✅ Both database connections target SPF_TEST');
    console.log('✅ Your "test" database is protected');
  } else {
    console.log('❌ Database targeting misconfigured');
    allValid = false;
  }

  return allValid;
}

function getValidationMessage(validation: EnvironmentValidation): string {
  if (!validation.value) {
    return 'Variable not set';
  }
  
  switch (validation.variable) {
    case 'MONGODB_TEST_URI':
    case 'MONGODB_URI':
      if (validation.value.includes('YOUR_PASSWORD')) {
        return 'Password placeholder not replaced';
      }
      if (!validation.value.includes('spf_test')) {
        return 'Database name should be "spf_test"';
      }
      return 'Connection string format invalid';
      
    case 'NODE_ENV':
      return 'Should be "test"';
      
    case 'CLIENT_URL':
      return 'Should be "http://localhost:5173"';
      
    case 'SERVER_URL':
      return 'Should be "http://localhost:5000"';
      
    case 'JWT_SECRET':
      return 'Secret too short (minimum 10 characters)';
      
    case 'TEST_TIMEOUT':
      return 'Should be a valid number';
      
    default:
      return 'Invalid value';
  }
}

// Run validation if executed directly
if (require.main === module) {
  validateTestEnvironment();
}