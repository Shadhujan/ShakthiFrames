// tests/utils/database-helpers.ts
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { loadTestEnvironment, getMongoTestUri } from './env-loader';

// Define interfaces for better type safety
interface TestUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stockStatus: string;
}

export class DatabaseHelper {
  private static connection: mongoose.Connection | null = null;
  private static isEnvironmentLoaded = false;

  /**
   * Initialize environment and connect to test database
   */
  static async connect() {
    try {
      // Load environment variables if not already loaded
      if (!this.isEnvironmentLoaded) {
        loadTestEnvironment();
        this.isEnvironmentLoaded = true;
      }

      if (!this.connection) {
        // Get MongoDB URI with validation
        const mongoUri = getMongoTestUri();
        
        console.log('🔌 Connecting to test database...');
        await mongoose.connect(mongoUri);
        this.connection = mongoose.connection;
        
        // Add error handling for connection
        if (this.connection) {
          this.connection.on('error', (error) => {
            console.error('❌ Database connection error:', error);
          });
          
          this.connection.on('connected', () => {
            console.log('✅ Connected to test database:', this.connection?.db?.databaseName);
          });
          
          this.connection.on('disconnected', () => {
            console.log('📡 Disconnected from test database');
          });
        }
        
        // Verify we're using test database
        await this.verifyTestDatabase();
      }
    } catch (error) {
      console.error('❌ Failed to connect to test database:', error);
      
      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('MONGODB_TEST_URI')) {
          console.log('💡 Solution: Create tests/.env file with:');
          console.log('MONGODB_TEST_URI=mongodb+srv://jrsemini:O6FJk65jyUfSTOTo@spf-ecommerce-mern.ert4vda.mongodb.net/spf_test?retryWrites=true&w=majority&appName=spf-ecommerce-mern');
        } else if (error.message.includes('connect')) {
          console.log('💡 Possible solutions:');
          console.log('1. Check your internet connection');
          console.log('2. Verify Atlas IP whitelist includes your IP');
          console.log('3. Confirm Atlas cluster is running');
          console.log('4. Check connection string credentials');
        }
      }
      
      throw error;
    }
  }

  /**
   * Clean up all test data after each test
   */
  static async cleanup() {
    if (this.connection && this.connection.db) {
      try {
        const collections = await this.connection.db.collections();
        
        console.log(`🧹 Cleaning up ${collections.length} collections...`);
        
        for (const collection of collections) {
          await collection.deleteMany({});
        }
        
        console.log('✅ Database cleaned up successfully');
      } catch (error) {
        console.error('❌ Database cleanup error:', error);
      }
    }
  }

  /**
   * Disconnect from test database
   */
  static async disconnect() {
    if (this.connection) {
      try {
        await mongoose.disconnect();
        this.connection = null;
        console.log('📡 Disconnected from test database');
      } catch (error) {
        console.error('❌ Error disconnecting from database:', error);
      }
    }
  }

  /**
   * Seed test data (products, admin users, etc.)
   */
  static async seedTestData() {
    try {
      console.log('🌱 Seeding test data...');
      
      // Create test products for search functionality
      const testProducts: ProductData[] = [
        {
          name: 'Classic Gold Frame',
          description: 'Elegant gold frame perfect for portraits',
          price: 29.99,
          category: 'Frames',
          images: ['https://example.com/gold-frame.jpg'],
          stockStatus: 'In Stock'
        },
        {
          name: 'Modern Silver Frame',
          description: 'Contemporary silver frame for modern decor',
          price: 24.99,
          category: 'Frames',
          images: ['https://example.com/silver-frame.jpg'],
          stockStatus: 'In Stock'
        },
        {
          name: 'Wooden Rustic Frame',
          description: 'Rustic wooden frame for vintage photos',
          price: 34.99,
          category: 'Frames',
          images: ['https://example.com/wooden-frame.jpg'],
          stockStatus: 'In Stock'
        }
      ];

      // Create products collection manually if models not available
      try {
        const db = this.connection?.db;
        if (db) {
          const productsCollection = db.collection('products');
          
          for (const productData of testProducts) {
            const existingProduct = await productsCollection.findOne({ name: productData.name });
            if (!existingProduct) {
              await productsCollection.insertOne({
                ...productData,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
          
          console.log('✅ Test products seeded successfully');
        }
      } catch (seedError) {
        console.warn('⚠️ Could not seed test products (this is optional):', seedError);
      }
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      // Don't throw here as this is optional setup
    }
  }

  /**
   * Create a test user directly in database
   */
  static async createTestUser(userData: TestUserData) {
    try {
      const db = this.connection?.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      
      const usersCollection = db.collection('users');
      const hashedPassword = await bcryptjs.hash(userData.password, 12);
      
      const user = await usersCollection.insertOne({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'customer',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Test user created: ${userData.email}`);
      return user;
    } catch (error) {
      console.error('❌ Error creating test user:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  static isConnected(): boolean {
    return this.connection !== null && mongoose.connection.readyState === 1;
  }

  /**
   * Get test database statistics
   */
  static async getStats() {
    if (this.connection && this.connection.db) {
      try {
        const stats = await this.connection.db.stats();
        return stats;
      } catch (error) {
        console.error('❌ Error getting database stats:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Verify test database is separate from production
   */
  static async verifyTestDatabase() {
    if (this.connection && this.connection.db) {
      const dbName = this.connection.db.databaseName;
      
      if (!dbName.includes('test') && !dbName.includes('Test')) {
        console.warn(
          `⚠️ WARNING: Database name "${dbName}" does not appear to be a test database. ` +
          `Ensure you're using a test database to avoid data corruption.`
        );
      } else {
        console.log(`✅ Using test database: ${dbName}`);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Test the database connection
   */
  static async testConnection() {
    try {
      await this.connect();
      const stats = await this.getStats();
      
      if (stats) {
        console.log('✅ Database connection test successful');
        console.log(`📊 Database stats: ${stats.collections} collections, ${stats.objects} objects`);
        return true;
      } else {
        console.log('⚠️ Connected but could not retrieve stats');
        return true;
      }
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }
}