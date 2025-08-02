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
    // Enhanced selector strategy with multiple fallbacks
    this.emailInput = this.page.locator('[data-testid="email-input"]')
      .or(this.page.locator('input[name="email"]'))
      .or(this.page.locator('input[type="email"]'))
      .or(this.page.locator('input[placeholder*="email" i]'));
      
    this.passwordInput = this.page.locator('[data-testid="password-input"]')
      .or(this.page.locator('input[name="password"]'))
      .or(this.page.locator('input[type="password"]'));
      
    this.loginButton = this.page.locator('[data-testid="login-button"]')
      .or(this.page.locator('button[type="submit"]'))
      .or(this.page.locator('button:has-text("Login")'))
      .or(this.page.locator('button:has-text("Sign In")'));
      
    this.errorMessage = this.page.locator('[data-testid="error-message"]')
      .or(this.page.locator('.error-message'))
      .or(this.page.locator('[role="alert"]'))
      .or(this.page.locator('.alert-error'));
  }

  /**
   * Enhanced navigation with React-specific handling
   */
  async goto(options: { retries?: number; timeout?: number } = {}) {
    const { retries = 2, timeout = 30000 } = options;
    
    console.log('🔗 Navigating to login page: /auth/login');
    
    try {
      await this.navigateTo('/auth/login', { 
        retries, 
        timeout,
        waitForLoad: true 
      });
      
      // Wait for URL to match expected pattern
      await this.page.waitForURL('**/auth/login', { timeout: 10000 });
      
      // Ensure form elements are available and ready
      await this.waitForFormReady();
      
      console.log('✅ Login page loaded and form elements ready');
      
    } catch (error) {
      console.error('❌ Failed to load login page:', error);
      
      // Capture debug information
      const state = await this.getPageState();
      console.log('📋 Page state on failure:', state);
      
      throw error;
    }
  }

  /**
   * Wait for form elements to be fully ready for interaction
   */
  private async waitForFormReady(timeout: number = 15000) {
    console.log('⏳ Waiting for form elements to be ready...');
    
    const startTime = Date.now();
    
    // Wait for all form elements to be visible and enabled
    const elements = [
      { locator: this.emailInput, name: 'email input' },
      { locator: this.passwordInput, name: 'password input' },
      { locator: this.loginButton, name: 'login button' }
    ];
    
    for (const { locator, name } of elements) {
      try {
        await locator.waitFor({ 
          state: 'visible', 
          timeout: Math.max(1000, timeout - (Date.now() - startTime))
        });
        
        // Additional check for input readiness
        if (name.includes('input')) {
          await locator.waitFor({ 
            state: 'attached', 
            timeout: 2000 
          });
        }
        
        console.log(`✅ ${name} ready`);
        
      } catch (error) {
        console.error(`❌ ${name} not ready:`, error);
        throw new Error(`Form element not ready: ${name}`);
      }
    }
    
    // Small delay for React state stabilization
    await this.page.waitForTimeout(500);
    console.log('✅ All form elements ready');
  }

  /**
   * Enhanced form filling with reliability improvements
   */
  async fillLoginForm(email: string, password: string, options: {
    clearFirst?: boolean;
    typing?: 'fast' | 'normal' | 'slow';
    verify?: boolean;
  } = {}) {
    const { 
      clearFirst = true, 
      typing = 'normal', 
      verify = true 
    } = options;
    
    console.log(`📝 Filling login form - Email: ${email}`);
    
    // Determine typing speed
    const delays = {
      fast: 50,
      normal: 100,
      slow: 200
    };
    const typingDelay = delays[typing];
    
    try {
      // Clear fields first if requested
      if (clearFirst) {
        console.log('🧹 Clearing form fields...');
        await this.emailInput.clear();
        await this.passwordInput.clear();
        await this.page.waitForTimeout(300);
      }
      
      // Fill email field with enhanced reliability
      console.log('📧 Filling email field...');
      await this.fillInputWithRetry(this.emailInput, email, {
        typingDelay,
        retries: 2,
        verify
      });
      
      // Short pause between fields
      await this.page.waitForTimeout(500);
      
      // Fill password field
      console.log('🔒 Filling password field...');
      await this.fillInputWithRetry(this.passwordInput, password, {
        typingDelay,
        retries: 2,
        verify: false // Don't log password values
      });
      
      // Final pause for form stabilization
      await this.page.waitForTimeout(500);
      
      if (verify) {
        // Verify email field (password verification skipped for security)
        const emailValue = await this.emailInput.inputValue();
        if (emailValue !== email) {
          throw new Error(`Email field verification failed. Expected: ${email}, Got: ${emailValue}`);
        }
        console.log('✅ Email field verified successfully');
      }
      
      console.log('✅ Login form filled successfully');
      
    } catch (error) {
      console.error('❌ Form filling failed:', error);
      
      // Debug information
      try {
        const emailValue = await this.emailInput.inputValue();
        const passwordLength = (await this.passwordInput.inputValue()).length;
        console.log(`📋 Current field values - Email: "${emailValue}", Password length: ${passwordLength}`);
      } catch (debugError) {
        console.log('📋 Could not retrieve field values for debugging');
      }
      
      throw error;
    }
  }

  /**
   * Reliable input filling with retry logic
   */
  private async fillInputWithRetry(
    locator: Locator, 
    value: string, 
    options: {
      typingDelay?: number;
      retries?: number;
      verify?: boolean;
    } = {}
  ) {
    const { typingDelay = 100, retries = 2, verify = true } = options;
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        // Ensure field is ready
        await locator.waitFor({ state: 'visible' });
        await locator.click(); // Focus the field
        
        // Clear and fill
        await locator.clear();
        await this.page.waitForTimeout(200);
        
        // Use fill() for better reliability in React apps
        await locator.fill(value);
        
        // Verify if requested
        if (verify) {
          const currentValue = await locator.inputValue();
          if (currentValue === value) {
            return; // Success
          } else {
            throw new Error(`Value mismatch. Expected: ${value}, Got: ${currentValue}`);
          }
        } else {
          return; // Success without verification
        }
        
      } catch (error) {
        if (attempt <= retries) {
          console.log(`⚠️ Input attempt ${attempt} failed, retrying...`);
          await this.page.waitForTimeout(1000);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Enhanced login submission with comprehensive response handling
   */
  async submitLogin(options: {
    timeout?: number;
    expectedSuccessUrls?: string[];
  } = {}) {
    const { 
      timeout = 20000,
      expectedSuccessUrls = [
        'http://localhost:5173/',
        'http://localhost:5173/home',
        'http://localhost:5173/dashboard'
      ]
    } = options;
    
    console.log('🔘 Submitting login form...');
    
    try {
      // Ensure button is ready and click
      await this.waitForElementReady(this.loginButton.first().toString());
      await this.loginButton.click();
      console.log('✅ Login button clicked');
      
      // Wait for response with multiple possible outcomes
      console.log('⏳ Waiting for login response...');
      
      // Set up response monitoring
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/api') && 
                   (response.url().includes('/auth') || response.url().includes('/login')),
        { timeout: timeout / 2 }
      ).catch(() => null);
      
      try {
        // Wait for successful redirect
        await this.page.waitForURL(url => {
          const currentUrl = url.href;
          return expectedSuccessUrls.some(successUrl => 
            currentUrl === successUrl || currentUrl.startsWith(successUrl)
          );
        }, { timeout });
        
        console.log('✅ Login successful - redirected to:', this.page.url());
        
        // Wait for response to complete
        await responsePromise;
        
      } catch (redirectTimeout) {
        // Handle login failure or unexpected behavior
        await this.handleLoginFailure(expectedSuccessUrls, responsePromise);
      }
      
    } catch (error) {
      console.error('❌ Login submission failed:', error);
      
      // Capture state for debugging
      const state = await this.getPageState();
      console.log('📋 Page state on submission failure:', state);
      
      throw error;
    }
  }

  /**
   * Handle login failure scenarios
   */
  private async handleLoginFailure(
    expectedSuccessUrls: string[], 
    responsePromise: Promise<any>
  ) {
    const currentUrl = this.page.url();
    console.log('📋 Analyzing login result - Current URL:', currentUrl);
    
    // Check if we're still on login page (likely failure)
    if (currentUrl.includes('/auth/login')) {
      console.log('⚠️ Still on login page - checking for error message...');
      
      try {
        // Wait briefly for error message to appear
        const errorVisible = await this.errorMessage.isVisible({ timeout: 3000 });
        
        if (errorVisible) {
          const errorText = await this.errorMessage.textContent();
          console.log('❌ Login failed with error:', errorText);
          throw new Error(`Login failed: ${errorText}`);
        } else {
          console.log('⚠️ No error message visible');
          
          // Check API response for more details
          const response = await responsePromise;
          if (response) {
            const status = response.status();
            console.log('📡 API response status:', status);
            
            if (status >= 400) {
              const responseText = await response.text().catch(() => 'Unknown error');
              throw new Error(`Login failed with status ${status}: ${responseText}`);
            }
          }
          
          throw new Error('Login did not complete - no redirect or error message');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Login failed')) {
          throw error;
        }
        throw new Error('Login verification failed - unable to determine outcome');
      }
    } else {
      // Unexpected redirect
      console.log('⚠️ Unexpected page after login:', currentUrl);
      throw new Error(`Unexpected redirect to: ${currentUrl}`);
    }
  }

  /**
   * Get error message if visible
   */
  async getErrorMessage(timeout: number = 5000): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Complete login flow (fill + submit)
   */
  async loginUser(email: string, password: string, options: {
    fillOptions?: { clearFirst?: boolean; typing?: 'fast' | 'normal' | 'slow'; verify?: boolean };
    submitOptions?: { timeout?: number; expectedSuccessUrls?: string[] };
  } = {}) {
    await this.fillLoginForm(email, password, options.fillOptions);
    await this.submitLogin(options.submitOptions);
  }

  /**
   * Check if currently on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    const currentUrl = this.page.url();
    return currentUrl.includes('/auth/login');
  }
}