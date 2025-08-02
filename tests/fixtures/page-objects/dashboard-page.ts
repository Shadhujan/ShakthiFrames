import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  private readonly logoutButton: Locator;
  private readonly userMenu: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.locator('button', { hasText: 'Logout' });
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.searchButton = page.locator('button', { hasText: 'Search' });
  }

  async goto() {
    await this.navigateTo('/');
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
    await this.waitForPageLoad();
  }

  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async isLoggedIn() {
    return await this.userMenu.isVisible();
  }
}