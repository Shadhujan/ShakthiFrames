# SPF Ecommerce Test Suite

#test

This directory contains comprehensive end-to-end (E2E) tests for the SPF Ecommerce application using Playwright.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Database Safety](#database-safety)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🎯 Overview

The test suite provides automated testing for:
- **Authentication flows** (login, registration, session management)
- **Product interactions** (browsing, searching, cart functionality)
- **User journeys** (complete purchase flows)
- **Admin functionality** (dashboard, user management)

### Key Features

- ✅ **Database Safety**: Tests use isolated `spf_test` database
- ✅ **User Management**: Automatic cleanup of test users
- ✅ **Parallel Execution**: Optimized for development and CI
- ✅ **Comprehensive Logging**: Detailed test execution logs
- ✅ **Failure Analysis**: Screenshots, videos, and traces on failure

## 🔧 Prerequisites

Before running tests, ensure you have:

- **Node.js** (v16 or higher)
- **MongoDB** connection (local or cloud)
- **Running application servers** (client + server)

### Required Environment

```bash
# Install dependencies
npm install

# Start application servers
cd client && npm run dev  # Runs on http://localhost:5173
cd server && npm run dev  # Runs on http://localhost:5000
```

## ⚙️ Setup

### 1. Environment Configuration

Create a `.env` file in the `tests/` directory:

```bash
# Copy example file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `tests/.env` with your actual values:

```env
# Database Configuration
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/spf_test?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spf_test?retryWrites=true&w=majority

# Application URLs
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Test Configuration
NODE_ENV=test
CI=false
TEST_TIMEOUT=60000

# Optional: Email Configuration
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 3. Install Test Dependencies

```bash
cd tests
npm install
```

## 🚀 Running Tests

### Basic Test Execution

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth/customer-login.spec.ts

# Run with headed browser (visual debugging)
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium-desktop
```

### Advanced Options

```bash
# Run with debug mode
npx playwright test --debug

# Run with retry on failure
npx playwright test --retries=2

# Run with specific timeout
npx playwright test --timeout=120000

# Run with custom reporter
npx playwright test --reporter=html
```

### CI/CD Execution

```bash
# Install browsers for CI
npx playwright install

# Run tests in CI mode
npx playwright test --headed=false --workers=1
```

## 📁 Test Structure

```
tests/
├── e2e/                          # End-to-end test files
│   ├── auth/                     # Authentication tests
│   │   ├── customer-login.spec.ts
│   │   └── customer-registration.spec.ts
│   └── products/                 # Product-related tests
│       ├── cart-functionality.spec.ts
│       └── product-search.spec.ts
├── fixtures/                     # Test data and page objects
│   ├── page-objects/            # Page Object Models
│   │   ├── base-page.ts
│   │   ├── login-page.ts
│   │   └── dashboard-page.ts
│   └── test-data.ts             # Test data factory
├── utils/                        # Test utilities
│   ├── auth-helpers.ts          # Authentication utilities
│   ├── database-helpers.ts      # Database operations
│   └── validate-environment.ts  # Environment validation
├── playwright.config.ts          # Playwright configuration
├── .env.example                 # Environment template
└── .gitignore                   # Git ignore rules
```

## 🛡️ Database Safety

### Safety Features

- **Isolated Database**: All tests use `spf_test` database
- **User Cleanup**: Test users are automatically deleted
- **No Collection Deletion**: Strict rule - never deletes entire collections
- **Dry Run Analysis**: Pre-test analysis of what would be cleaned

### Database Operations

```typescript
// Safe user deletion (only deletes specific test user)
await AuthHelper.deleteUserByEmail('test@example.com');

// Database cleanup (removes test data only)
await DatabaseHelper.cleanup();
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
Error: http://localhost:5000 is already used
```
**Solution**: The config uses `reuseExistingServer: true` - ensure your servers are running.

#### 2. Database Connection Issues
```bash
Error: MongoDB connection failed
```
**Solution**: 
- Verify `MONGODB_TEST_URI` in `.env`
- Ensure database is accessible
- Check network connectivity

#### 3. User Already Exists
```bash
Error: User with this email already exists
```
**Solution**: The test automatically handles this by deleting existing users before registration.

#### 4. Test Timeouts
```bash
Error: Test timed out
```
**Solution**:
- Increase timeout in `playwright.config.ts`
- Check if servers are responding
- Verify network connectivity

### Debug Mode

```bash
# Run with debug mode for step-by-step execution
npx playwright test --debug

# Show test report
npx playwright show-report

# Show trace for failed test
npx playwright show-trace test-results/trace.zip
```

### Environment Validation

```bash
# Validate test environment
node utils/validate-environment.ts
```

## 📊 Test Reports

### HTML Report
```bash
# Open HTML report
npx playwright show-report --host localhost --port 9323
```

### Trace Viewer
```bash
# Open trace for debugging
npx playwright show-trace test-results/trace.zip
```

## 🎯 Best Practices

### Writing Tests

1. **Use Page Objects**: All UI interactions go through page objects
2. **Unique Test Data**: Use `TestDataFactory` for unique test data
3. **Proper Cleanup**: Always clean up test users after tests
4. **Comprehensive Logging**: Use console.log for debugging
5. **Flexible Assertions**: Handle multiple success scenarios

### Test Structure

```typescript
test('Test Description', async ({ page }) => {
  // 1. Setup
  const testUser = TestDataFactory.getValidUser();
  await AuthHelper.registerUserViaAPI(testUser);
  
  // 2. Action
  await loginPage.goto();
  await loginPage.loginUser(testUser.email, testUser.password);
  
  // 3. Verification
  expect(await page.url()).toContain('/dashboard');
  
  // 4. Cleanup
  await AuthHelper.deleteUserByEmail(testUser.email);
});
```

### Environment Variables

- **Required**: `MONGODB_TEST_URI`, `CLIENT_URL`, `SERVER_URL`
- **Optional**: `JWT_SECRET`, `SMTP_USER`, `SMTP_PASS`
- **Development**: `NODE_ENV=test`, `CI=false`

## 🔧 Configuration Files

### playwright.config.ts
- Browser configuration
- Server startup settings
- Timeout configurations
- Reporter settings

### .env
- Database connections
- Application URLs
- Test environment variables

### .gitignore
- Test artifacts (screenshots, videos, traces)
- Environment files
- Build outputs

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test --headed=false
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: tests/playwright-report/
```

## 🤝 Contributing

1. **Follow Test Structure**: Use existing patterns
2. **Add Page Objects**: For new UI components
3. **Update Documentation**: Keep README current
4. **Test Locally**: Verify before committing
5. **Use Descriptive Names**: Clear test and variable names

## 📞 Support

For test-related issues:
1. Check the troubleshooting section
2. Review test logs for detailed error messages
3. Use debug mode for step-by-step analysis
4. Check environment validation

---

**Last Updated**: December 2024  
**Test Framework**: Playwright  
**Database**: MongoDB (SPF_TEST)  
**Environment**: Node.js + TypeScript 
