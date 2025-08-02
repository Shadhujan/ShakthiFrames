// tests/utils/auth-helpers.ts
import { Page } from '@playwright/test';
import { LoginPage } from '../fixtures/page-objects/login-page';
import { TestUser } from '../fixtures/test-data';

// Define proper types for API responses
interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface ApiSuccessResponse {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
}

export class AuthHelper {
  /**
   * Login user via UI (for testing the login flow itself)
   */
  static async loginUser(page: Page, user: TestUser) {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginUser(user.email, user.password);

     // Wait for redirect after successful login - update expected URL
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
  }

  /**
   * Create user via API then login via UI 
   */
  static async createAndLoginUser(page: Page, user: TestUser) {
    // First register the user via API (faster than UI)
    await this.registerUserViaAPI(user);
    
    // Then login via UI (to test the actual login flow)
    await this.loginUser(page, user);
  }

  /**
   * Register user via API call (bypasses UI for setup speed)
   */
  static async registerUserViaAPI(user: TestUser): Promise<ApiSuccessResponse> {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${serverUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
      }

      const userData = await response.json() as ApiSuccessResponse;
      console.log(`Test user registered successfully: ${user.email}`);
      return userData;
    } catch (error) {
      console.error('API registration error:', error);
      throw error;
    }
  }

  /**
   * Login user via API and return JWT token
   */
  static async loginUserViaAPI(user: TestUser): Promise<string> {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${serverUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
      }

      const data = await response.json() as ApiSuccessResponse;
      if (!data.token) {
        throw new Error('No token received from login API');
      }
      return data.token;
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  }

  /**
   * Setup authenticated page state using Playwright's addInitScript
   */
  static async setupAuthenticatedState(page: Page, user: TestUser) {
    try {
      // Get JWT token
      const token = await this.loginUserViaAPI(user);
      
      // Set token in browser storage using Playwright's addInitScript
      await page.addInitScript((token) => {
        window.localStorage.setItem('authToken', token);
      }, token);

      // Set user data in browser storage
      await page.addInitScript((userData) => {
        window.localStorage.setItem('userData', JSON.stringify(userData));
      }, { name: user.name, email: user.email, role: 'customer' });
    } catch (error) {
      console.error('Setup authenticated state error:', error);
      throw error;
    }
  }

  /**
   * Clear authentication state from browser
   */
  static async clearAuthState(page: Page) {
    await page.evaluate(() => {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('userData');
      window.sessionStorage.clear();
    });
  }

  /**
   * Check if user is authenticated in the browser
   */
  static async isAuthenticated(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      const token = window.localStorage.getItem('authToken');
      const userData = window.localStorage.getItem('userData');
      return !!(token && userData);
    });
  }

  /**
   * Create admin user for admin-specific tests
   */
  static async createAdminUser(adminData: { name: string; email: string; password: string }): Promise<ApiSuccessResponse> {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${serverUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adminData,
          role: 'admin' // This might need to be set differently in your system
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.message || `Admin user creation failed: ${response.statusText}`);
      }

      const userData = await response.json() as ApiSuccessResponse;
      console.log(`Admin user created successfully: ${adminData.email}`);
      return userData;
    } catch (error) {
      console.error('Admin user creation error:', error);
      throw error;
    }
  }
}