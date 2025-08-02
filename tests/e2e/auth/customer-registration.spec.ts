import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../fixtures/page-objects/registration-page';
import { LoginPage } from '../../fixtures/page-objects/login-page';
import { TestDataFactory } from '../../fixtures/test-data';
import { DatabaseHelper } from '../../utils/database-helpers';

test.describe('Customer Registration', () => {
  let registrationPage: RegistrationPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await DatabaseHelper.connect();
    await DatabaseHelper.cleanup();
    
    registrationPage = new RegistrationPage(page);
    loginPage = new LoginPage(page);
  });

  test.afterEach(async () => {
    await DatabaseHelper.cleanup();
  });

  test('TC_CUST_REG_01: Verify successful customer registration with valid data', async ({ page }) => {
    // Test Data
    const testUser = TestDataFactory.getValidUser();

    // Test Steps
    // 1. Navigate to registration page
    await registrationPage.goto();

    // 2. Enter valid details (name, email, password)
    await registrationPage.fillRegistrationForm(
      testUser.name,
      testUser.email,
      testUser.password
    );

    // 3. Click "Register"
    await registrationPage.submitRegistration();

    // Expected Result: Account created successfully, redirect to login page
    await expect(page).toHaveURL(/.*login/);
    
    // Verify success message or successful redirect
    const isOnLoginPage = page.url().includes('/login');
    expect(isOnLoginPage).toBeTruthy();
    
    // Additional verification: Try to login with the created account
    await loginPage.loginUser(testUser.email, testUser.password);
    await expect(page).toHaveURL(/.*dashboard|.*home/);
  });

  test('TC_CUST_REG_02: Verify registration fails with invalid email format', async ({ page }) => {
    // Test Data
    const invalidUser = TestDataFactory.getInvalidEmailUser();

    // Test Steps
    // 1. Navigate to registration page
    await registrationPage.goto();

    // 2. Enter invalid email (missing @)
    await registrationPage.fillRegistrationForm(
      invalidUser.name,
      invalidUser.email,
      invalidUser.password
    );

    // 3. Click "Register"
    await registrationPage.submitRegistration();

    // Expected Result: Error message: "Please enter a valid email address"
    const errorMessage = await registrationPage.getErrorMessage();
    expect(errorMessage).toContain('Please enter a valid email address');
    
    // Verify still on registration page
    await expect(page).toHaveURL(/.*register/);
  });
});
