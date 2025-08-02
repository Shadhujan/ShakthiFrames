export interface TestUser {
    name: string;
    email: string;
    password: string;
  }
  
  export interface TestProduct {
    name: string;
    description: string;
    price: number;
    category: string;
  }
  
  // Generate unique test data for each test run
  export class TestDataFactory {
    private static counter = 0;
  
    static generateUser(): TestUser {
      this.counter++;
      return {
        name: `Test User ${this.counter}`,
        email: `testuser${this.counter}${Date.now()}@example.com`,
        password: 'TestPass@123'
      };
    }
  
      static getValidUser(): TestUser {
    return {
      name: 'Henry Wick',
      email: `henrywick${Date.now()}@gmail.com`,
      password: 'Henry@123'
    };
  }
  
    static getInvalidEmailUser(): TestUser {
      return {
        name: 'Test User',
        email: 'invalid-email-format', // Missing @
        password: 'TestPass@123'
      };
    }
  
    static getInvalidPasswordUser(): TestUser {
      return {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Wrong@123'
      };
    }
  
    static getTestProduct(): TestProduct {
      return {
        name: 'Classic Gold Frame',
        description: 'Elegant gold frame perfect for portraits',
        price: 29.99,
        category: 'Frames'
      };
    }
  }