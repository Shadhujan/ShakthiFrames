// tests/fixtures/page-objects/login-page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('[data-testid="email-input"]').or(page.locator('input[name="email"]'));
    this.passwordInput = page.locator('[data-testid="password-input"]').or(page.locator('input[name="password"]'));
    this.loginButton = page.locator('[data-testid="login-button"]').or(page.locator('button[type="submit"]'));
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    console.log('🔗 Navigating to login page: /auth/login');
    await this.navigateTo('/auth/login');
    
    // Wait for page to load completely
    await this.page.waitForURL('**/auth/login', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
    
    // Wait for form elements to be ready
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Login page loaded and form elements ready');
  }

  async fillLoginForm(email: string, password: string) {
    console.log(`📝 Filling login form - Email: ${email}`);
    
    // Clear fields first
    await this.emailInput.clear();
    await this.passwordInput.clear();
    
    // Fill with controlled typing (slower, more human-like)
    await this.emailInput.type(email, { delay: 100 }); // 100ms delay between characters
    await this.page.waitForTimeout(500); // Pause between fields
    
    await this.passwordInput.type(password, { delay: 100 });
    await this.page.waitForTimeout(500);
    
    // Verify fields are filled correctly
    const emailValue = await this.emailInput.inputValue();
    const passwordValue = await this.passwordInput.inputValue();
    
    console.log(`📋 Email field value: "${emailValue}"`);
    console.log(`📋 Password field length: ${passwordValue.length} characters`);
    
    if (emailValue !== email) {
      throw new Error(`Email field mismatch. Expected: ${email}, Got: ${emailValue}`);
    }
    
    console.log('✅ Login form filled and verified');
  }

  async submitLogin() {
    console.log('🔘 Clicking login button');
    
    // Ensure button is ready for interaction
    await this.loginButton.waitFor({ state: 'visible' });
    
    // Click and wait for navigation or error
    await this.loginButton.click();
    console.log('✅ Login button clicked');
    
    // Wait for response (either redirect or error)
    console.log('⏳ Waiting for login response...');
    
    try {
      // Wait for successful redirect (adjust URL pattern as needed)
      await this.page.waitForURL(url => {
        return url.href === 'http://localhost:5173/' || 
               url.href.startsWith('http://localhost:5173/home') ||
               url.href.startsWith('http://localhost:5173/dashboard');
      }, { timeout: 15000 });
      
      console.log('✅ Login successful - redirected to:', this.page.url());
      
    } catch (redirectTimeout) {
      // Check if we're still on login page with error
      const currentUrl = this.page.url();
      console.log('📋 Current URL after login attempt:', currentUrl);
      
      if (currentUrl.includes('/auth/login')) {
        // Still on login page - check for error message
        const errorVisible = await this.errorMessage.isVisible({ timeout: 3000 });
        if (errorVisible) {
          const errorText = await this.errorMessage.textContent();
          console.log('❌ Login failed with error:', errorText);
          throw new Error(`Login failed: ${errorText}`);
        } else {
          console.log('⚠️ Still on login page but no error message visible');
          throw new Error('Login did not complete - no redirect or error message');
        }
      } else {
        console.log('⚠️ Unexpected page after login:', currentUrl);
        throw new Error(`Unexpected redirect to: ${currentUrl}`);
      }
    }
  }

  async getErrorMessage() {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  async loginUser(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitLogin();
  }
}