const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found. Please add it to your environment variables.');
  process.exit(1);
}

const connectToMongoDB = async () => {
  console.log('Attempting to connect to MongoDB...');

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production', // Safe dev fallback
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ Connected to MongoDB at: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB servers. Check your URI or Atlas settings.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error. Verify your internet connection or DNS settings.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('MongoDB hostname not found. Double-check the cluster hostname.');
    } else if (error.message.includes('authentication failed')) {
      console.error('Authentication failed. Verify username and password.');
    }

    throw error;
  }
};

module.exports = { connectToMongoDB, mongoose };
