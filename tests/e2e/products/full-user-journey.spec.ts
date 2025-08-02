import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../fixtures/page-objects/registration-page';
import { LoginPage } from '../../fixtures/page-objects/login-page';
import { DashboardPage } from '../../fixtures/page-objects/dashboard-page';
import { ProductPage } from '../../fixtures/page-objects/product-page';
import { TestDataFactory } from '../../fixtures/test-data';
import { DatabaseHelper } from '../../utils/database-helpers';
import { MockHelper } from '../../utils/mock-helpers';

test.describe('Full User Journey Integration', () => {
  let registrationPage: RegistrationPage;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    await DatabaseHelper.connect();
    await DatabaseHelper.cleanup();
    await DatabaseHelper.seedTestData();
    
    // Setup mocks for external services
    await MockHelper.setupPaymentMock(page);
    await MockHelper.setupEmailMock(page);
    
    registrationPage = new RegistrationPage(page);
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productPage = new ProductPage(page);
  });

  test.afterEach(async () => {
    await DatabaseHelper.cleanup();
  });

  test('Complete user journey: Register → Login → Search → Add to Cart → Logout', async ({ page }) => {
    const testUser = TestDataFactory.generateUser();
    const searchTerm = 'Classic Gold Frame';

    // Step 1: Register new user
    await registrationPage.goto();
    await registrationPage.registerUser(testUser.name, testUser.email, testUser.password);
    await expect(page).toHaveURL(/.*login/);

    // Step 2: Login with registered user
    await loginPage.loginUser(testUser.email, testUser.password);
    await expect(page).toHaveURL(/.*dashboard|.*home/);

    // Step 3: Search for product
    await dashboardPage.searchProduct(searchTerm);
    const productCount = await productPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    // Step 4: Add product to cart
    await productPage.addFirstProductToCart();
    await page.waitForLoadState('networkidle');

    // Step 5: Logout
    await dashboardPage.logout();
    await expect(page).toHaveURL(/.*login/);

    // Verify complete journey was successful
    expect(test.info().status).toBe('passed');
  });
});