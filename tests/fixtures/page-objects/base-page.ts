// tests/fixtures/page-objects/base-page.ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Enhanced page load waiting with fallback strategies
   * Handles React dev environment network activity gracefully
   */
  async waitForPageLoad(options: { 
    timeout?: number; 
    strict?: boolean; 
    skipNetworkIdle?: boolean 
  } = {}) {
    const { timeout = 30000, strict = false, skipNetworkIdle = false } = options;
    
    try {
      // Always wait for DOM to be ready
      await this.page.waitForLoadState('domcontentloaded', { timeout });
      console.log('✅ DOM content loaded');
      
      if (!skipNetworkIdle) {
        try {
          // Try networkidle with shorter timeout
          await this.page.waitForLoadState('networkidle', { timeout: 5000 });
          console.log('✅ Network idle achieved');
        } catch (networkError) {
          console.log('⚠️ Network still active, continuing...');
          
          if (strict) {
            throw networkError;
          }
          // In non-strict mode, continue with a small delay
          await this.page.waitForTimeout(1000);
        }
      }
      
      // Additional stability wait for React rendering
      await this.page.waitForTimeout(500);
      console.log('✅ Page load complete');
      
    } catch (error) {
      console.error('❌ Page load timeout:', error);
      if (strict) {
        throw error;
      }
      // Log current state for debugging
      console.log('📋 Current URL:', this.page.url());
      console.log('📋 Page title:', await this.page.title().catch(() => 'Unknown'));
    }
  }

  /**
   * Enhanced navigation with retry logic and flexible waiting
   */
  async navigateTo(url: string, options: {
    waitForLoad?: boolean;
    timeout?: number;
    retries?: number;
  } = {}) {
    const { 
      waitForLoad = true, 
      timeout = 30000, 
      retries = 2 
    } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        console.log(`🔗 Navigation attempt ${attempt}: ${url}`);
        
        await this.page.goto(url, { 
          timeout,
          waitUntil: 'domcontentloaded' // Less strict than networkidle
        });
        
        if (waitForLoad) {
          await this.waitForPageLoad({ 
            timeout: 15000, 
            strict: false,
            skipNetworkIdle: attempt > 1 // Skip on retry
          });
        }
        
        console.log(`✅ Navigation successful on attempt ${attempt}`);
        return; // Success, exit retry loop
        
      } catch (error) {
        lastError = error as Error;
        console.log(`❌ Navigation attempt ${attempt} failed:`, error);
        
        if (attempt <= retries) {
          console.log(`🔄 Retrying in 2 seconds...`);
          await this.page.waitForTimeout(2000);
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError;
  }

  /**
   * Wait for element to be truly interactive (visible + enabled + stable)
   */
  async waitForElementReady(selector: string, options: {
    timeout?: number;
    state?: 'visible' | 'attached' | 'detached' | 'hidden';
  } = {}) {
    const { timeout = 10000, state = 'visible' } = options;
    
    try {
      const locator = this.page.locator(selector);
      
      // Wait for element to be in desired state
      await locator.waitFor({ state, timeout });
      
      // Additional checks for interactive elements
      if (state === 'visible') {
        // Wait for element to be enabled (not disabled)
        await this.page.waitForFunction(
          (sel) => {
            const element = document.querySelector(sel) as HTMLElement;
            return element && 
                   !element.hasAttribute('disabled') && 
                   !element.hasAttribute('aria-disabled') &&
                   element.offsetParent !== null; // Actually visible
          },
          selector,
          { timeout: 5000 }
        );
      }
      
      console.log(`✅ Element ready: ${selector}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Element not ready: ${selector}`, error);
      return false;
    }
  }

  /**
   * Safe element interaction with retry logic
   */
  async safeClick(selector: string, options: {
    timeout?: number;
    retries?: number;
    force?: boolean;
  } = {}) {
    const { timeout = 10000, retries = 2, force = false } = options;
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        console.log(`🔘 Click attempt ${attempt}: ${selector}`);
        
        // Wait for element to be ready
        await this.waitForElementReady(selector, { timeout: timeout / 2 });
        
        // Perform the click
        const locator = this.page.locator(selector);
        await locator.click({ force, timeout: timeout / 2 });
        
        console.log(`✅ Click successful on attempt ${attempt}`);
        return;
        
      } catch (error) {
        console.log(`❌ Click attempt ${attempt} failed:`, error);
        
        if (attempt <= retries) {
          await this.page.waitForTimeout(1000);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Get current page state for debugging
   */
  async getPageState() {
    return {
      url: this.page.url(),
      title: await this.page.title().catch(() => 'Unknown'),
      readyState: await this.page.evaluate(() => document.readyState),
      timestamp: new Date().toISOString()
    };
  }
}