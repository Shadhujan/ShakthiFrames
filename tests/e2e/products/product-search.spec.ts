import { test, expect } from '@playwright/test';
import { LoginPage } from '../../fixtures/page-objects/login-page';
import { DashboardPage } from '../../fixtures/page-objects/dashboard-page';
import { ProductPage } from '../../fixtures/page-objects/product-page';
import { TestDataFactory } from '../../fixtures/test-data';
import { AuthHelper } from '../../utils/auth-helpers';
import { DatabaseHelper } from '../../utils/database-helpers';

test.describe('Product Search', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    await DatabaseHelper.connect();
    await DatabaseHelper.cleanup();
    await DatabaseHelper.seedTestData();
    
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productPage = new ProductPage(page);
  });

  test.afterEach(async () => {
    await DatabaseHelper.cleanup();
  });

  test('TC_PROD_SEARCH_01: Verify product search returns relevant framing products', async ({ page }) => {
    // Setup: Create and login user
    const testUser = TestDataFactory.generateUser();
    await AuthHelper.createAndLoginUser(page, testUser);

    // Test Data
    const searchTerm = 'Classic Gold Frame';

    // Test Steps
    // 1. Login as customer (already done in setup)
    await dashboardPage.goto();
    
    // Verify user is logged in
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();

    // 2. Enter product name in search box
    // 3. Click "Search"
    await dashboardPage.searchProduct(searchTerm);

    // Expected Result: Displays all Classic Gold Frame variations with images, prices, and "View Details" options
    
    // Verify search results contain the searched product
    const isProductVisible = await productPage.isProductVisible(searchTerm);
    expect(isProductVisible).toBeTruthy();

    // Verify that products are displayed (at least one product found)
    const productCount = await productPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    // Verify product information is displayed (titles should contain search term)
    const productTitles = await productPage.getProductTitles();
    const hasRelevantResults = productTitles.some(title => 
      title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    expect(hasRelevantResults).toBeTruthy();
  });
});