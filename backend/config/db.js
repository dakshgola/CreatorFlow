import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using Mongoose
 * Uses connection string from environment variable MONGODB_URI
 */
const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      console.log('💡 Please create a .env file with MONGODB_URI');
      console.log('💡 Example: MONGODB_URI=mongodb://localhost:27017/creatorflow');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are recommended for Mongoose 6+
      // Remove useNewUrlParser and useUnifiedTopology as they're default in Mongoose 6+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('💡 Make sure MongoDB is running and MONGODB_URI is correct');
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
