import { test, expect } from '@playwright/test';
import { LoginPage } from '../../fixtures/page-objects/login-page';
import { DashboardPage } from '../../fixtures/page-objects/dashboard-page';
import { TestDataFactory } from '../../fixtures/test-data';
import { AuthHelper } from '../../utils/auth-helpers';
import { WaitHelper } from '../../utils/wait-helpers';
import { DatabaseHelper } from '../../utils/database-helpers';

test.describe('Session Management', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    await DatabaseHelper.connect();
    await DatabaseHelper.cleanup();
    
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test.afterEach(async () => {
    await DatabaseHelper.cleanup();
  });

  test('TC_CUST_LOGOUT_01: Verify successful logout', async ({ page }) => {
    // Setup: Create and login user
    const testUser = TestDataFactory.generateUser();
    await AuthHelper.createAndLoginUser(page, testUser);

    // Verify user is logged in
    await dashboardPage.goto();
    const isLoggedInBefore = await dashboardPage.isLoggedIn();
    expect(isLoggedInBefore).toBeTruthy();

    // Test Steps
    // 1. Login successfully (already done in setup)
    // 2. Click "Logout"
    await dashboardPage.logout();

    // Expected Result: Session terminated, redirected to login page
    await expect(page).toHaveURL(/.*login/);
    
    // Additional verification: Try to access protected page
    await dashboardPage.goto();
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC_CUST_SESSION_01: Verify session expires after 30 mins inactivity', async ({ page }) => {
    // Note: This test simulates session timeout - in production you might need different approach
    
    // Setup: Create and login user
    const testUser = TestDataFactory.generateUser();
    await AuthHelper.createAndLoginUser(page, testUser);

    // Test Steps
    // 1. Login successfully (already done in setup)
    await dashboardPage.goto();
    const isLoggedInBefore = await dashboardPage.isLoggedIn();
    expect(isLoggedInBefore).toBeTruthy();

    // 2. Wait 30 mins (simulated with fast-forward)
    await WaitHelper.waitForSessionTimeout(page, 30);

    // 3. Refresh dashboard
    await page.reload();
    await WaitHelper.waitForNetworkIdle(page);

    // Expected Result: Automatic logout, redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });
});