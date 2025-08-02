// tests/utils/wait-helpers.ts
import { Page, Locator, Response } from '@playwright/test';

export class WaitHelper {
  /**
   * Wait for React application to stabilize after state changes
   * Handles React's asynchronous rendering and state updates
   */
  static async waitForReactStabilization(
    page: Page, 
    options: {
      timeout?: number;
      maxWaitCycles?: number;
      pollInterval?: number;
    } = {}
  ) {
    const { timeout = 10000, maxWaitCycles = 5, pollInterval = 200 } = options;
    const startTime = Date.now();
    
    let stableCount = 0;
    let lastDomState = '';
    
    console.log('⏳ Waiting for React application to stabilize...');
    
    while (Date.now() - startTime < timeout && stableCount < maxWaitCycles) {
      try {
        // Get current DOM state snapshot
        const currentDomState = await page.evaluate(() => {
          return document.body.innerHTML.length + '_' + 
                 document.readyState + '_' + 
                 (window as any).React?.version || 'unknown';
        });
        
        if (currentDomState === lastDomState) {
          stableCount++;
        } else {
          stableCount = 0;
          lastDomState = currentDomState;
        }
        
        await page.waitForTimeout(pollInterval);
        
      } catch (error) {
        console.log('⚠️ React stabilization check error:', error);
        break;
      }
    }
    
    if (stableCount >= maxWaitCycles) {
      console.log('✅ React application stabilized');
    } else {
      console.log('⚠️ React stabilization timeout - continuing anyway');
    }
  }

  /**
   * Enhanced network idle waiting with intelligent fallback
   * Handles development environment network noise
   */
  static async waitForNetworkQuiet(
    page: Page, 
    options: {
      timeout?: number;
      idleDuration?: number;
      maxActiveRequests?: number;
      ignoredUrls?: (string | RegExp)[];
    } = {}
  ) {
    const { 
      timeout = 30000, 
      idleDuration = 2000, 
      maxActiveRequests = 2,
      ignoredUrls = [
        /hot-update/,
        /websocket/,
        /analytics/,
        /__vite_ping/
      ]
    } = options;
    
    const startTime = Date.now();
    let activeRequests = 0;
    let lastActivityTime = Date.now();
    
    console.log('⏳ Waiting for network to become quiet...');
    
    // Track network activity
    const requestTracker = {
      onRequest: (request: any) => {
        const url = request.url();
        const isIgnored = ignoredUrls.some(pattern => 
          typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)
        );
        
        if (!isIgnored) {
          activeRequests++;
          lastActivityTime = Date.now();
        }
      },
      onResponse: (response: any) => {
        const url = response.url();
        const isIgnored = ignoredUrls.some(pattern => 
          typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)
        );
        
        if (!isIgnored) {
          activeRequests = Math.max(0, activeRequests - 1);
          lastActivityTime = Date.now();
        }
      }
    };
    
    page.on('request', requestTracker.onRequest);
    page.on('response', requestTracker.onResponse);
    
    try {
      while (Date.now() - startTime < timeout) {
        const timeSinceLastActivity = Date.now() - lastActivityTime;
        
        if (activeRequests <= maxActiveRequests && timeSinceLastActivity >= idleDuration) {
          console.log('✅ Network is quiet');
          return true;
        }
        
        await page.waitForTimeout(100);
      }
      
      console.log('⚠️ Network quiet timeout - continuing with current state');
      return false;
      
    } finally {
      page.off('request', requestTracker.onRequest);
      page.off('response', requestTracker.onResponse);
    }
  }

  /**
   * Wait for element with multiple validation criteria
   * Ensures element is truly ready for interaction
   */
  static async waitForElementInteractable(
    page: Page, 
    selector: string, 
    options: {
      timeout?: number;
      checkEnabled?: boolean;
      checkVisible?: boolean;
      checkStable?: boolean;
      stableTime?: number;
    } = {}
  ) {
    const { 
      timeout = 15000, 
      checkEnabled = true, 
      checkVisible = true, 
      checkStable = true,
      stableTime = 500
    } = options;
    
    console.log(`⏳ Waiting for element to be interactable: ${selector}`);
    
    const locator = page.locator(selector);
    const startTime = Date.now();
    
    try {
      // Basic visibility check
      if (checkVisible) {
        await locator.waitFor({ 
          state: 'visible', 
          timeout: timeout / 2 
        });
      }
      
      // Enhanced interactability checks
      await page.waitForFunction(
        ({ sel, checkEn, checkVis }) => {
          const element = document.querySelector(sel) as HTMLElement;
          if (!element) return false;
          
          // Visibility checks
          if (checkVis) {
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || 
                style.visibility === 'hidden' || 
                style.opacity === '0' ||
                element.offsetParent === null) {
              return false;
            }
          }
          
          // Enabled checks
          if (checkEn && element.tagName.toLowerCase() !== 'div') {
            if (element.hasAttribute('disabled') || 
                element.hasAttribute('aria-disabled') ||
                element.getAttribute('aria-disabled') === 'true') {
              return false;
            }
          }
          
          // Element must be in viewport (at least partially)
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          
          return true;
        },
        { sel: selector, checkEn: checkEnabled, checkVis: checkVisible },
        { timeout: Math.max(1000, timeout - (Date.now() - startTime)) }
      );
      
      // Stability check - element position shouldn't change
      if (checkStable) {
        let lastPosition = await locator.boundingBox();
        await page.waitForTimeout(stableTime);
        const currentPosition = await locator.boundingBox();
        
        if (lastPosition && currentPosition &&
            (Math.abs(lastPosition.x - currentPosition.x) > 1 ||
             Math.abs(lastPosition.y - currentPosition.y) > 1)) {
          console.log('⚠️ Element position unstable, waiting longer...');
          await page.waitForTimeout(stableTime);
        }
      }
      
      console.log(`✅ Element is interactable: ${selector}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Element not interactable within timeout: ${selector}`, error);
      return false;
    }
  }

  /**
   * Wait for API response with detailed monitoring
   * Provides insights into request/response patterns
   */
  static async waitForApiResponse(
    page: Page,
    options: {
      urlPattern?: string | RegExp;
      method?: string;
      status?: number | number[];
      timeout?: number;
      includeBody?: boolean;
    } = {}
  ) {
    const { 
      urlPattern = /\/api\//,
      method,
      status = [200, 201, 204],
      timeout = 15000,
      includeBody = false
    } = options;
    
    const expectedStatuses = Array.isArray(status) ? status : [status];
    
    console.log(`⏳ Waiting for API response matching pattern: ${urlPattern}`);
    
    try {
      const response = await page.waitForResponse(
        async (response) => {
          const url = response.url();
          const responseStatus = response.status();
          const responseMethod = response.request().method();
          
          // URL pattern match
          const urlMatches = typeof urlPattern === 'string' 
            ? url.includes(urlPattern)
            : urlPattern.test(url);
          
          // Method match (if specified)
          const methodMatches = !method || responseMethod.toLowerCase() === method.toLowerCase();
          
          // Status match
          const statusMatches = expectedStatuses.includes(responseStatus);
          
          const matches = urlMatches && methodMatches && statusMatches;
          
          if (matches) {
            console.log(`✅ API response matched: ${responseMethod} ${url} - ${responseStatus}`);
            
            if (includeBody) {
              try {
                const body = await response.text();
                console.log(`📋 Response body: ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`);
              } catch (bodyError) {
                console.log('📋 Could not read response body');
              }
            }
          }
          
          return matches;
        },
        { timeout }
      );
      
      return response;
      
    } catch (error) {
      console.error(`❌ API response timeout for pattern: ${urlPattern}`, error);
      return null;
    }
  }

  /**
   * Wait for page transition with comprehensive monitoring
   * Handles both SPA routing and full page navigation
   */
  static async waitForPageTransition(
    page: Page,
    options: {
      fromUrl?: string | RegExp;
      toUrl?: string | RegExp;
      timeout?: number;
      waitForLoad?: boolean;
      waitForStabilization?: boolean;
    } = {}
  ) {
    const { 
      fromUrl,
      toUrl,
      timeout = 20000,
      waitForLoad = true,
      waitForStabilization = true
    } = options;
    
    const startTime = Date.now();
    const initialUrl = page.url();
    
    console.log(`⏳ Waiting for page transition from: ${initialUrl}`);
    
    try {
      // Wait for URL change
      if (toUrl) {
        await page.waitForURL(toUrl, { timeout: timeout / 2 });
        console.log(`✅ URL changed to: ${page.url()}`);
      } else {
        // Wait for any URL change
        await page.waitForFunction(
          (initial) => window.location.href !== initial,
          initialUrl,
          { timeout: timeout / 2 }
        );
        console.log(`✅ URL changed to: ${page.url()}`);
      }
      
      // Wait for page to load
      if (waitForLoad) {
        await page.waitForLoadState('domcontentloaded', { 
          timeout: Math.max(1000, timeout - (Date.now() - startTime))
        });
        
        // Try network idle but don't fail if it times out
        try {
          await page.waitForLoadState('networkidle', { timeout: 3000 });
        } catch {
          console.log('⚠️ Network still active after transition');
        }
      }
      
      // Wait for React stabilization
      if (waitForStabilization) {
        await this.waitForReactStabilization(page, {
          timeout: Math.max(1000, timeout - (Date.now() - startTime))
        });
      }
      
      console.log('✅ Page transition completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Page transition timeout:', error);
      return false;
    }
  }

  /**
   * Utility function for intelligent delays based on operation type
   */
  static async smartDelay(
    page: Page,
    operationType: 'typing' | 'clicking' | 'navigation' | 'api' | 'custom',
    customMs?: number
  ) {
    const delays = {
      typing: 100,      // Between keystrokes
      clicking: 300,    // After clicks
      navigation: 1000, // After navigation
      api: 500,         // After API calls
      custom: customMs || 500
    };
    
    const delayMs = delays[operationType];
    await page.waitForTimeout(delayMs);
  }

  /**
   * Debug helper - log current page state
   */
  static async logPageState(page: Page, context: string = '') {
    const state = {
      context,
      url: page.url(),
      title: await page.title().catch(() => 'Unknown'),
      readyState: await page.evaluate(() => document.readyState).catch(() => 'Unknown'),
      timestamp: new Date().toISOString(),
      viewportSize: page.viewportSize(),
      userAgent: await page.evaluate(() => navigator.userAgent).catch(() => 'Unknown')
    };
    
    console.log('📋 Page State Debug:', JSON.stringify(state, null, 2));
    return state;
  }
}