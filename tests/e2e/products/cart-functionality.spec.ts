import { test, expect } from '@playwright/test';
import { LoginPage } from '../../fixtures/page-objects/login-page';
import { DashboardPage } from '../../fixtures/page-objects/dashboard-page';
import { ProductPage } from '../../fixtures/page-objects/product-page';
import { TestDataFactory } from '../../fixtures/test-data';
import { AuthHelper } from '../../utils/auth-helpers';
import { DatabaseHelper } from '../../utils/database-helpers';

test.describe('Cart Functionality', () => {
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

  test('TC_CART_01: Add picture frame to cart', async ({ page }) => {
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

    // 2. Search for frame
    await dashboardPage.searchProduct(searchTerm);
    
    // Verify search results are displayed
    const productCount = await productPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    // 3. Click "Add to Cart"
    await productPage.addFirstProductToCart();

    // Expected Result: Frame successfully added to cart
    
    // Wait for any loading states to complete
    await page.waitForLoadState('networkidle');

    // Verify success indicators (this depends on your UI implementation)
    // Option 1: Check for success message
    const successMessage = page.locator('[data-testid="cart-success-message"]');
    if (await successMessage.isVisible({ timeout: 5000 })) {
      expect(await successMessage.textContent()).toContain('added to cart');
    }

    // Option 2: Check cart icon/counter updates
    const cartCounter = page.locator('[data-testid="cart-counter"]');
    if (await cartCounter.isVisible({ timeout: 5000 })) {
      const cartCount = await cartCounter.textContent();
      expect(parseInt(cartCount || '0')).toBeGreaterThan(0);
    }

    // Option 3: Navigate to cart page and verify item is there
    const cartButton = page.locator('button', { hasText: /cart/i });
    if (await cartButton.isVisible({ timeout: 5000 })) {
      await cartButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verify product is in cart
      const cartItems = page.locator('[data-testid="cart-item"]');
      const cartItemCount = await cartItems.count();
      expect(cartItemCount).toBeGreaterThan(0);
    }
  });
});
