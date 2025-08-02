import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class RegistrationPage extends BasePage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly registerButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('input[name="name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.registerButton = page.locator('button[type="submit"]', { hasText: 'Register' });
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  async goto() {
    await this.navigateTo('/auth/register');
  }

  async fillRegistrationForm(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitRegistration() {
    await this.registerButton.click();
    await this.waitForPageLoad();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async isSuccessMessageVisible() {
    return await this.successMessage.isVisible();
  }

  async registerUser(name: string, email: string, password: string) {
    await this.fillRegistrationForm(name, email, password);
    await this.submitRegistration();
  }
}