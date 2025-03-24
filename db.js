const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MongoDB URI is missing. Set MONGO_URI in your environment variables.');
  process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB...');

const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  family: 4, // Force IPv4
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    if (error.name === 'MongoParseError') {
      console.error('⚠️ Invalid MongoDB connection string. Check your MONGO_URI.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('⚠️ Network error. Check your internet and MongoDB Atlas settings.');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('⚠️ Could not connect to MongoDB. Check if the server is online.');
    } else if (error.message.includes('authentication failed')) {
      console.error('⚠️ Authentication failed. Check your username and password.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('⚠️ MongoDB hostname not found. Check your connection string.');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
