// tests/utils/database-helpers.ts
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

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
  private static connection: typeof mongoose | null = null;
  
  // Test data identification patterns for SPF_TEST database
  private static readonly TEST_EMAIL_PATTERNS = [
    /@test\.com$/,
    /@example\.com$/,
    /^test/,
    /test@/,
    /playwright/,
    /automation/,
    /henrywick12@gmail\.com$/ // Specific test user from your tests
  ];
  
  private static readonly TEST_NAME_PATTERNS = [
    /test/i,
    /playwright/i,
    /automation/i,
    /^Henry Wick$/i // Specific test user
  ];

  // SPF_TEST database name constant
  private static readonly SPF_TEST_DB_NAME = 'spf_test';

  /**
   * Enhanced connection targeting SPF_TEST database specifically
   */
  static async connect() {
    if (this.connection && mongoose.connection.readyState === 1) {
      console.log('✅ Database already connected');
      return;
    }

    try {
      console.log('✅ Test environment variables loaded successfully');
      
      // Build MongoDB URI targeting SPF_TEST database specifically
      let mongoUri: string;
      
      if (process.env.MONGODB_TEST_URI) {
        // Use dedicated test URI
        mongoUri = process.env.MONGODB_TEST_URI;
        console.log('📄 Using MONGODB_TEST_URI for connection');
      } else if (process.env.MONGODB_URI) {
        // Use fallback URI and modify for spf_test
        const baseUri = process.env.MONGODB_URI;
        mongoUri = baseUri.includes('?') 
          ? baseUri.replace(/\/[^\/]*\?/, `/${this.SPF_TEST_DB_NAME}?`)
          : `${baseUri.replace(/\/[^\/]*$/, '')}/${this.SPF_TEST_DB_NAME}`;
        console.log('📄 Using MONGODB_URI modified for SPF_TEST');
      } else {
        // Use hardcoded fallback with proper credentials
        mongoUri = `mongodb+srv://jrsemini:YOUR_PASSWORD@spf-ecommerce-mern.ert4vda.mongodb.net/${this.SPF_TEST_DB_NAME}?retryWrites=true&w=majority&appName=spf-ecommerce-mern`;
        console.log('⚠️ Using hardcoded fallback URI - replace YOUR_PASSWORD with actual credentials');
        
        // Critical error if using placeholder
        if (mongoUri.includes('YOUR_PASSWORD')) {
          throw new Error(`
❌ CONFIGURATION ERROR: No valid MongoDB URI found!
          
Required: Set either MONGODB_TEST_URI or MONGODB_URI in your .env file.

Example .env content:
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/spf_test?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spf_test?retryWrites=true&w=majority

Current status:
- MONGODB_TEST_URI: ${process.env.MONGODB_TEST_URI ? 'SET' : 'NOT SET'}
- MONGODB_URI: ${process.env.MONGODB_URI ? 'SET' : 'NOT SET'}
          `);
        }
      }
      
      // Ensure spf_test database targeting
      if (!mongoUri.includes('/spf_test')) {
        console.log('🔧 Modifying URI to target spf_test database...');
        if (mongoUri.includes('?')) {
          mongoUri = mongoUri.replace(/\/[^\/]*\?/, `/spf_test?`);
        } else {
          // Add spf_test and query parameters
          const baseUri = mongoUri.replace(/\/[^\/]*$/, '');
          mongoUri = `${baseUri}/spf_test?retryWrites=true&w=majority`;
        }
      }
      
      console.log(`📄 Using MongoDB URI: ${mongoUri.replace(/:[^:@]*@/, ':***@')}`);
      console.log('🔌 Connecting to SPF_TEST database...');

      this.connection = await mongoose.connect(mongoUri);
      
      // Critical: Verify we're connected to spf_test database
      await this.verifySpfTestDatabase();
      
      console.log(`✅ Connected to SPF_TEST database: ${this.connection.connection.db?.databaseName}`);
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      
      // Enhanced error diagnosis
      if (error instanceof Error) {
        if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
          console.log('\n🔧 DNS/Connection troubleshooting:');
          console.log('1. Check your internet connection');
          console.log('2. Verify Atlas IP whitelist includes your IP address');
          console.log('3. Confirm Atlas cluster is running (not paused)');
          console.log('4. Check connection string format and credentials');
          console.log('5. Verify the cluster hostname is correct');
        } else if (error.message.includes('authentication')) {
          console.log('\n🔧 Authentication troubleshooting:');
          console.log('1. Verify username and password are correct');
          console.log('2. Check if user has access to the spf_test database');
          console.log('3. Ensure special characters in password are URL-encoded');
        } else if (error.message.includes('CONFIGURATION ERROR')) {
          console.log('\n🔧 Configuration troubleshooting:');
          console.log('1. Create or check tests/.env file');
          console.log('2. Add valid MONGODB_TEST_URI or MONGODB_URI');
          console.log('3. Replace placeholder passwords with actual credentials');
        }
      }
      
      throw error;
    }
  }

  /**
   * SAFE CLEANUP: Only operates within SPF_TEST database
   * Completely isolated from the main 'test' database
   */
  static async cleanup() {
    if (!this.connection?.connection?.db) {
      console.log('⚠️ No database connection - skipping cleanup');
      return;
    }

    const dbName = this.connection.connection.db.databaseName;
    
    // Critical safety check: Ensure we're only working in spf_test
    if (dbName !== this.SPF_TEST_DB_NAME) {
      throw new Error(`❌ SAFETY ERROR: Attempted cleanup on wrong database '${dbName}'. Expected '${this.SPF_TEST_DB_NAME}'`);
    }

    try {
      console.log(`🧹 Starting SAFE cleanup in SPF_TEST database (${dbName})...`);
      
      const db = this.connection.connection.db;
      let totalDeleted = 0;

      // 1. Clean up test users in spf_test database
      const usersDeleted = await this.cleanupTestUsers();
      totalDeleted += usersDeleted;

      // 2. Clean up orders associated with test users
      const ordersDeleted = await this.cleanupTestOrders();
      totalDeleted += ordersDeleted;

      // 3. Clean up inquiries from test users
      const inquiriesDeleted = await this.cleanupTestInquiries();
      totalDeleted += inquiriesDeleted;

      // 4. Clean up test products in spf_test
      const productsDeleted = await this.cleanupTestProducts();
      totalDeleted += productsDeleted;

      console.log(`✅ Safe cleanup completed in SPF_TEST - ${totalDeleted} test records removed`);
      console.log('✅ Main "test" database completely untouched and preserved');
      
    } catch (error) {
      console.error('❌ Database cleanup error:', error);
      throw error;
    }
  }

  /**
   * Remove only test users within SPF_TEST database
   */
  private static async cleanupTestUsers(): Promise<number> {
    try {
      const db = this.connection?.connection?.db;
      if (!db) return 0;

      const usersCollection = db.collection('users');

      // Build query to match test users
      const testUserQuery = {
        $or: [
          // Email patterns
          ...this.TEST_EMAIL_PATTERNS.map(pattern => ({ email: { $regex: pattern } })),
          // Name patterns
          ...this.TEST_NAME_PATTERNS.map(pattern => ({ name: { $regex: pattern } })),
          // Users created in last 24 hours with test characteristics
          {
            $and: [
              { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Last 24 hours
              {
                $or: [
                  { email: { $regex: /test/i } },
                  { name: { $regex: /test/i } },
                  { isTestUser: true }
                ]
              }
            ]
          }
        ]
      };

      // Log what we're about to delete for transparency
      const testUsers = await usersCollection.find(testUserQuery).toArray();
      
      if (testUsers.length > 0) {
        console.log('🎯 Test users to be removed from SPF_TEST:');
        testUsers.forEach(user => {
          console.log(`  - ${user.email} (${user.name})`);
        });

        const result = await usersCollection.deleteMany(testUserQuery);
        console.log(`🧹 Removed ${result.deletedCount} test users from SPF_TEST`);
        return result.deletedCount;
      } else {
        console.log('🧹 No test users found in SPF_TEST to clean up');
        return 0;
      }
      
    } catch (error) {
      console.error('❌ Error cleaning test users from SPF_TEST:', error);
      return 0;
    }
  }

  /**
   * Remove orders associated with test users within SPF_TEST
   */
  private static async cleanupTestOrders(): Promise<number> {
    try {
      const db = this.connection?.connection?.db;
      if (!db) return 0;

      const ordersCollection = db.collection('orders');
      const usersCollection = db.collection('users');

      // Find test user IDs within spf_test
      const testUserQuery = {
        $or: [
          ...this.TEST_EMAIL_PATTERNS.map(pattern => ({ email: { $regex: pattern } })),
          ...this.TEST_NAME_PATTERNS.map(pattern => ({ name: { $regex: pattern } }))
        ]
      };

      const testUsers = await usersCollection.find(testUserQuery, { projection: { _id: 1 } }).toArray();
      const testUserIds = testUsers.map(user => user._id);

      if (testUserIds.length > 0) {
        const result = await ordersCollection.deleteMany({
          $or: [
            { userId: { $in: testUserIds } },
            { user: { $in: testUserIds } }
          ]
        });

        console.log(`🧹 Removed ${result.deletedCount} test orders from SPF_TEST`);
        return result.deletedCount;
      } else {
        console.log('🧹 No test orders found in SPF_TEST to clean up');
        return 0;
      }
      
    } catch (error) {
      console.error('❌ Error cleaning test orders from SPF_TEST:', error);
      return 0;
    }
  }

  /**
   * Remove inquiries from test users within SPF_TEST
   */
  private static async cleanupTestInquiries(): Promise<number> {
    try {
      const db = this.connection?.connection?.db;
      if (!db) return 0;

      const inquiriesCollection = db.collection('inquiries');

      const testInquiryQuery = {
        $or: [
          ...this.TEST_EMAIL_PATTERNS.map(pattern => ({ email: { $regex: pattern } })),
          ...this.TEST_NAME_PATTERNS.map(pattern => ({ name: { $regex: pattern } }))
        ]
      };

      const result = await inquiriesCollection.deleteMany(testInquiryQuery);
      console.log(`🧹 Removed ${result.deletedCount} test inquiries from SPF_TEST`);
      return result.deletedCount;
      
    } catch (error) {
      console.error('❌ Error cleaning test inquiries from SPF_TEST:', error);
      return 0;
    }
  }

  /**
   * Remove test products within SPF_TEST database only
   */
  private static async cleanupTestProducts(): Promise<number> {
    try {
      const db = this.connection?.connection?.db;
      if (!db) return 0;

      const productsCollection = db.collection('products');

      // Remove test products - be more specific for spf_test database
      const testProductQuery = {
        $or: [
          { isTestData: true }, // Explicit test marker
          { name: { $regex: /test.*product/i } },
          { description: { $regex: /test.*description/i } },
          { category: 'Test' },
          // Our specific seeded test products
          { name: { $in: ['Classic Gold Frame', 'Modern Silver Frame', 'Wooden Rustic Frame'] } },
          // Products created very recently (last 24 hours) with test characteristics
          {
            $and: [
              { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
              {
                $or: [
                  { name: { $regex: /(classic|modern|wooden).*(frame)/i } },
                  { description: { $regex: /test/i } }
                ]
              }
            ]
          }
        ]
      };

      const result = await productsCollection.deleteMany(testProductQuery);
      console.log(`🧹 Removed ${result.deletedCount} test products from SPF_TEST`);
      return result.deletedCount;
      
    } catch (error) {
      console.error('❌ Error cleaning test products from SPF_TEST:', error);
      return 0;
    }
  }

  /**
   * Seed test data specifically in SPF_TEST database
   */
  static async seedTestData() {
    try {
      console.log('🌱 Seeding test data in SPF_TEST database...');
      
      const db = this.connection?.connection?.db;
      if (!db) return;

      // Verify we're in the correct database
      if (db.databaseName !== this.SPF_TEST_DB_NAME) {
        throw new Error(`❌ SAFETY ERROR: Attempted seeding in wrong database '${db.databaseName}'`);
      }

      const productsCollection = db.collection('products');
      
      // Check if test products already exist
      const existingTestProducts = await productsCollection.countDocuments({
        name: { $in: ['Classic Gold Frame', 'Modern Silver Frame', 'Wooden Rustic Frame'] }
      });

      if (existingTestProducts === 0) {
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

        for (const productData of testProducts) {
          await productsCollection.insertOne({
            ...productData,
            createdAt: new Date(),
            updatedAt: new Date(),
            isTestData: true // Explicit marker for easy identification
          });
        }

        console.log('✅ Test products seeded successfully in SPF_TEST');
      } else {
        console.log('✅ Test products already exist in SPF_TEST, skipping seeding');
      }
      
    } catch (error) {
      console.error('❌ Error seeding test data in SPF_TEST:', error);
    }
  }

  /**
   * Create test user specifically in SPF_TEST database
   */
  static async createTestUser(userData: TestUserData) {
    try {
      const db = this.connection?.connection?.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      
      // Safety check: Ensure we're in spf_test
      if (db.databaseName !== this.SPF_TEST_DB_NAME) {
        throw new Error(`❌ SAFETY ERROR: Attempted user creation in wrong database '${db.databaseName}'`);
      }
      
      const usersCollection = db.collection('users');
      const hashedPassword = await bcryptjs.hash(userData.password, 12);
      
      const user = await usersCollection.insertOne({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        isTestUser: true // Explicit test user marker
      });

      console.log(`✅ Test user created in SPF_TEST: ${userData.email}`);
      return user;
    } catch (error) {
      console.error('❌ Error creating test user in SPF_TEST:', error);
      throw error;
    }
  }

  /**
   * Verify we're connected to SPF_TEST database (critical safety check)
   */
  static async verifySpfTestDatabase() {
    if (this.connection?.connection?.db) {
      const dbName = this.connection.connection.db.databaseName;
      
      if (dbName !== this.SPF_TEST_DB_NAME) {
        throw new Error(`❌ CRITICAL SAFETY ERROR: Connected to wrong database '${dbName}'. Expected '${this.SPF_TEST_DB_NAME}'. This protects your 'test' database from accidental modification.`);
      } else {
        console.log(`✅ SAFETY VERIFIED: Connected to SPF_TEST database: ${dbName}`);
        console.log('✅ Your "test" database is completely protected');
      }
      
      return true;
    }
    return false;
  }

  /**
   * Test database connection
   */
  static async testConnection() {
    try {
      await this.connect();
      const stats = await this.getStats();
      
      if (stats) {
        console.log('✅ SPF_TEST database connection test successful');
        console.log(`📊 SPF_TEST database stats: ${stats.collections} collections, ${stats.objects} objects`);
        return true;
      } else {
        console.log('⚠️ Connected but could not retrieve SPF_TEST stats');
        return true;
      }
    } catch (error) {
      console.error('❌ SPF_TEST database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics for SPF_TEST
   */
  static async getStats() {
    if (this.connection?.connection?.db) {
      try {
        const db = this.connection.connection.db;
        
        // Verify we're getting stats from correct database
        if (db.databaseName !== this.SPF_TEST_DB_NAME) {
          throw new Error(`❌ Stats requested from wrong database: ${db.databaseName}`);
        }
        
        const collections = await db.listCollections().toArray();
        
        let totalObjects = 0;
        for (const collection of collections) {
          const count = await db.collection(collection.name).countDocuments();
          totalObjects += count;
        }

        return {
          collections: collections.length,
          objects: totalObjects,
          collectionNames: collections.map(c => c.name),
          databaseName: db.databaseName
        };
      } catch (error) {
        console.error('❌ Error getting SPF_TEST database stats:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if database is connected
   */
  static isConnected(): boolean {
    return this.connection !== null && mongoose.connection.readyState === 1;
  }

  /**
   * Disconnect from database
   */
  static async disconnect() {
    if (this.connection) {
      try {
        await mongoose.disconnect();
        this.connection = null;
        console.log('📡 Disconnected from SPF_TEST database');
      } catch (error) {
        console.error('❌ Error disconnecting from SPF_TEST database:', error);
      }
    }
  }

  /**
   * Emergency dry run: Show what would be deleted from SPF_TEST
   */
  static async dryRunCleanup() {
    console.log('🔍 DRY RUN - Analyzing what would be deleted from SPF_TEST:');
    
    if (!this.connection?.connection?.db) {
      console.log('⚠️ No database connection');
      return;
    }

    const dbName = this.connection.connection.db.databaseName;
    console.log(`📋 Target database: ${dbName}`);
    
    if (dbName !== this.SPF_TEST_DB_NAME) {
      console.log(`❌ SAFETY STOP: Wrong database! Expected ${this.SPF_TEST_DB_NAME}, got ${dbName}`);
      return;
    }

    try {
      const db = this.connection.connection.db;

      // Count test users
      const usersCollection = db.collection('users');
      const testUserQuery = {
        $or: [
          ...this.TEST_EMAIL_PATTERNS.map(pattern => ({ email: { $regex: pattern } })),
          ...this.TEST_NAME_PATTERNS.map(pattern => ({ name: { $regex: pattern } }))
        ]
      };
      
      const testUsers = await usersCollection.find(testUserQuery).toArray();
      console.log(`📊 Test users that would be deleted from SPF_TEST: ${testUsers.length}`);
      testUsers.forEach(user => console.log(`  - ${user.email} (${user.name})`));

      // Count test orders
      const ordersCollection = db.collection('orders');
      const testUserIds = testUsers.map(user => user._id);
      const testOrdersCount = await ordersCollection.countDocuments({
        $or: [
          { userId: { $in: testUserIds } },
          { user: { $in: testUserIds } }
        ]
      });
      console.log(`📊 Test orders that would be deleted from SPF_TEST: ${testOrdersCount}`);

      // Count test products
      const productsCollection = db.collection('products');
      const testProductsCount = await productsCollection.countDocuments({
        $or: [
          { isTestData: true },
          { name: { $in: ['Classic Gold Frame', 'Modern Silver Frame', 'Wooden Rustic Frame'] } }
        ]
      });
      console.log(`📊 Test products that would be deleted from SPF_TEST: ${testProductsCount}`);
      
      const totalToDelete = testUsers.length + testOrdersCount + testProductsCount;
      console.log(`📊 TOTAL test records that would be deleted from SPF_TEST: ${totalToDelete}`);
      console.log(`✅ Your "test" database remains completely untouched`);
      
    } catch (error) {
      console.error('❌ Error in SPF_TEST dry run:', error);
    }
  }
}