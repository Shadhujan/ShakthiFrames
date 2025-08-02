// tests/utils/mock-helpers.ts
import { Page, Route } from '@playwright/test';

export class MockHelper {
  /**
   * Setup Stripe payment processing mock
   * This prevents real payment charges during testing
   */
  static async setupPaymentMock(page: Page) {
    // Mock Stripe API calls
    await page.route('**/stripe/**', async (route: Route) => {
      const url = route.request().url();
      
      if (url.includes('payment_intents')) {
        // Mock payment intent creation
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: `pi_mock_${Date.now()}`,
            status: 'succeeded',
            amount: 2999,
            currency: 'usd',
            client_secret: `pi_mock_${Date.now()}_secret_test`
          })
        });
      } else if (url.includes('confirm')) {
        // Mock payment confirmation
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'succeeded',
            payment_method: 'card',
            receipt_url: 'https://pay.stripe.com/receipts/mock_receipt'
          })
        });
      } else {
        // Default success response for other Stripe calls
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Mock Stripe response'
          })
        });
      }
    });

    console.log('Stripe payment mock setup complete');
  }

  /**
   * Setup email service mock
   * Prevents actual emails being sent during testing
   */
  static async setupEmailMock(page: Page) {
    // Mock email sending endpoints
    await page.route('**/api/v1/send-email', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          messageId: `mock_email_${Date.now()}`
        })
      });
    });

    // Mock any other email-related endpoints
    await page.route('**/api/v1/contact', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Contact form submitted successfully'
        })
      });
    });

    console.log('Email service mock setup complete');
  }

  /**
   * Setup Cloudinary image upload mock
   * Prevents actual file uploads during testing
   */
  static async setupImageUploadMock(page: Page) {
    await page.route('**/cloudinary/**', async (route: Route) => {
      const url = route.request().url();
      
      if (url.includes('upload')) {
        // Mock successful image upload
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            public_id: `mock_image_${Date.now()}`,
            secure_url: `https://res.cloudinary.com/mock/image/upload/v1234567890/mock_image_${Date.now()}.jpg`,
            width: 800,
            height: 600,
            format: 'jpg',
            bytes: 123456
          })
        });
      } else {
        // Default success for other Cloudinary operations
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Mock Cloudinary response'
          })
        });
      }
    });

    console.log('Image upload mock setup complete');
  }

  /**
   * Setup Google AI chatbot mock
   * Provides predictable chatbot responses for testing
   */
  static async setupChatbotMock(page: Page) {
    await page.route('**/api/v1/chatbot/**', async (route: Route) => {
      const requestBody = route.request().postDataJSON();
      const userMessage = requestBody?.message || '';

      // Provide predictable responses based on user input
      let botResponse = 'Thank you for your message. How can I help you with your framing needs?';
      
      if (userMessage.toLowerCase().includes('price')) {
        botResponse = 'Our frames range from $19.99 to $49.99 depending on size and material.';
      } else if (userMessage.toLowerCase().includes('shipping')) {
        botResponse = 'We offer free shipping on orders over $50 and standard shipping takes 3-5 business days.';
      } else if (userMessage.toLowerCase().includes('return')) {
        botResponse = 'We have a 30-day return policy for all our products. Items must be in original condition.';
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          reply: botResponse,
          timestamp: new Date().toISOString()
        })
      });
    });

    console.log('Chatbot mock setup complete');
  }

  /**
   * Setup comprehensive mocks for all external services
   * Call this once per test to mock all external dependencies
   */
  static async setupAllMocks(page: Page) {
    await this.setupPaymentMock(page);
    await this.setupEmailMock(page);
    await this.setupImageUploadMock(page);
    await this.setupChatbotMock(page);
    
    console.log('All external service mocks setup complete');
  }

  /**
   * Setup network failure mocks for error testing
   */
  static async setupNetworkFailureMocks(page: Page) {
    // Mock network failures for testing error handling
    await page.route('**/api/v1/**', async (route: Route) => {
      const url = route.request().url();
      
      if (url.includes('fail-test')) {
        // Simulate network failure
        await route.abort('failed');
      } else {
        // Let other requests pass through
        await route.continue();
      }
    });

    console.log('Network failure mocks setup complete');
  }

  /**
   * Setup slow response mocks for performance testing
   */
  static async setupSlowResponseMocks(page: Page, delayMs: number = 5000) {
    await page.route('**/api/v1/**', async (route: Route) => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, delayMs));
      await route.continue();
    });

    console.log(`Slow response mock setup complete with ${delayMs}ms delay`);
  }

  /**
   * Clear all route mocks
   */
  static async clearAllMocks(page: Page) {
    await page.unrouteAll();
    console.log('All mocks cleared');
  }
}