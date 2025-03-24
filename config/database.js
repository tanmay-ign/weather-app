const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Mongoose connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  family: 4  // Use IPv4, avoid IPv6 issues
};

// Connect to MongoDB with retry mechanism
const connectDatabase = async (retries = 5, delay = 5000) => {
  try {
    const uri = process.env.MONGO_URI;
  } catch (error) {
    if (retries > 1) {
      console.log(`Failed to connect to MongoDB. Retrying in ${delay}ms...`);
      await connectDatabase(retries - 1, delay);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts:', error);
      process.exit(1);
    }
  }
};

module.exports = { connectDatabase }; 