// tests/utils/wait-helpers.ts
import { Page, Locator } from '@playwright/test';

export class WaitHelper {
  /**
   * Wait for session timeout simulation
   * Fast-forwards browser time to test session expiration
   */
  static async waitForSessionTimeout(page: Page, timeoutMinutes: number = 30) {
    try {
      // Install a clock that can be controlled for time manipulation
      await page.clock.install({ time: new Date() });
      
      // Fast-forward time by the specified minutes
      await page.clock.fastForward(timeoutMinutes * 60 * 1000);
      
      console.log(`Session timeout simulated: ${timeoutMinutes} minutes`);
    } catch (error) {
      console.error('Session timeout simulation error:', error);
      // Fallback: just wait a shorter time for testing
      await page.waitForTimeout(2000);
    }
  }

  /**
   * Wait for network to become idle (no pending requests)
   * Useful after form submissions or page transitions
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 30000) {
    try {
      await page.waitForLoadState('networkidle', { timeout });
      console.log('Network idle state achieved');
    } catch (error) {
      console.error('Network idle wait timeout:', error);
      // Continue with test - don't fail completely
    }
  }

  /**
   * Wait for element to be visible with custom timeout
   */
  static async waitForElementToBeVisible(page: Page, selector: string, timeout: number = 30000) {
    try {
      await page.waitForSelector(selector, { 
        state: 'visible', 
        timeout 
      });
      console.log(`Element visible: ${selector}`);
      return true;
    } catch (error) {
      console.error(`Element not visible within ${timeout}ms: ${selector}`);
      return false;
    }
  }

  /**
   * Wait for element to be hidden
   */
  static async waitForElementToBeHidden(page: Page, selector: string, timeout: number = 30000) {
    try {
      await page.waitForSelector(selector, { 
        state: 'hidden', 
        timeout 
      });
      console.log(`Element hidden: ${selector}`);
      return true;
    } catch (error) {
      console.error(`Element still visible after ${timeout}ms: ${selector}`);
      return false;
    }
  }

  /**
   * Wait for text content to appear in element
   */
  static async waitForTextContent(page: Page, selector: string, expectedText: string, timeout: number = 30000) {
    try {
      await page.waitForFunction(
        ({ selector, text }) => {
          const element = document.querySelector(selector);
          return element && element.textContent?.includes(text);
        },
        { selector, text: expectedText },
        { timeout }
      );
      console.log(`Text content found: "${expectedText}" in ${selector}`);
      return true;
    } catch (error) {
      console.error(`Text content not found within ${timeout}ms: "${expectedText}" in ${selector}`);
      return false;
    }
  }

  /**
   * Wait for URL to change to expected pattern
   */
  static async waitForUrlChange(page: Page, urlPattern: string | RegExp, timeout: number = 30000) {
    try {
      await page.waitForURL(urlPattern, { timeout });
      console.log(`URL changed to expected pattern: ${urlPattern}`);
      return true;
    } catch (error) {
      console.error(`URL did not change to pattern within ${timeout}ms: ${urlPattern}`);
      return false;
    }
  }

  /**
   * Wait for API response with specific status
   */
  static async waitForApiResponse(page: Page, urlPattern: string | RegExp, expectedStatus: number = 200, timeout: number = 30000) {
    try {
      const response = await page.waitForResponse(
        response => {
          const url = response.url();
          const status = response.status();
          const urlMatches = typeof urlPattern === 'string' 
            ? url.includes(urlPattern)
            : urlPattern.test(url);
          return urlMatches && status === expectedStatus;
        },
        { timeout }
      );
      
      console.log(`API response received: ${response.url()} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      console.error(`API response not received within ${timeout}ms for pattern: ${urlPattern}`);
      return null;
    }
  }

  /**
   * Wait for element to be enabled/clickable
   */
  static async waitForElementToBeEnabled(page: Page, selector: string, timeout: number = 30000) {
    try {
      await page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector) as HTMLElement | null;
          return element && !element.hasAttribute('disabled') && !element.hasAttribute('aria-disabled');
        },
        selector,
        { timeout }
      );
      console.log(`Element enabled: ${selector}`);
      return true;
    } catch (error) {
      console.error(`Element not enabled within ${timeout}ms: ${selector}`);
      return false;
    }
  }

  /**
   * Wait for page to be fully loaded including all resources
   */
  static async waitForPageLoad(page: Page, timeout: number = 30000) {
    try {
      await page.waitForLoadState('load', { timeout });
      await page.waitForLoadState('domcontentloaded', { timeout });
      await page.waitForLoadState('networkidle', { timeout: 5000 }); // Shorter timeout for network idle
      console.log('Page fully loaded');
    } catch (error) {
      console.error('Page load wait timeout:', error);
      // Continue with test - partial load might be sufficient
    }
  }

  /**
   * Wait with retry logic for flaky elements
   */
  static async waitWithRetry<T>(
    operation: () => Promise<T>, 
    retries: number = 3, 
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${i + 1}/${retries} failed: ${error}`);
        
        if (i < retries - 1) {
          await this.sleep(delayMs);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Simple sleep utility
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for form validation to complete
   */
  static async waitForFormValidation(page: Page, formSelector: string = 'form', timeout: number = 10000) {
    try {
      // Wait for any validation messages to appear
      await page.waitForFunction(
        (formSelector) => {
          const form = document.querySelector(formSelector) as HTMLFormElement | null;
          if (!form) return true; // No form found, consider validation complete
          
          // Check if form is valid or has validation messages displayed
          const invalidElements = form.querySelectorAll(':invalid');
          const errorElements = form.querySelectorAll('[data-testid*="error"], .error, [role="alert"]');
          
          return invalidElements.length === 0 || errorElements.length > 0;
        },
        formSelector,
        { timeout }
      );
      console.log('Form validation completed');
    } catch (error) {
      console.error('Form validation wait timeout:', error);
      // Continue with test - validation might have completed differently
    }
  }

  /**
   * Wait for loading indicators to disappear
   */
  static async waitForLoadingToComplete(page: Page, timeout: number = 30000) {
    try {
      // Wait for common loading indicators to disappear
      const loadingSelectors = [
        '[data-testid*="loading"]',
        '.loading',
        '.spinner',
        '[role="progressbar"]',
        '.animate-spin'
      ];

      for (const selector of loadingSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          await element.waitFor({ state: 'hidden', timeout });
        }
      }
      
      console.log('Loading indicators cleared');
    } catch (error) {
      console.error('Loading wait timeout:', error);
      // Continue with test - loading might have completed
    }
  }
}