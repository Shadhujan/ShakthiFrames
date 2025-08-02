import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductPage extends BasePage {
  private readonly productCards: Locator;
  private readonly addToCartButtons: Locator;
  private readonly productTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('[data-testid="product-card"]');
    this.addToCartButtons = page.locator('button', { hasText: 'Add to Cart' });
    this.productTitles = page.locator('[data-testid="product-title"]');
  }

  async getProductCount() {
    return await this.productCards.count();
  }

  async addFirstProductToCart() {
    await this.addToCartButtons.first().click();
    await this.waitForPageLoad();
  }

  async getProductTitles() {
    return await this.productTitles.allTextContents();
  }

  async isProductVisible(productName: string) {
    const productTitle = this.page.locator('[data-testid="product-title"]', { hasText: productName });
    return await productTitle.isVisible();
  }
}