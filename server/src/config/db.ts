// server/src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    
    // ✅ Enhanced logging for database connection verification
    const dbName = conn.connection.db?.databaseName;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${dbName}`);
    
    // ✅ Test mode verification and warning system
    if (process.env.NODE_ENV === 'test') {
      if (dbName === 'spf_test') {
        console.log('✅ TEST MODE: Successfully connected to SPF_TEST database');
        console.log('✅ Your production data is completely protected');
      } else {
        console.log('❌ TEST MODE WARNING: Connected to non-test database!');
        console.log(`❌ Expected: spf_test, Got: ${dbName}`);
        console.log('❌ This could affect production data - check environment configuration');
      }
    } else {
      console.log(`🔧 DEVELOPMENT MODE: Connected to ${dbName} database`);
    }
    
  } catch (error: any) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;